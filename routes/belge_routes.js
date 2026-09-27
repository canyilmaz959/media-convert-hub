const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://localhost:3000';

const allowedExtensions = ['.pdf', '.docx', '.pptx', '.potx', '.odp'];
const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.template',
    'application/vnd.ms-powerpoint',
    'application/vnd.oasis.opendocument.presentation',
    'application/octet-stream'
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const clearname = path.extname(file.originalname).toLowerCase().trim();
        cb(null, Date.now() + clearname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Geçersiz dosya türü. Lütfen pdf, pptx, docx, potx veya odp formatında bir dosya yükleyin.'));
        }

        cb(null, true);
    }
});

function runPythonConversion(inputPath, outputPath, toFormat) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [
            path.join(__dirname, '../scripts/document-generate/document-main.py'),
            inputPath,
            outputPath,
            toFormat
        ]);

        pythonProcess.stderr.on('data', (data) => {
            console.log(`[Python STDERR]: ${data.toString().trim()}`);
        });

        pythonProcess.stdout.on('data', (data) => {
            console.log(`[Python STDOUT]: ${data.toString().trim()}`);
        });

        pythonProcess.on('error', (err) => {
            console.error('Python process başlatılamadı:', err.message);
            reject(err);
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python işlemi sonlandı. Kod: ${code}`);

            if (code === 0 && fs.existsSync(outputPath)) {
                resolve();
                return;
            }

            reject(new Error(`Python dönüşümü başarısız oldu. Çıkış kodu: ${code}`));
        });
    });
}

router.post('/convert', upload.single('document'), async (req, res) => {
    const toFormat = req.body.toFormat ? req.body.toFormat.toLowerCase() : '';

    if (!req.file) {
        return res.status(400).send('Lütfen bir dosya yükleyin!');
    }

    const inputPath = req.file.path;
    const sourceFormat = path.extname(req.file.originalname).toLowerCase().slice(1);
    const safename = Date.now();

    let intermediatePdfPath = null;

    try {
        /*
         * PDF zaten PDF olduğu için PDF kaynaklı dönüşümlerde Gotenberg'e
         * tekrar PDF gönderilmesi gereksizdir. Bu hem süreyi hem de RAM/CPU
         * kullanımını azaltır.
         */
        if (sourceFormat === 'pdf') {
            intermediatePdfPath = inputPath;
            console.log(`PDF kaynak dosyası doğrudan Python'a veriliyor: ${inputPath}`);
        } else {
            const outputFilename = safename + '.pdf';
            intermediatePdfPath = path.join(__dirname, '../uploads', outputFilename);

            const form = new FormData();

            form.append(
                'files',
                fs.createReadStream(inputPath),
                safename + path.extname(req.file.originalname)
            );

            console.log(`Gotenberg'e gönderiliyor: ${inputPath}`);
            console.log(`Gotenberg URL: ${GOTENBERG_URL}/forms/libreoffice/convert`);

            const response = await axios.post(
                `${GOTENBERG_URL}/forms/libreoffice/convert`,
                form,
                {
                    headers: { ...form.getHeaders() },
                    responseType: 'stream',
                    timeout: 120000
                }
            );

            console.log(`Gotenberg yanıtı: HTTP ${response.status}`);

            const writer = fs.createWriteStream(intermediatePdfPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    writer.close(resolve);
                });

                writer.on('error', (err) => {
                    writer.close();
                    reject(err);
                });
            });

            console.log('Gotenberg çıktısı basıldı:', outputFilename);

            if (fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath);
            }
        }

        if (toFormat === 'pdf') {
            return res.render('result', {
                outputPath: '/uploads/' + path.basename(intermediatePdfPath),
                outputFilename: path.basename(intermediatePdfPath),
                isImage: false
            });
        }

        const finalFileName = safename + '.' + toFormat;
        const pythonOutputPath = path.join(__dirname, '../uploads', finalFileName);

        if (!fs.existsSync(intermediatePdfPath)) {
            throw new Error(`PDF dosyası diskte bulunamadı: ${intermediatePdfPath}`);
        }

        console.log(
            `Python tetikleniyor... Girdi: ${intermediatePdfPath} -> Çıktı: ${pythonOutputPath}`
        );

        await runPythonConversion(
            intermediatePdfPath,
            pythonOutputPath,
            toFormat
        );

        if (fs.existsSync(intermediatePdfPath)) {
            fs.unlinkSync(intermediatePdfPath);
        }

        console.log(`Python dönüşümü başarıyla tamamlandı: ${finalFileName}`);

        return res.render('result', {
            outputPath: '/uploads/' + finalFileName,
            outputFilename: finalFileName,
            isImage: false
        });

    } catch (error) {
        console.error('Belge dönüşümü sırasında hata oluştu:', error.message);
        console.error(
            'Gotenberg HTTP durumu:',
            error.response?.status || 'HTTP yanıtı yok'
        );

        if (error.response?.data && typeof error.response.data === 'string') {
            console.error('Gotenberg hata yanıtı:', error.response.data);
        }

        if (fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }

        if (
            intermediatePdfPath &&
            intermediatePdfPath !== inputPath &&
            fs.existsSync(intermediatePdfPath)
        ) {
            fs.unlinkSync(intermediatePdfPath);
        }

        return res.status(500).send(
            'Dönüştürme sırasında bir hata oluştu. Lütfen tekrar deneyin.'
        );
    }
});

module.exports = router;

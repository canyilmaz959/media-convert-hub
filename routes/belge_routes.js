const express = require('express');
const router = express.Router();
const { spawn } = require ('child_process');
const fs = require('fs');
const path = require('path');
const multer = require ('multer');

const allowedExtensions = ['.pdf', '.docx', '.pptx', '.xlsx'];
const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];

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
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Geçersiz dosya türü. Lütfen pdf, pptx, docx veya xlsx formatında bir dosya yükleyin.'));
        }
        cb(null, true);
    }
});

router.post('/convert', upload.single('document'), (req, res) => {
    const fromFormat = req.body.fromFormat.toLowerCase();
    const toFormat = req.body.toFormat.toLowerCase();

    if (!req.file) return res.status(400).send("Lütfen bir dosya yükleyin!");

    const uploadsDir = '/app/uploads';
    const inputPath = path.join(uploadsDir, req.file.filename);
    const profilID = req.file.filename;
    const originalName = path.basename(req.file.filename, path.extname(req.file.filename));
    const outputFilename = originalName + '.' + toFormat;
    const outputPath = path.join(uploadsDir, outputFilename);

    setTimeout(() => {

        try{
            fs.chmodSync(inputPath, 0o777);
        } catch (chmodError) {
            console.error('Dosya izinleri değiştirilemedi:', chmodError);
        }

        const libreCmd = process.platform === 'win32' ? 'soffice' : 'libreoffice';

        const processRunner = spawn(libreCmd, [
            '--headless',
            '--invisible',
            '-env:UserInstallation=file:///tmp/libre_profile',
            '--convert-to', toFormat, inputPath,
            '--outdir', uploadsDir
        ]);

        let processError = '';

        processRunner.stderr.on('data', (data) => {
            processError += data.toString();
        });

        processRunner.stdout.on('data', (data) => {
            processError += data.toString();
        });

        processRunner.on('close', (code) => {

        setTimeout(() => {
            if ( code == 0 && fs.existsSync(outputPath)) {

                    fs.unlink(inputPath, (err) => {
                        if (err) console.error('Girdi dosyası silinemedi:', err);
                        else console.log('Girdi dosyası başarıyla silindi:', inputPath);
                    });
                

                const isImage = ['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(toFormat);

                return res.render('result', { 
                    outputPath: '/uploads/' + outputFilename,
                    outputFilename: outputFilename,
                    isImage: isImage
                });
             } else {
                
                console.error('LibreOffice çıktı üretmedi. code:', code, 'stderr:', processError);
                return res.status(500).send(`
                <div style="font-family: sans-serif; text-align: center; margin-top: 50px; color: #334155;">
                    <h2>İşlem Sırasında Bir Aksaklık Oluştu</h2>
                    <p>Lütfen farklı bir belge ile tekrar deneyin.</p>
                    <a href="/" style="color: #2563eb; text-decoration: none; font-weight: bold;">← Ana Sayfaya Dön</a>
                </div>
            `);
            }
        }, 500);
        });
    }, 200);
});


module.exports = router;
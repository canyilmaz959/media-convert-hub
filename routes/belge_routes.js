const express = require('express');
const router = express.Router();
const { spawn } = require ('child_process');
const fs = require('fs');
const path = require('path');
const multer = require ('multer');
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
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Geçersiz dosya türü. Lütfen pdf, pptx, docx, potx veya odp formatında bir dosya yükleyin.'));
        }
        cb(null, true);
    }
});

router.post('/convert', upload.single('document'), async (req, res) => {
    // DEĞİŞİKLİK: Form alanları eksik geldiğinde TypeError oluşmasını önlemek için güvenli erişim kullanıldı.
    const fromFormat = req.body.fromFormat ? req.body.fromFormat.toLowerCase() : '';
    // DEĞİŞİKLİK: Form alanları eksik geldiğinde TypeError oluşmasını önlemek için güvenli erişim kullanıldı.
    const toFormat = req.body.toFormat ? req.body.toFormat.toLowerCase() : '';

    // DEĞİŞİKLİK: Dosya kontrolü req.file kullanılmadan önce yapıldı.
    if (!req.file) return res.status(400).send("Lütfen bir dosya yükleyin!");

    const inputPath = req.file.path;
    // DEĞİŞİKLİK: Kullanılmayan originalName değişkeni kaldırıldı.
    const safename = Date.now();

    const outputFilename = safename + '.' + 'pdf';
    const outputPath = path.join(__dirname, '../uploads', outputFilename);

    try{
        const form = new FormData();

        form.append('files', fs.createReadStream(inputPath), safename + path.extname(req.file.originalname));
        // DEĞİŞİKLİK: req.file.safename mevcut olmadığı için undefined yazıyordu; gerçek dosya bilgisi loglanıyor.
        console.log(`Gotenberg'e gönderiliyor: ${inputPath}`);
        // DEĞİŞİKLİK: Hangi Gotenberg adresine istek gönderildiğini tespit etmek için endpoint loglandı.
        console.log(`Gotenberg URL: ${GOTENBERG_URL}/forms/libreoffice/convert`);

        const response = await axios.post(`${GOTENBERG_URL}/forms/libreoffice/convert`, form, {
            headers: {...form.getHeaders() },
            responseType: 'stream',
            // DEĞİŞİKLİK: Axios timeout'u 60 saniyelik k6 beklemesinden bağımsız olarak gerçek isteğin davranışını görmek için 120 saniyeye çıkarıldı.
            timeout: 120000
        });

        // DEĞİŞİKLİK: Gotenberg HTTP durumunun hata ayıklamada görünmesi için log eklendi.
        console.log(`Gotenberg yanıtı: HTTP ${response.status}`);

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) =>{
            writer.on('finish', () => {
                writer.close(() => {
                    resolve();
                });
            });
            writer.on('error', (err) => {
                writer.close();
                reject(err);
            });
        });

        console.log('çıktı dosyası basıldı:', outputFilename);

        if(fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);          
        }

        if (toFormat === 'pdf') {
            return res.render('result', {
                outputPath: '/uploads/' + outputFilename,
                outputFilename: outputFilename,
                isImage: false
            });
        } else {

            const python_input_path = outputPath;
            const final_file_name = safename + '.' + toFormat;
            const python_output_path = path.join(__dirname, '../uploads', final_file_name);

            if(!fs.existsSync(python_input_path)){
                throw new Error(`pdf dosyası diskte bulunamadı: ${python_input_path}`)
            }
            console.log(`Python Tetikleniyor... Girdi: ${python_input_path} -> Çıktı: ${python_output_path}`);

            const pythonProcess = spawn('python3', [
                path.join(__dirname, '../scripts/document-generate/document-main.py'),
                python_input_path,
                python_output_path,
                toFormat
            ]);

            pythonProcess.stderr.on('data', (data) =>{
                console.log(`[Python STDERR]: ${data.toString().trim()}`);
            });

            pythonProcess.stdout.on('data', (data) =>{
                console.log(`[Python STDOUT]: ${data.toString().trim()}`);
            });

            pythonProcess.on('error', (err) => {
                console.log("python process tetiklenemedi", err.message);
                return res.status(500).send("dönüştürme motoru başlatılamadı")
            });

            pythonProcess.on('close', (code) => {
                if (fs.existsSync(python_input_path)){
                    fs.unlinkSync(python_input_path);
                }

                if (code == 0 && fs.existsSync(python_output_path)){
                    console.log(`python dönüşümü başarıyla tamamlandı.${final_file_name}`);

                    return res.render('result', {
                        outputPath: '/uploads/' +  final_file_name,
                        outputFilename: final_file_name,
                        isImage: false
                    });

                } else {
                    console.error(`Python scripti hata koduyla kapandı: ${code}`);
                    return res.status(500).send("Python çapraz dönüşüm motoru başarısız oldu.");
                }
            })
        }

    } catch (error) {
        // DEĞİŞİKLİK: Gotenberg'in 429 gibi HTTP hatalarında durum kodu, durum metni ve yanıt gövdesi loglanarak gerçek hata kaynağı görünür hale getirildi.
        console.error('Gotenberg ile dönüştürme sırasında hata oluştu:', error.message);
        // DEĞİŞİKLİK: HTTP durum kodunu ayrıca loglamak 429 rate-limit durumunu doğrudan tespit etmeyi sağlar.
        console.error('Gotenberg HTTP durumu:', error.response?.status || 'HTTP yanıtı yok');
        // DEĞİŞİKLİK: Gotenberg'in döndürdüğü hata detaylarını görmek için yanıt verisi loglandı.
        if (error.response?.data && typeof error.response.data !== 'string') {
            console.error('Gotenberg hata yanıtı:', error.response.data);
        }

        if(fs.existsSync(inputPath)) {fs.unlinkSync(inputPath);}
        if(fs.existsSync(outputPath)) {fs.unlinkSync(outputPath);}

        return res.status(500).send("Dönüştürme sırasında bir hata oluştu. Lütfen tekrar deneyin.");

    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { filesize: 10 *1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error('Geçersiz dosya türü. Lütfen jpg, png, svg veya webp formatında bir dosya yükleyin.'));
        }
        cb(null, true);
    }
});

router.post('/convert', upload.single('image'), (req, res) => {
    const fromFormat = req.body.fromFormat.toLowerCase();
    const toFormat = req.body.toFormat.toLowerCase();
    
    if (!req.file) return res.status(400).send('Lütfen bir dosya yükleyin.');

    const inputPath = path.resolve(req.file.path);
    const outputFilename = 'output_' + Date.now() + toFormat;
    const outputPath = path.resolve('uploads', outputFilename);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    const scriptPath = path.resolve('scripts', 'main.py');
    
    console.log(`${fromFormat} -> ${toFormat} dönüşümü başlatılıyor...`);

    const pythonProccess = spawn(pythonCmd, [scriptPath, inputPath, outputPath, fromFormat, toFormat]);

    let pythonError = '';

    pythonProccess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    pythonProccess.on('close', (code) => {

        if (code == 0) {
            return res.render('result', { outputPath: '/uploads/' + outputFilename });
        }

        else {

            console.error(`[Sistem Hatası] Medya motoru yürütülemedi: ${pythonError}`);
        return res.status(500).send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px; color: #334155;">
                <h2>İşlem Sırasında Bir Aksaklık Oluştu</h2>
                <p>Lütfen farklı bir görsel ile tekrar deneyin.</p>
                <a href="/" style="color: #2563eb; text-decoration: none; font-weight: bold;">← Ana Sayfaya Dön</a>
            </div>
        `);
        }

    return res.render('result', { outputPath: '/uploads/' + outputFilename });
    });
});

module.exports = router;
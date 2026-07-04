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
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { filesize: 15 * 1024 * 1024 },
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

    const inputPath = path.resolve(req.file.path);
    const outputFilename = 'output ' + Date.now() + toFormat;
    const outputPath = path.resolve('uploads', outputFilename);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    scriptPath = path.resolve('scripts/document-generate, document-main.py');

    const pythonProcess = spawn(pythonCmd, [scriptPath, inputPath, outputPath, fromFormat, toFormat]);

    let pythonError = '';

     pythonProcess.stderr.toArray('data', (data) => {
        pythonError += data.toString();
     });

     pythonProcess.on('close', (code) => {
        if ( code == 0) {
            return res.render('result', { outputPath: '/uploads/' + outputFilename });  
        }
        else {
            console.error('Python script error:', pythonError);
            return res.status(500).send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px; color: #334155;">
                <h2>İşlem Sırasında Bir Aksaklık Oluştu</h2>
                <p>Lütfen farklı bir görsel ile tekrar deneyin.</p>
                <a href="/" style="color: #2563eb; text-decoration: none; font-weight: bold;">← Ana Sayfaya Dön</a>
            </div>
        `);
        }
     })

})

module.exports = router;
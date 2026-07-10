const express = require('express');
const router = express.Router();
const { spawn } = require ('child_process');
const fs = require('fs');
const path = require('path');
const multer = require ('multer');
const axios = require('axios');
const FormData = require('form-data');

const GOTENBERG_URL = process.env.GOTENBERG_URL || 'http://localhost:3000';

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

router.post('/convert', upload.single('document'), async (req, res) => {
    const fromFormat = req.body.fromFormat.toLowerCase();
    const toFormat = req.body.toFormat.toLowerCase();

    if (!req.file) return res.status(400).send("Lütfen bir dosya yükleyin!");

    const inputPath = req.file.path;
    const originalName = path.basename(req.file.filename, path.extname(req.file.filename));

    const outputFilename = originalName + '.' + 'pdf';
    const outputPath = path.join(__dirname, '../uploads', outputFilename);


    try{
        const form = new FormData();

        form.append('files', fs.createReadStream(inputPath), req.file.originalname);
        console.log(`dosya gotenberge gönderiliyor: ${req.file.originalname}`);

        const response = await axios.post(`${GOTENBERG_URL}/forms/libreoffice/convert`, form, {
            headers: {
                ...form.getHeaders(),
            },
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) =>{
            writer.on('finish', resolve);
            writer.on('error', reject);
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
            return res.send(`gotenberg başarıyla çalıştı pdf hazır scriptler bekleniyor...(pdf to ${toFormat})`);
        }

    } catch (error) {
        console.error('Gotenberg ile dönüştürme sırasında hata oluştu:', error.message);
        if(fs.existsSync(inputPath)) {fs.unlinkSync(inputPath);}

        const isImage = ['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(toFormat);
        }
});


            

module.exports = router;
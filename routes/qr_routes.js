const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

router.post('/generate-qr', (req, res) => {
    const link = req.body.link ? req.body.link.trim() : '';

    if (!link) {
        return res.status(400).send("Lütfen geçerli bir link girin.");
    }

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        return res.status(400).send("Link 'http://' veya 'https://' ile başlamalıdır.");
    }
    const outputFilename = 'qr_' + Date.now() + '.png';
    const outputPath = path.resolve('uploads', outputFilename);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const scriptPath = path.resolve('scripts', 'generate-qr.py');

    const pythonProcess = spawn(pythonCmd, [scriptPath, link, outputPath]);

    let pythonError = '';

    pythonProcess.stderr.on('data', (data) => {
        pythonError += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code == 0) {
            return res.render('result', { outputPath: '/uploads/' + outputFilename });
        }
        else {
            console.error(`[Sistem Hatası kod: ${code}] QR Motoru yürütülemedi: ${pythonError}`);
            return res.status(500).send("Karekod oluşturulurken sistemsel bir aksaklık yaşandı.");
        }
    });
    
});

module.exports = router;
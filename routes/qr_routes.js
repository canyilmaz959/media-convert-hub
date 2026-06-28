const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

router.post('/generate', (req, res) => {
    const link = req.body.link;
    const outputFilename = 'qr_' + Date.now() + '.png';
    const outputPath = path.resolve('uploads', outputFilename);

    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const scriptPath = path.resolve('scripts', 'qr.py');

    const command = `${pythonCmd} "${scriptPath}" "${link}" "${outputPath}"`;

    // Bellek taşmasını önlemek için maxBuffer ekliyoruz
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`[Sistem Hatası] QR Motoru yürütülemedi: ${error.message}`);
            return res.status(500).send("Karekod oluşturulurken sistemsel bir aksaklık yaşandı.");
        }
        
        // 🌟 DÜZELTME: app.js içinde /uploads zaten statik açıldığı için, 
        // tarayıcıya sadece '/uploads/dosya_adi.png' olarak temiz web yolu gönderiyoruz.
        return res.render('result', { outputPath: '/uploads/' + outputFilename });
    });
});

module.exports = router;
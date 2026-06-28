const express = require('express');
const router = express.Router();
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Multer Ayarı: Yüklenen dosyaları uploads/ klasörüne kaydeder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Rota: /gorsel/convert
router.post('/convert', upload.single('image'), (req, res) => {
    const action = req.body.action;
    const tolerance = req.body.tolerance || 240;
    
    if (!req.file) return res.status(400).send('Lütfen bir dosya yükleyin.');

    const inputPath = path.resolve(req.file.path);
    const outputFilename = 'output_' + Date.now() + '.png';
    const outputPath = path.resolve('uploads', outputFilename);

    let scriptName = '';
    let args = `"${inputPath}" "${outputPath}"`;

    switch (action) {
        case 'jpg_to_png': scriptName = 'jpg_to_png.py'; args += ` ${tolerance}`; break;
        case 'png_duzelt': scriptName = 'png_duzelt.py'; args += ` ${tolerance}`; break;
        case 'svg_to_png': scriptName = 'svg_to_png.py'; break;
        case 'webp_to_png': scriptName = 'webp_to_png.py'; break;
        default: return res.status(400).send('Geçersiz işlem.');
    }

    // Sistem Windows ise 'python', Mac/Linux ise 'python3' komutunu seçer
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    
    // Klasör yolunu işletim sistemine göre (Windows için \, Linux için /) tam yol yapar
    const scriptPath = path.resolve('scripts', scriptName);

    // Komutu birleştiriyoruz
    const command = `${pythonCmd} "${scriptPath}" ${args}`;
    
    console.log(`Çalıştırılan Evrensel Komut: ${command}`);

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
        console.error(`[Sistem Hatası] Medya motoru yürütülemedi: ${error.message}`);
        return res.status(500).send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px; color: #334155;">
                <h2>⚠️ İşlem Sırasında Bir Aksaklık Oluştu</h2>
                <p>Lütfen farklı bir görsel ile tekrar deneyin.</p>
                <a href="/" style="color: #2563eb; text-decoration: none; font-weight: bold;">← Ana Sayfaya Dön</a>
            </div>
        `);
    }

    // İşlem bittiğinde Node.js'in tarayıcıya sayfayı gönderdiğinden emin oluyoruz
    return res.render('result', { outputPath: '/uploads/' + outputFilename });
    });
});

module.exports = router;
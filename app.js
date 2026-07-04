const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const PORT = 3000;

const ESKILIK_SINIRI_MS = 15 * 60 * 1000; 
const KONTROL_PERIYODU_MS = 10 * 60 * 1000; 

const gorsel_routes = require('./routes/gorsel_routes');
const qr_routes = require('./routes/qr_routes');
const belge_routes = require('./routes/belge_routes');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/pngpage', (req, res) => {
    res.render('pngpage');
});

app.get('/qrpage', (req, res) => {
    res.render('qrpage');
});

app.get('/filepage', (req, res) => {
    res.render('filepage');
});

app.use('/gorsel', gorsel_routes);
app.use('/qr', qr_routes);
app.use('/dosya', belge_routes);

app.listen(PORT, () => {
    console.log(`Sunucu aktif: http://localhost:${PORT} `);
});

function eskiDosyalariTemizle() {
    const uploadsKlasoru = path.resolve(__dirname, 'uploads');
    
    if (!fs.existsSync(uploadsKlasoru)) return;

    fs.readdir(uploadsKlasoru, (err, dosyalar) => {
        if (err) {
            console.error(`[Sistem] Klasör okuma hatası: ${err.message}`);
            return;
        }

        const simdi = Date.now();

        dosyalar.forEach(dosya => {
            const dosyaYolu = path.join(uploadsKlasoru, dosya);

            fs.stat(dosyaYolu, (err, stats) => {
                if (err) return;

                const dosyaYasi = simdi - stats.mtimeMs;

                if (dosyaYasi > ESKILIK_SINIRI_MS) {
                    fs.unlink(dosyaYolu, (err) => {
                        if (err) {
                            console.error(`[Sistem] Dosya silinemedi: ${dosya}, ${err.message}`);
                        } else {
                            console.log(`[Sistem UX] Alan tasarrufu sağlandı. Eski dosya silindi: ${dosya}`);
                        }
                    });
                }
            });
        });
    });
}

setInterval(eskiDosyalariTemizle, KONTROL_PERIYODU_MS);
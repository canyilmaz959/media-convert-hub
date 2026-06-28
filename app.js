const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const PORT = 3000;

const ESKILIK_SINIRI_MS = 15 * 60 * 1000; // 15 dakika (milisaniye cinsinden)
const KONTROL_PERIYODU_MS = 10 * 60 * 1000; // 10 dakikada bir kontrol et

// Rotaları içeri aktar
const gorsel_routes = require('./routes/gorsel_routes');
const qr_routes = require('./routes/qr_routes');

// EJS ve Body Parser Ayarları
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Uploads klasörünü dışarıya açıyoruz ki tarayıcı resimleri görebilsinsin
app.use('/uploads', express.static('uploads'));

// Ana Sayfa Rotası
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/gorsel-donusturucu', (req, res) => {
    res.render('pngpage');
});

app.get('/karekod-ureticisi', (req, res) => {
    res.render('qrpage');
});

app.use('/gorsel', gorsel_routes);
app.use('/qr', qr_routes);


// Sunucuyu Başlat
app.listen(PORT, () => {
    console.log(`Sunucu aktif: http://localhost:${PORT} `);
});

function eskiDosyalariTemizle() {
    const uploadsKlasoru = path.resolve(__dirname, 'uploads');
    
    // Klasör yoksa hata vermemesi için kontrol et
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

                // Dosyanın son değiştirilme/oluşturulma zamanını al
                const dosyaYasi = simdi - stats.mtimeMs;

                // Eğer dosya belirlenen sınırdan (15 dk) eskiyse sil
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
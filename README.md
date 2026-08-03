# 🔄 Media Convert Hub

> **Docker** ve **Gotenberg** mikroservis mimarisi üzerinde çalışan; Belge, Görsel ve QR Kod dönüştürme süreçlerini tek çatı altında toplayan yüksek performanslı web uygulaması.

![Project Banner](C:\Users\muham\OneDrive\Desktop\dosya_ss\dosya_anasayfa.png) <!-- 📸 BURAYA PROJENİN GENEL EKRAN GÖRÜNTÜSÜNÜ VEYA BANNER RESMİNİ KOYABİLİRSİN -->

---

## 🚀 Proje Hakkında

Media Convert Hub; belgelerinizi, görsellerinizi ve bağlantılarınızı anında dönüştüren modüler bir medya yönetim aracıdır. 

Sistem, gelen yüksek hacimli dönüştürme isteklerini sunucu kaynaklarını (özellikle RAM) yormadan işlemek üzere **Node.js (Express)** ve **Gotenberg (Go tabanlı dönüştürme motoru)** mikroservis mimarisiyle kurgulanmıştır.

---

## 📸 Ekran Görüntüleri

| Belge & Ofis Dönüştürücü | Görsel Format Dönüştürücü | QR Kod Oluşturucu |
| :---: | :---: | :---: |
| ![Belge Görseli](C:\Users\muham\OneDrive\Desktop\dosya_ss\dosya_dosya.png) | ![Görsel Sayfası](C:\Users\muham\OneDrive\Desktop\dosya_ss\dosya_görsel.png) | ![QR Sayfası](C:\Users\muham\OneDrive\Desktop\dosya_ss\dosya_qr.png) |
| *Office ve PDF formatları arası geçiş* | *Görseller arası kayıpsız format dönüşümü* | *Bağlantılardan hızlı QR kod üretimi* |

---

## 🛠️ Dönüştürme Modülleri & Yetenekler

### 📄 1. Belge & Office Dönüştürücü
Desteklenen formatlar arası çapraz ve karşılıklı (PDF, PPTX, POTX, ODP, DOCX) dönüştürme desteği:
* `DOCX` / `PPTX` / `POTX` / `ODP` ⇄ `PDF`
* Sunum ve doküman formatlarının kendi aralarında dönüştürülmesi.

### 🖼️ 2. Görsel Format Dönüştürücü
Popüler görsel formatlarının birbirine kayıpsız/hızlı dönüştürülmesi:
* `JPEG` ⇄ `PNG` ⇄ `WEBP` ⇄ `SVG`

### 📱 3. QR Kod Sayfası
* Herhangi bir URL veya metin bağlantısını anında taranabilir **QR Kod** görsellerine dönüştürme.

---

## ⚡ Mimari & Öne Çıkan Özellikler

* **Mikroservis Mimarisi:** Dönüştürme motoru (Gotenberg) ile web katmanı (Express) izole konteynerler halinde haberleşir.
* **Low RAM Optimization:** Render.com üzerindeki **512 MB RAM** sınırına takılmamak için bellek tüketimi ve akışlar (streams) özel olarak optimize edilmiştir.
* **Geçici Depolama Güvenliği:** İşlenen dosyalar sunucu diskinde yer kaplamaz, dönüştürme sonrası otomatik temizlenir.

---

## 🧩 Sistem Mimarisi

```text
[ İstemci / Tarayıcı ]
         │
         ├──► (Belge İşlemleri) ──► [ Node.js API ] ──► [ Gotenberg Docker (Go) ]
         ├──► (Görsel İşlemleri) ──► [ Node.js / Sharp Engine ]
         └──► (QR Kod Üretimi)  ──► [ Node.js QR Generator ]

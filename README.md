# 🔄 Media Convert Hub

> **Docker** ve **Gotenberg** mikroservis mimarisi üzerinde çalışan; Belge, Görsel ve QR Kod dönüştürme süreçlerini tek çatı altında toplayan yüksek performanslı web uygulaması.

![Project Banner](https://github.com/user-attachments/assets/fcaee2e0-18f9-4be3-ac3c-336bb4a45e35) <!-- 📸 BURAYA PROJENİN GENEL EKRAN GÖRÜNTÜSÜNÜ VEYA BANNER RESMİNİ KOYABİLİRSİN -->

---

## 🚀 Proje Hakkında

Media Convert Hub; belgelerinizi, görsellerinizi ve bağlantılarınızı anında dönüştüren modüler bir medya yönetim aracıdır. 

Sistem, gelen yüksek hacimli dönüştürme isteklerini sunucu kaynaklarını (özellikle RAM) yormadan işlemek üzere **Node.js (Express)** ve **Gotenberg (Go tabanlı dönüştürme motoru)** mikroservis mimarisiyle kurgulanmıştır.

---

## 📸 Ekran Görüntüleri

| Belge & Ofis Dönüştürücü | Görsel Format Dönüştürücü | QR Kod Oluşturucu |
| :---: | :---: | :---: |
| ![Belge Görseli](https://github.com/user-attachments/assets/ecdafc09-62b8-410f-a014-2bc29e28ee57) | ![Görsel Sayfası](https://github.com/user-attachments/assets/6a46ba8e-6284-4f57-a7cd-d022fc58b4a1) | ![QR Sayfası](https://github.com/user-attachments/assets/1b16b76d-ace7-4c99-96b8-5f6180c5acb3) |
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

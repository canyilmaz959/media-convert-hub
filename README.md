# 🔄 Media Convert Hub

> **Docker** ve **Gotenberg** mikroservis mimarisi üzerinde çalışan, yüksek performanslı ve bellek (RAM) optimizasyonlu medya ve belge dönüştürme uygulaması.

![Project Banner](./screenshots/banner.png) <!-- 📸 BURAYA PROJENİN GENEL EKRAN GÖRÜNTÜSÜNÜ VEYA BANNER RESMİNİ KOYABİLİRSİN -->

---

## 🚀 Proje Hakkında

Media Convert Hub; Office belgelerini (DOCX, XLSX, PPTX), görselleri ve metin dosyalarını hızlı ve güvenilir bir şekilde PDF ve diğer formatlara dönüştüren bir web servisidir. 

Sistem, gelen istekleri yük altında bile sunucu kaynaklarını (özellikle RAM) tüketmeden işlemek üzere **Node.js (Express)** ve **Gotenberg (Go tabanlı dönüştürme motoru)** mikroservis iletişimiyle kurgulanmıştır.

---

## 📸 Ekran Görüntüleri

| Ana Dönüştürme Arayüzü | İşlem Sonucu & İndirme |
| :---: | :---: |
| ![Arayüz Görseli](./screenshots/dashboard.png) | ![Sonuç Görseli](./screenshots/result.png) |
| *Sürükle-bırak destekli dosya yükleme alanı* | *Başarılı dönüştürme ve hızlı indirme ekranı* |

---

## 🛠️ Mimari ve Öne Çıkan Özellikler

* **Mikroservis Mimarisi:** Dönüştürme motoru (Gotenberg) ile web katmanı (Express) birbirinden izole konteynerler/servisler halinde haberleşir.
* **Low RAM Optimizations:** Render.com üzerindeki **512 MB RAM** sınırına takılmamak için bellek tüketimi minimize edilmiş, dosya akışları (streams) optimize edilmiştir.
* **Çoklu Format Desteği:** 
  * `DOCX` / `DOC` → `PDF`
  * `XLSX` / `CSV` → `PDF`
  * `PPTX` → `PDF`
  * Görsel & Metin formatları arası dönüştürme
* **Güvenli & Geçici Depolama:** Dönüştürülen dosyalar sunucu diskini doldurmaz, işlem sonrası otomatik temizlenir.

---

## 🧩 Sistem Mimarisi

```text
[ İstemci / Tarayıcı ]
         │
         ▼ (HTTP Multipart Upload)
[ Node.js / Express Web Servisi ]
         │
         ▼ (Stream / API Request)
[ Gotenberg Docker Service (Go) ] ──► (LibreOffice / PDF Engine)
         │
         ▼ (Dönüştürülen PDF)
[ İstemciye İndirme Yanıtı ]

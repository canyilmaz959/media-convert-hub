const { test, expect } = require('@playwright/test');
const path = require('path');

const testSenaryolari = [
  { dosya: 'ornek.pdf', hedefFormat: 'docx' },
  { dosya: 'ornek.pptx', hedefFormat: 'odp' },
  { dosya: 'ornek.potx', hedefFormat: 'docx' },
  { dosya: 'ornek.docx', hedefFormat: 'pptx' },
  { dosya: 'ornek.odp', hedefFormat: 'pdf'}
];

test.describe('Çapraz Doküman Dönüştürme Test Suite', () => {
  // Give document conversion tasks enough time to complete
  test.setTimeout(60000);

  for (const senaryo of testSenaryolari) {
    test(`Çapraz Dönüşüm Testi: ${senaryo.dosya} -> ${senaryo.hedefFormat}`, async ({ page }) => {
      await page.goto('http://localhost:3000/filepage');

      const dosyaYolu = path.join(__dirname, '../TestFiles', senaryo.dosya);

      // Playwright Best Practice: Use role / label / user-visible locators
      await page.locator('input[type="file"]').setInputFiles(dosyaYolu);
      await page.locator('select[name="toFormat"]').selectOption(senaryo.hedefFormat);
      await page.getByRole('button', { name: /dönüştür|gönder|işle/i }).click();

      // Assert that no application error message appears on the screen
      const hataMesaji = page.getByText(/Dönüştürme sırasında bir hata oluştu/i);
      await expect(hataMesaji).not.toBeVisible();

      // Assert success message using recommended user-facing locator
      const basariMetni = page.getByText('Dosyanız Başarıyla Hazırlandı!');
      await expect(basariMetni).toBeVisible({ timeout: 45000 });

      // Assert download link existence
      const indirmeAlani = page.locator('a[href*="/uploads/"]');
      await expect(indirmeAlani).toBeVisible();
    });
  }
});
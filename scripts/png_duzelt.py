import cv2
import numpy as np
import sys

def perfect_transparent_png(input_path, output_path, tolerance=235):
    try:
        print("Gelişmiş kenar yumuşatması ve beyaz çeper temizliği başladı...")
        
        # 1. Görseli yükle
        img = cv2.imread(input_path)
        
        # 2. Maske Oluştur (Beyaz alanları seç)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, alpha = cv2.threshold(gray, tolerance, 255, cv2.THRESH_BINARY_INV)
        
        # 3. ✨ MORFOLOJİK EROZYON (Kenardaki Beyaz Çeperi Eritme)
        # Bu adım, maskeyi 1 piksel içeri daraltarak beyaz hatları logonun dışında bırakır.
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
        alpha = cv2.erode(alpha, kernel, iterations=1)
        
        # 4. ✨ ALPHA BLENDING (Yumuşak Geçiş Kenarı)
        # Kenarlarda kalan piksellerin sertliğini almak için feathering (tüy yumuşatması) yapıyoruz.
        alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
        
        # 5. Kanalları Birleştir
        b, g, r = cv2.split(img)
        rgba = cv2.merge([b, g, r, alpha])
        
        # 6. ✨ ARKA PLAN RENK ARINDIRMA (Matting)
        # Maskenin yarı şeffaf olduğu kenarlardaki beyaz ışık sızmasını (fringe) siler.
        # Piksellerin RGB değerlerini, kendi Alpha değerleriyle oranlayarak beyaz parlamayı yok ederiz.
        normalized_alpha = alpha.astype(float) / 255.0
        for c in range(0, 3):
            rgba[:, :, c] = (rgba[:, :, c].astype(float) * normalized_alpha).astype(np.uint8)
            
        # Yüksek kalitede PNG olarak kaydet
        cv2.imwrite(output_path, rgba, [int(cv2.IMWRITE_PNG_COMPRESSION), 1])
        print(f"Kusursuz PNG kaydedildi: {output_path}")
        
    except Exception as e:
        print(f"Hata: {e}")

# Kullanım:
# Eğer logonun kendi içindeki renkler gitmeye başlarsa tolerance değerini 245 yapabilirsin.
perfect_transparent_png('logo.png', 'perfect_logo.png', tolerance=235)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        tol_val = int(sys.argv[3]) if len(sys.argv) > 3 else 235
        perfect_transparent_png(input_path, output_path, tolerance=tol_val)

    sys.exit(0)
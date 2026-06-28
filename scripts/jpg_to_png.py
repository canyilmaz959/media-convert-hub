from PIL import Image
import sys

def convert_jpg_to_transparent_png(jpg_input_path, png_output_path, tolerance=240):
    try:
        print(f"Arka plan temizleme işlemi başladı: {jpg_input_path}...")
        
        # 1. JPG görselini aç ve RGBA (Şeffaflık destekli) moduna çevir
        img = Image.open(jpg_input_path).convert("RGBA")
        datas = img.getdata()
        
        new_data = []
        
        # 2. Tüm pikselleri tek tek kontrol et
        for item in datas:
            # item[0] = Kırmızı, item[1] = Yeşil, item[2] = Mavi (0-255 arası)
            # Eğer piksel beyaza çok yakınsa (tolerance değerinden büyükse)
            if item[0] >= tolerance and item[1] >= tolerance and item[2] >= tolerance:
                # Görünmez yap (Alpha kanalını 0 yapıyoruz)
                new_data.append((255, 255, 255, 0))
            else:
                # Olduğu gibi bırak (Alpha kanalı 255 = Tam görünür)
                new_data.append(item)
                
        # 3. Yeni transparan pikselleri görsele uygula ve kaydet
        img.putdata(new_data)
        img.save(png_output_path, "PNG")
        
        print(f"Başarılı! Arka planı şeffaf PNG şuraya kaydedildi: {png_output_path}")
        
    except Exception as e:
        print(f"Bir hata oluştu: {e}")

# Kullanım Örneği:
# tolerance=240, tam beyaz olmayan ama beyaza çok yakın kirli beyazları da temizler.
# Eğer logonun içindeki beyazlar da siliniyorsa bu değeri 250 veya 255 yapabilirsin.
convert_jpg_to_transparent_png('three.jpg', 'three_logo.png', tolerance=240)

if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        tol_val = int(sys.argv[3]) if len(sys.argv) > 3 else 240
        convert_jpg_to_transparent_png(input_path, output_path, tolerance=tol_val)

    sys.exit(0)
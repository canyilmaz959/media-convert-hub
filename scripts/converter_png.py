import os
from PIL import Image
import io
import base64

def convert(input_path, output_path, to_fmt):
    """PNG dosyasını hedef formata (JPG, WebP, SVG) dönüştürür"""
    try:
        # Görseli Pillow ile hafızaya açıyoruz
        img = Image.open(input_path)

        # 1. SENARYO: PNG -> JPG (Şeffaflık Koruma Sihri)
        if to_fmt in ["jpg", "jpeg"]:
            # Eğer görsel şeffaf kanallara sahipse (RGBA veya LA)
            if img.mode in ('RGBA', 'LA'):
                # Görselle aynı boyutta saf beyaz bir arka plan oluşturuyoruz
                background = Image.new('RGB', img.size, (255, 255, 255))
                # Orijinal şeffaf logoyu/resmi, kendi alpha (şeffaflık) maskesini kullanarak bu beyaz fona yapıştırıyoruz
                background.paste(img, mask=img.split()[3]) # 3. endeks alpha kanalıdır
                background.save(output_path, 'JPEG', quality=95)
            else:
                # Görsel zaten şeffaf değilse düz RGB'ye çevirip kaydediyoruz
                img.convert('RGB').save(output_path, 'JPEG', quality=95)
            return True

        # 2. SENARYO: PNG -> WebP (Ultra Sıkıştırma)
        elif to_fmt == "webp":
            # WebP şeffaflığı desteklediği için doğrudan kalitesini ayarlayıp kaydediyoruz
            img.save(output_path, 'WEBP', quality=85)
            return True

        # 3. SENARYO: PNG -> SVG (Vektör Taslağı)
        elif to_fmt == "svg":
            with Image.open(input_path) as img:
                w, h = img.size
                buffered = io.BytesIO()
                img.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            with open(output_path, "w") as f:
                f.write(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n')
                f.write(f'  <image width="{w}" height="{h}" xlink:href="data:image/png;base64,{img_str}"/>\n')
                f.write('</svg>\n')
            return True

        else:
            print(f"PNG Sub-Error: Unsupported target format '{to_fmt}'")
            return False

    except Exception as e:
        print(f"PNG Sub-Exception: {str(e)}")
        return False
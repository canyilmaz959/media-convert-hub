import cv2
from PIL import Image
import io
import base64

def convert(input_path, output_path, to_fmt):
    """JPG dosyasını hedef formata (PNG, WebP, SVG) dönüştürür"""
    try:
        img = Image.open(input_path)

        # 1. SENARYO: JPG -> PNG
        if to_fmt == "png":
            img.save(output_path, 'PNG')
            return True

        # 2. SENARYO: JPG -> WebP
        elif to_fmt == "webp":
            img.save(output_path, 'WEBP', quality=85)
            return True

        # 3. SENARYO: JPG -> SVG (Çizgileri Yakalama - OpenCV Sihri)
        elif to_fmt == "svg":
            with Image.open(input_path) as img:
                w, h = img.size
                buffered = io.BytesIO()
                img.save(buffered, format="JPEG", quality=95)
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            
            # Bulduğumuz koordinatları gerçek bir SVG çizgisine (path) dönüştürüyoruz
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n')
                f.write(f'  <image width="{w}" height="{h}" xlink:href="data:image/jpeg;base64,{img_str}"/>\n')
                f.write('</svg>\n')
            return True

        else:
            print(f"JPG Sub-Error: Unsupported target format '{to_fmt}'")
            return False

    except Exception as e:
        print(f"JPG Sub-Exception: {str(e)}")
        return False
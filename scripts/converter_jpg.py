import cv2
from PIL import Image

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
            # İşte ablanın bayılacağı yer! Logoyu siyah-beyaz (grayscale) okuyoruz
            gray = cv2.imread(input_path, cv2.IMREAD_GRAYSCALE)
            # Threshold (eşikleme) ile pikselleri tam siyah ve tam beyaz olarak ayırıyoruz
            _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
            # Resimdeki çizgisel hatları (konturları) buluyoruz
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            h, w = gray.shape
            # Bulduğumuz koordinatları gerçek bir SVG çizgisine (path) dönüştürüyoruz
            with open(output_path, "w") as f:
                f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n')
                for c in contours:
                    if len(c) > 2:
                        path_data = "M " + " L ".join([f"{p[0][0]} {p[0][1]}" for p in c]) + " Z"
                        f.write(f'  <path d="{path_data}" fill="black" stroke="none"/>\n')
                f.write('</svg>\n')
            return True

        else:
            print(f"JPG Sub-Error: Unsupported target format '{to_fmt}'")
            return False

    except Exception as e:
        print(f"JPG Sub-Exception: {str(e)}")
        return False
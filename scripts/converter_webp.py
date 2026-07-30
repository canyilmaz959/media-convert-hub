from PIL import Image
import base64
import io

def convert(input_path, output_path, to_fmt):
    """WebP dosyasını hedef formata (JPG, PNG) dönüştürür"""
    try:
        img = Image.open(input_path)

        # 1. SENARYO: WebP -> JPG (Yine beyaz fon koruması ekliyoruz)
        if to_fmt in ["jpg", "jpeg"]:
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[3])
                background.save(output_path, 'JPEG', quality=95)
            else:
                img.convert('RGB').save(output_path, 'JPEG', quality=95)
            return True

        # 2. SENARYO: WebP -> PNG
        elif to_fmt == "png":
            img.save(output_path, 'PNG')
            return True

        elif to_fmt == "svg":
            with Image.open(input_path) as img_svg:
                w, h = img_svg.size
                buffered = io.BytesIO()
                # WebP şeffaflığını ve renklerini koruyarak PNG akışına çeviriyoruz
                img_svg.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

            with open(output_path, "w", encoding="utf-8") as f:
                f.write(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {w} {h}" width="{w}" height="{h}">\n')
                f.write(f'  <image width="{w}" height="{h}" xlink:href="data:image/png;base64,{img_str}"/>\n')
                f.write('</svg>\n')
            return True

        else:
            print(f"WebP Sub-Error: Unsupported target format '{to_fmt}'")
            return False

    except Exception as e:
        print(f"WebP Sub-Exception: {str(e)}")
        return False
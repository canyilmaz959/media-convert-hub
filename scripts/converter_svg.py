import os
import cairosvg
from PIL import Image

def convert(input_path, output_path, to_fmt):
    """SVG dosyasını yüksek kaliteli piksel formatına (PNG, JPG) dönüştürür"""
    try:
        # 1. SENARYO: SVG -> PNG (CairoSVG doğrudan yüksek kaliteli PNG üretir)
        if to_fmt == "png":
            cairosvg.svg2png(url=input_path, write_to=output_path)
            return True

        # 2. SENARYO: SVG -> JPG
        elif to_fmt in ["jpg", "jpeg"]:
            # SVG'den doğrudan JPG üretilemediği için önce geçici (.temp) bir PNG yapıyoruz
            temp_png = output_path + ".temp.png"
            cairosvg.svg2png(url=input_path, write_to=temp_png)
            
            # Oluşan geçici PNG'yi Pillow ile açıp arkasına beyaz fon koyarak JPG yapıyoruz
            img = Image.open(temp_png)
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode in ('RGBA', 'LA'):
                background.paste(img, mask=img.split()[3])
            else:
                background.paste(img)
                
            background.save(output_path, 'JPEG', quality=95)
            
            # İşimiz bitti, geçici dosyayı bellekten ve diskten siliyoruz
            img.close()
            if os.path.exists(temp_png):
                os.remove(temp_png)
            return True

        else:
            print(f"SVG Sub-Error: Unsupported target format '{to_fmt}'")
            return False

    except Exception as e:
        print(f"SVG Sub-Exception: {str(e)}")
        return False
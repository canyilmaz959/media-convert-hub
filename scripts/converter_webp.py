from PIL import Image

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

        else:
            print(f"WebP Sub-Error: Unsupported target format '{to_fmt}'")
            return False

    except Exception as e:
        print(f"WebP Sub-Exception: {str(e)}")
        return False
import sys
import os

def main():
    if len(sys.argv) < 5:
        print("Error: Eksik argümanlar. Kullanım: python main.py <input_path> <output_path> <from_format> <to_format>")
        sys.exit(1) 

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    from_fmt = sys.argv[3].lower()
    to_fmt = sys.argv[4].lower()

    try:
        if from_fmt == "png":
            # DEĞİŞİKLİK: Sadece PNG kaynaklı dönüşüm gerektiğinde ilgili converter yükleniyor; gereksiz kütüphane yükleme ve başlangıç maliyeti azaltılıyor.
            import converter_png
            success = converter_png.convert(input_path, output_path, to_fmt)

        elif from_fmt in ["jpg", "jpeg"]:
            # DEĞİŞİKLİK: Sadece JPG kaynaklı dönüşüm gerektiğinde ilgili converter yükleniyor; diğer converter modülleri gereksiz yere import edilmiyor.
            import converter_jpg
            success = converter_jpg.convert(input_path, output_path, to_fmt)

        elif from_fmt == "webp":
            # DEĞİŞİKLİK: Sadece WebP kaynaklı dönüşüm gerektiğinde ilgili converter yükleniyor; Python sürecinin RAM kullanımı azaltılıyor.
            import converter_webp
            success = converter_webp.convert(input_path, output_path, to_fmt)

        elif from_fmt == "svg":
            # DEĞİŞİKLİK: Sadece SVG kaynaklı dönüşüm gerektiğinde ilgili converter yükleniyor; kullanılmayan converter bağımlılıklarının yüklenmesi engelleniyor.
            import converter_svg
            success = converter_svg.convert(input_path, output_path, to_fmt)

        else:
            print(f" Desteklenmeyen format'{from_fmt}'")
            sys.exit(1)

        if success:
            print(f"Başarılı: Dönüştürüldü {from_fmt.upper()} to {to_fmt.upper()} successfully.")
            sys.exit(0) 
        else:
            print("Hata: Dönüştürme işlemi başarısız oldu.")
            sys.exit(1)

    except Exception as e:
        print(f"Main hatası yakalandı: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

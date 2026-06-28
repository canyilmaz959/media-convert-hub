import cairosvg
import sys

def convert_svg_to_png(svg_input_path, png_output_path, width=None, height=None):
    try:
        print(f"Cairo motoru aktif. Dönüşüm başlıyor: {svg_input_path}...")
        
        cairosvg.svg2png(
            url=svg_input_path, 
            write_to=png_output_path,
            output_width=width,
            output_height=height
        )
        
        print(f"Başarılı! Kusursuz PNG şuraya kaydedildi: {png_output_path}")
    except Exception as e:
        print(f"Bir sorun oluştu: {e}")

# Test etmek için:
convert_svg_to_png('logo1.svg', 'output_logo.png')

if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        convert_svg_to_png(input_path, output_path)

    sys.exit(0)
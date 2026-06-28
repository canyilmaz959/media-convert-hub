from PIL import Image
import sys

# WebP dosyasını aç ve PNG olarak kaydet
im = Image.open('hyperion.webp').convert('RGBA')
im.save('hyperion.png', 'png')

if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_path = sys.argv[1]
        output_path = sys.argv[2]
        im = Image.open(input_path).convert('RGBA')
        im.save(output_path, 'png')

    sys.exit(0)
import sys
import qrcode

def qr_kod_uret(link, dosya_adi="qrcode.png"):
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(link)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img.save(dosya_adi)
        print("Success: QR code generated successfully.")
        sys.exit(0) # 🌟 İşlem başarılıysa sıfır koduyla çık
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1) # 🌟 Hata varsa bir koduyla çık ki Node.js anlasın

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        hedef_link = sys.argv[1]
        output_path = sys.argv[2]
        qr_kod_uret(hedef_link, dosya_adi=output_path)
    else:
        print("Error: Missing arguments.")
        sys.exit(1)
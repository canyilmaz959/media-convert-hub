import sys
import qrcode

def main():

    if len(sys.argv) < 3:
        print("Error: Eksik parametreler. Kullanım: python generate_qr.py <qrText> <outputPath>")
        sys.exit(1) 

    qr_text = sys.argv[1]
    output_path = sys.argv[2]

    try:
    
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4
        )
        
        qr.add_data(qr_text)
        qr.make(fit=True) # Verinin boyutuna göre QR kodu optimize et

        img = qr.make_image(fill_color="black", back_color="white")
        
        img.save(output_path)
        
        sys.exit(0)

    except Exception as e:
        print(f"QR Generation Exception: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
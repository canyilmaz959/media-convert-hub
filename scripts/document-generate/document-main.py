import sys 
import os

if len(sys.argv) < 4:
    print("ERROR: Missing arguments. Usage: main.py <input> <output> <format>")
    sys.exit(1)

input_path = sys.argv[1]
output_path = sys.argv[2]
target_format = sys.argv[3].lower().strip()

def convert_to_docx(infile, outfile):
    from pdf2docx import Converter

    cv = Converter(infile)
    cv.convert(outfile)
    cv.close()

def convert_to_pptx(infile, outfile):
    from pdf2image import convert_from_path
    from pptx import Presentation

    images = convert_from_path(infile)
    prs = Presentation()
    blank_slide_layout = prs.slide_layouts[6]

    for i, image in enumerate(images):
        temp_path = f"temp_pptx_{i}.png"
        image.save(temp_path, "PNG")
        slide = prs.slides.add_slide(blank_slide_layout)
        slide.shapes.add_picture(temp_path, 0, 0, width=prs.slide_width, height=prs.slide_height)

        os.remove(temp_path)

    prs.save(outfile)

def convert_to_odp(infile, outfile):
    from pdf2image import convert_from_path
    from odf.opendocument import OpenDocumentPresentation
    from odf.draw import Page, Frame, Image
    import os
    
    images = convert_from_path(infile)
    doc = OpenDocumentPresentation()

    base_dir = os.path.dirname(outfile)
    temp_files = []

    for i, image in enumerate(images):

        temp_path = os.path.join(base_dir, f"temp_odp_{i}.png")
        image.save(temp_path, "PNG")
        temp_files.append(temp_path)
        slide = Page(name=f"slide_{i+1}", masterpagename="Standard")
        doc.body.appendChild(slide)
        frame = Frame(width='28cm', height='21cm', x='0cm', y='0cm')
        slide.appendChild(frame)
        href = doc.addPicture(temp_path)
        img_node = Image(href=href)
        frame.appendChild(img_node)

    doc.save(outfile)

    for temp_file in temp_files:
        if os.path.exists(temp_file):
            os.remove(temp_file)

def convert_to_potx(infile, outfile):
    from pdf2image import convert_from_path
    from pptx import Presentation

    images = convert_from_path(infile)
    prs = Presentation()
    blank_slide_layout = prs.slide_layouts[6]

    for i, image in enumerate(images):
        temp_path = f"temp_potx_{i}.png"
        image.save(temp_path, "PNG")
        slide = prs.slides.add_slide(blank_slide_layout)
        slide.shapes.add_picture(temp_path, 0, 0, width=prs.slide_width, height=prs.slide_height)

        os.remove(temp_path)
        
    prs.save(outfile)

try:
    if target_format == 'docx':
        convert_to_docx(input_path, output_path)
    elif target_format == 'pptx':
        convert_to_pptx(input_path, output_path)
    elif target_format == 'odp':
        convert_to_odp(input_path, output_path)
    elif target_format == 'potx':
        convert_to_potx(input_path, output_path)
    else:
        raise ValueError(f"Unsupported format: {target_format}")
    
    print("başarılı")
    sys.exit(0)

except Exception as e:
    print("başarısız hata: ", str(e))
    sys.exit(1)
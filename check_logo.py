from PIL import Image

try:
    img = Image.open('public/assets/STE LOGO.jpg')
    print("Format:", img.format)
    print("Size:", img.size)
    print("Mode:", img.mode)
    
    # Check a few corner pixels
    corners = [
        (0, 0),
        (img.size[0] - 1, 0),
        (0, img.size[1] - 1),
        (img.size[0] - 1, img.size[1] - 1)
    ]
    for c in corners:
        print(f"Pixel at {c}:", img.getpixel(c))
except Exception as e:
    print("Error:", e)

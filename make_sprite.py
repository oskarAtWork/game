from PIL import Image
import os
import sys

def sprite_sheet(image_path):
    if "/" not in image_path:
        if '_normal' not in image_path:
            quit('Do not think that file is the one you want')
        directory = os.path.dirname(os.path.abspath(__file__))
        image_path = os.path.join(directory, 'assets', image_path + '.png' if '.' not in image_path else image_path)
    else:
        quit('Just the name of the file please')

    # Open the image using Pillow
    with Image.open(image_path) as image:
        # Calculate the new width based on the aspect ratio
        width, height = image.size

        names = ['_normal', '_sleepy', '_confused', '_grooving']

        # Create a new image with the desired dimensions
        sprite_sheet = Image.new('RGBA', (width * len(names), height))

        for i, name in enumerate(names):
          with Image.open(image_path.replace('_normal', name)) as image2:
              image2 = image2.resize((width, height))
              sprite_sheet.paste(image2, (width * i, 0))

        # Save the resized image
        sprite_sheet.save(image_path.replace('_normal', '_sheet'))
        print("Sprite sheet created and saved successfully!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the image path as an argument.")
        sys.exit(1)

    sprite_sheet(sys.argv[1])

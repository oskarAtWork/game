import sys
import os
from PIL import Image

# you need to pip install Pillow before running this

def make_background_transparent(image_path):
    # Open the image file

    if "/" not in image_path:
      directory = os.path.dirname(os.path.abspath(__file__))
      image_path = os.path.join(directory, 'assets', image_path + '.png' if '.' not in image_path else image_path)

    image = Image.open(image_path)
    image = image.convert("RGBA")
    pixel_data = image.load()

    # Loop through each pixel and make the background transparent
    for y in range(image.size[1]):
        for x in range(image.size[0]):
            # Check if the pixel color is equal to the background color (e.g., white)
            if pixel_data[x, y] == (255, 255, 255, 255):  # Change (255, 255, 255, 255) to your desired background color
                # Make the pixel transparent
                pixel_data[x, y] = (0, 0, 0, 0)  # Set (0, 0, 0, 0) for fully transparent pixels

    image.save(image_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the image path as an argument.")
        sys.exit(1)

    input_image = sys.argv[1]
    make_background_transparent(input_image)

from PIL import Image
import os
import sys

def resize_image(image_path, new_height):
  if "/" not in image_path:
    directory = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(directory, 'assets', image_path + '.png' if '.' not in image_path else image_path)

  # Open the image using Pillow
  with Image.open(image_path) as image:
    # Calculate the new width based on the aspect ratio
    width, height = image.size
    aspect_ratio = height / new_height
    new_width = int(width / aspect_ratio)

    image.save(image_path.split('.')[0] + '_old.png')

    # Resize the image
    resized_image = image.resize((new_width, new_height))

    # Save the resized image
    resized_image.save(image_path)
    print("Image resized and saved successfully!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the image path as an argument.")
        sys.exit(1)
  
    resize_image(sys.argv[1], 100)




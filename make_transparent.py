import sys
import os
from PIL import Image

# You need to pip install Pillow before running this

def calculate_corner_colors(image_path):
    # Open the image file
    if "/" not in image_path:
        directory = os.path.dirname(os.path.abspath(__file__))
        image_path = os.path.join(directory, 'assets', image_path + '.png' if '.' not in image_path else image_path)

    image = Image.open(image_path)
    image = image.convert("RGBA")
    pixel_data = image.load()

    # Get the colors of the four corners
    top_left_color = pixel_data[0, 0]
    top_right_color = pixel_data[image.size[0] - 1, 0]
    bottom_left_color = pixel_data[0, image.size[1] - 1]
    bottom_right_color = pixel_data[image.size[0] - 1, image.size[1] - 1]

    # Check if all corner colors are the same
    if (
        top_left_color == top_right_color == bottom_left_color == bottom_right_color
    ):
        transparency_color = top_left_color
    else:
        # Prompt user to select the transparency color from the corner colors
        print("The corner colors are different. Please select the transparency color:")
        print("1. Top Left Color:", top_left_color)
        print("2. Top Right Color:", top_right_color)
        print("3. Bottom Left Color:", bottom_left_color)
        print("4. Bottom Right Color:", bottom_right_color)

        choice = None
        while choice not in [1, 2, 3, 4]:
            try:
                choice = int(input("Enter the number corresponding to the desired option: "))
            except ValueError:
                print("Invalid choice. Please enter a number.")

        if choice == 1:
            transparency_color = top_left_color
        elif choice == 2:
            transparency_color = top_right_color
        elif choice == 3:
            transparency_color = bottom_left_color
        elif choice == 4:
            transparency_color = bottom_right_color
        else:
            print("Invalid choice. Exiting...")
            sys.exit(1)

    return transparency_color

def make_color_transparent(image_path):
    # Open the image file
    if "/" not in image_path:
        directory = os.path.dirname(os.path.abspath(__file__))
        image_path = os.path.join(directory, 'assets', image_path + '.png' if '.' not in image_path else image_path)

    image = Image.open(image_path)
    image = image.convert("RGBA")
    pixel_data = image.load()

    transparency_color = calculate_corner_colors(image_path)

    # Loop through each pixel and make pixels of the transparency color transparent
    for y in range(image.size[1]):
        for x in range(image.size[0]):
            # Check if the pixel color is equal to the transparency color
            if pixel_data[x, y] == transparency_color:
                # Make the pixel transparent
                pixel_data[x, y] = (0, 0, 0, 0)  # Set (0, 0, 0, 0) for fully transparent pixels

    image.save(image_path)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the image path as an argument.")
        sys.exit(1)

    input_image = sys.argv[1]
    make_color_transparent(input_image)

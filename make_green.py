from PIL import Image
import colorsys
import os
import sys

def get_average_hue(image):
    width, height = image.size
    total_hue = 0
    pixel_count = 0
    
    for x in range(width):
        for y in range(height):
            r, g, b, _ = image.getpixel((x, y))
            
            h, _, _ = colorsys.rgb_to_hls(r/255, g/255, b/255)
            
            total_hue += h
            pixel_count += 1
    
    # Calculate the average hue
    average_hue = total_hue / pixel_count
    
    return average_hue

def change_hue_to_green(image_path):
    if "/" not in image_path:
        directory = os.path.dirname(os.path.abspath(__file__))
        image_path = os.path.join(directory, 'assets', image_path + '.png' if '.' not in image_path else image_path)
    else:
        quit('Just the name of the file please')

    # Open the image using Pillow
    image = Image.open(image_path)
    image = image.convert("RGBA")
    
    # Get the average hue of the image
    average_hue = get_average_hue(image)
    
    # Iterate over each pixel in the image
    width, height = image.size
    for x in range(width):
        for y in range(height):
            # Get the RGB values of the pixel
            r, g, b, a = image.getpixel((x, y))
            
            # Convert RGB values to HLS (Hue, Lightness, Saturation) color space
            h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
            
            # Calculate the hue distance from the average hue
            hue_distance = h - average_hue
            
            # Shift the hue to green (120 degrees) based on the distance from the average
            h = (average_hue + hue_distance + 120/360) % 1.0
            
            # Convert the color back to RGB
            r, g, b = colorsys.hls_to_rgb(h, l, s)
            
            # Update the pixel in the image
            image.putpixel((x, y), (int(r*255), int(g*255), int(b*255), a))
    
    # Save the modified image
    output_path = "green_hue_image.png"
    image.save(image_path.replace('.png', '_green.png'))
    print(f"Modified image saved as '{output_path}'.")



if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the image path as an argument.")
        sys.exit(1)

    change_hue_to_green(sys.argv[1])

import cv2
import numpy as np

def original(img):
    return img

def negative(img):
    return 255 - img

# Converte para escala cinza
def gray_scale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Converte para RGB -> HSV
def rgb_to_hsv_channels(img: np.ndarray):
    hsv_img = cv2.cvtColor(img, cv2.COLOR_RGB2HSV)
    h, s, v = cv2.split(hsv_img)
    return h, s, v

# Converte para HSV -> RGB
def hsv_channels_to_rgb(h: np.ndarray, s: np.ndarray, v: np.ndarray) -> np.ndarray:
    hsv_img = cv2.merge([h, s, v])
    return cv2.cvtColor(hsv_img, cv2.COLOR_HSV2RGB)
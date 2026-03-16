import cv2
import numpy as np


def rgb_channels(img: np.ndarray, **params) -> np.ndarray:
    b, g, r = cv2.split(img)
    divider = np.full((4, img.shape[1]), 200, dtype=np.uint8)
    return np.vstack([r, divider, g, divider, b])


def hsv_channels(img: np.ndarray, **params) -> np.ndarray:

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    divider = np.full((4, img.shape[1]), 200, dtype=np.uint8)
    return np.vstack([h, divider, s, divider, v])

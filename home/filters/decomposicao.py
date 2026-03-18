import cv2
import numpy as np

def rgb_channels(img: np.ndarray, **params) -> dict:
    b, g, r = cv2.split(img)
    return {
        'channels': [
            {'label': 'Canal R (Vermelho)', 'data': r},
            {'label': 'Canal G (Verde)',    'data': g},
            {'label': 'Canal B (Azul)',     'data': b},
        ]
    }


def hsv_channels(img: np.ndarray, **params) -> dict:
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    h, s, v = cv2.split(hsv)
    return {
        'channels': [
            {'label': 'Canal H (Matiz)',      'data': h},
            {'label': 'Canal S (Saturação)',  'data': s},
            {'label': 'Canal V (Valor)',      'data': v},
        ]
    }
import cv2
import numpy as np
from .geral import gray_scale, rgb_to_hsv_channels, hsv_channels_to_rgb

"""
Casos de transformações de intensidade:
- Limiarização e fatiamento:
Se colorida: 
1. Converte para escala de cinza 
2. Aplica a transformação
3. Dá o resultado em escala de cinza

- Demais transformações:
Se colorida: 
1. Converte para HSV 
2. Aplica transformação
3. Converte para RGB
( Para preservar tonalidades de cada canal)
"""

def threshold(img: np.ndarray, **params) -> np.ndarray:
    k = int(params.get('k', 127))
    gray = img if len(img.shape) == 2 else gray_scale(img)
    _, result = cv2.threshold(gray, k, 255, cv2.THRESH_BINARY)
    return result


def log_transform(img: np.ndarray, **params) -> np.ndarray:
    """s = c * log(1 + r)"""
    c = float(params.get('c', 1.0))
    is_color = len(img.shape) == 3

    if is_color:
        h, s, target_channel = rgb_to_hsv_channels(img)
    else:
        target_channel = img.copy()

    img_float = target_channel.astype(np.float32) / 255.0
    log_image = np.log1p(img_float)
    
    max_val = np.max(log_image)
    if max_val > 0:
        log_image = log_image / max_val
        
    result_channel = np.uint8(np.clip(c * log_image, 0, 1) * 255)

    if is_color:
        return hsv_channels_to_rgb(h, s, result_channel)
    return result_channel


def power_transform(img: np.ndarray, **params) -> np.ndarray:
    """s = c * r^gamma"""
    gamma = float(params.get('gamma', 1.0))
    c = float(params.get('c', 1.0))
    is_color = len(img.shape) == 3

    if is_color:
        h, s, target_channel = rgb_to_hsv_channels(img)
    else:
        target_channel = img.copy()

    img_float = target_channel.astype(np.float32) / 255.0
    result = c * np.power(img_float, gamma)
    result_channel = np.uint8(np.clip(result, 0, 1) * 255)

    if is_color:
        return hsv_channels_to_rgb(h, s, result_channel)
    return result_channel


def equalize_histogram(img: np.ndarray, **params) -> np.ndarray:
    is_color = len(img.shape) == 3

    if is_color:
        h, s, target_channel = rgb_to_hsv_channels(img)
    else:
        target_channel = img.copy()

    result_channel = cv2.equalizeHist(target_channel)

    if is_color:
        return hsv_channels_to_rgb(h, s, result_channel)
    return result_channel


def intensity_slicing(img: np.ndarray, **params) -> np.ndarray:
    a           = int(params.get('low', 100))
    b           = int(params.get('high', 200))
    preserve_bg = str(params.get('preserve_bg', 'false')).lower() == 'true'

    gray = img if len(img.shape) == 2 else gray_scale(img)

    mask = (gray >= a) & (gray <= b)

    if preserve_bg:
        result = gray.copy()
        result[mask] = 255
    else:
        result = np.where(mask, 255, 0).astype(np.uint8)

    return result
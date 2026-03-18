import cv2
import numpy as np
from .geral import gray_scale


def sobel(img: np.ndarray, **params) -> np.ndarray:
    gray = img if len(img.shape) == 2 else gray_scale(img)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = cv2.magnitude(sobelx, sobely)
    return np.uint8(np.clip(magnitude, 0, 255))


def unsharp_mask(img: np.ndarray, **params) -> np.ndarray:
    """Máscara de aguçamento: f_aguçada = f + k * (f - f_suavizada)"""
    k = float(params.get('k', 1.0))
    s = int(params.get('s', 1))
    kernel_size = (s * 2) + 1
    blurred = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)
    mask = cv2.subtract(img, blurred)
    sharpened = cv2.addWeighted(img, 1.0, mask, k, 0)
    return np.clip(sharpened, 0, 255).astype(np.uint8)


def laplacian_sharpening(img: np.ndarray, **params) -> np.ndarray:

    if len(img.shape) == 2:
        img_f = img.astype(np.float64) 
        lap = cv2.Laplacian(img_f, cv2.CV_64F, ksize=3)
        lap_abs   = np.uint8(np.clip(np.abs(lap), 0, 255))
        sharpened = np.uint8(np.clip(img_f - lap, 0, 255))
    else:
        channels_sharpened = []
        channels_lap = []

        for i in range(3):
            canal = img[:, :, i].astype(np.float64)  
            lap = cv2.Laplacian(canal, cv2.CV_64F, ksize=3)
            channels_lap.append(np.clip(np.abs(lap), 0, 255).astype(np.float32))
            channels_sharpened.append(np.clip(canal - lap, 0, 255).astype(np.float32))

        lap_abs   = np.uint8(cv2.merge(channels_lap))
        sharpened = np.uint8(cv2.merge(channels_sharpened))

    return {
        'channels': [
            {'label': 'Laplaciano',     'data': lap_abs},
            {'label': 'Imagem Aguçada', 'data': sharpened},
        ]
    }

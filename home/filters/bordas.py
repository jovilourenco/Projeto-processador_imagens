import cv2
import numpy as np


def sobel(img: np.ndarray, **params) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
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

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    lap = cv2.Laplacian(gray, cv2.CV_64F, ksize=3)
    lap_abs = np.uint8(np.clip(np.abs(lap), 0, 255))
    sharpened = np.uint8(np.clip(gray.astype(np.float32) - lap, 0, 255))

    # Linha divisória branca de 4px entre as duas imagens
    divider = np.full((4, gray.shape[1]), 200, dtype=np.uint8)
    return np.vstack([sharpened, divider, lap_abs])

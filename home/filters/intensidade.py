import cv2
import numpy as np


def threshold(img: np.ndarray, **params) -> np.ndarray:
    k = int(params.get('k', 127))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, result = cv2.threshold(gray, k, 255, cv2.THRESH_BINARY)
    return result


def log_transform(img: np.ndarray, **params) -> np.ndarray:
    """s = c * log(1 + r)"""
    c = float(params.get('c', 1.0))
    img_float = img.astype(np.float32) / 255.0
    log_image = np.log1p(img_float)
    log_image = log_image / np.max(log_image)
    return np.uint8(np.clip(c * log_image, 0, 1) * 255)


def power_transform(img: np.ndarray, **params) -> np.ndarray:
    """s = c * r^gamma"""
    gamma = float(params.get('gamma', 1.0))
    c = float(params.get('c', 1.0))
    img_float = img.astype(np.float32) / 255.0
    result = c * np.power(img_float, gamma)
    return np.uint8(np.clip(result, 0, 1) * 255)


def equalize_histogram(img: np.ndarray, **params) -> np.ndarray:
    """Equaliza no canal Y (YCrCb) para preservar as cores."""
    img_ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    img_ycrcb[:, :, 0] = cv2.equalizeHist(img_ycrcb[:, :, 0])
    return cv2.cvtColor(img_ycrcb, cv2.COLOR_YCrCb2BGR)


def intensity_slicing(img: np.ndarray, **params) -> np.ndarray:
    A           = int(params.get('A', 100))
    B           = int(params.get('B', 200))
    preserve_bg = str(params.get('preserve_bg', 'false')).lower() == 'true'

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    mask = (gray >= A) & (gray <= B)

    if preserve_bg:
        result = gray.copy()
        result[mask] = 255
    else:
        result = np.where(mask, 255, 0).astype(np.uint8)

    return result

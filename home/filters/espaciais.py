import cv2
import numpy as np


def gaussian(img: np.ndarray, **params) -> np.ndarray:
    s = int(params.get('s', 1))
    kernel_size = (s * 2) + 1
    return cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)


def mean_filter(img: np.ndarray, **params) -> np.ndarray:
    s = int(params.get('s', 1))
    kernel_size = (s * 2) + 1
    return cv2.blur(img, (kernel_size, kernel_size))


def median_filter(img: np.ndarray, **params) -> np.ndarray:
    s = int(params.get('s', 1))
    kernel_size = (s * 2) + 1
    return cv2.medianBlur(img, kernel_size)


def min_filter(img: np.ndarray, **params) -> np.ndarray:
    s = int(params.get('s', 1))
    kernel_size = (s * 2) + 1
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    return cv2.erode(img, kernel)


def max_filter(img: np.ndarray, **params) -> np.ndarray:
    s = int(params.get('s', 1))
    kernel_size = (s * 2) + 1
    kernel = np.ones((kernel_size, kernel_size), np.uint8)
    return cv2.dilate(img, kernel)


def adaptive_median(img: np.ndarray, **params) -> np.ndarray:
    smax = int(params.get('smax', 7))
    if smax % 2 == 0:
        smax += 1
    smax = max(3, smax)

    # Se for colorida, processa cada canal separadamente e reconstrói
    if len(img.shape) == 3:
        canais = cv2.split(img)
        canais_filtrados = [_adaptive_median_channel(c, smax) for c in canais]
        return cv2.merge(canais_filtrados)

    return _adaptive_median_channel(img, smax)


def _adaptive_median_channel(gray: np.ndarray, smax: int) -> np.ndarray:
    """Aplica a mediana adaptativa em um único canal 2D."""
    gray = gray.astype(np.int32)
    h, w = gray.shape
    result = gray.copy()
    pending = np.ones((h, w), dtype=bool)

    s = 3
    while s <= smax and np.any(pending):
        pad = s // 2
        padded = np.pad(gray, pad, mode='reflect')

        patches = []
        for dy in range(s):
            for dx in range(s):
                patches.append(padded[dy:dy + h, dx:dx + w])
        patches = np.array(patches, dtype=np.int32)

        zmin = patches.min(axis=0)
        zmax = patches.max(axis=0)
        zmed = np.median(patches, axis=0).astype(np.int32)
        zxy  = gray

        stageA_ok    = (zmin < zmed) & (zmed < zmax)
        resolved_now = pending & stageA_ok
        stageB_ok    = (zmin < zxy) & (zxy < zmax)

        result = np.where(resolved_now & stageB_ok,  zxy,  result)
        result = np.where(resolved_now & ~stageB_ok, zmed, result)

        pending = pending & ~resolved_now
        s += 2

    if np.any(pending):
        pad = smax // 2
        padded = np.pad(gray, pad, mode='reflect')
        patches = []
        for dy in range(smax):
            for dx in range(smax):
                patches.append(padded[dy:dy + h, dx:dx + w])
        patches = np.array(patches, dtype=np.int32)
        zmed_final = np.median(patches, axis=0).astype(np.int32)
        result = np.where(pending, zmed_final, result)

    return np.clip(result, 0, 255).astype(np.uint8)

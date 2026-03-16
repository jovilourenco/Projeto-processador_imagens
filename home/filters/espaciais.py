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
    """
    Mediana adaptativa: aplica mediana com kernel crescente pixel a pixel.
    Smax define o tamanho máximo do kernel (deve ser ímpar).
    """
    smax = int(params.get('smax', 7))
    if smax % 2 == 0:
        smax += 1

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    result = gray.copy()
    h, w = gray.shape

    for i in range(h):
        for j in range(w):
            s = 3
            while s <= smax:
                pad = s // 2
                # Garante que a janela não ultrapasse as bordas
                r0, r1 = max(i - pad, 0), min(i + pad + 1, h)
                c0, c1 = max(j - pad, 0), min(j + pad + 1, w)
                window = gray[r0:r1, c0:c1]

                zmin = int(window.min())
                zmax = int(window.max())
                zmed = int(np.median(window))
                zxy  = int(gray[i, j])

                if zmin < zmed < zmax:
                    # Estágio B: verifica se o pixel atual não é impulso
                    result[i, j] = zxy if zmin < zxy < zmax else zmed
                    break
                else:
                    s += 2  # Aumenta o kernel

            else:
                # Tamanho máximo atingido: usa a mediana
                result[i, j] = int(np.median(gray[i - smax//2:i + smax//2 + 1,
                                                    j - smax//2:j + smax//2 + 1]))
    return result
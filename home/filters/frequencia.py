import cv2
import numpy as np


def _make_gaussian_mask(shape, D0, high_pass=False):
    """Máscara Gaussiana no domínio da frequência."""
    rows, cols = shape
    crow, ccol = rows // 2, cols // 2
    u = np.arange(rows).reshape(-1, 1) - crow
    v = np.arange(cols).reshape(1, -1) - ccol
    D = np.sqrt(u**2 + v**2)
    H = np.exp(-(D**2) / (2 * D0**2))
    return (1 - H) if high_pass else H


def _make_butterworth_mask(shape, D0, n, high_pass=False):
    """Máscara Butterworth no domínio da frequência."""
    rows, cols = shape
    crow, ccol = rows // 2, cols // 2
    u = np.arange(rows).reshape(-1, 1) - crow
    v = np.arange(cols).reshape(1, -1) - ccol
    D = np.sqrt(u**2 + v**2)
    D[crow, ccol] = 1e-10  # evita divisão por zero
    H = 1 / (1 + (D / D0)**(2 * n))
    return (1 - H) if high_pass else H


def _apply_frequency_filter(img: np.ndarray, H: np.ndarray) -> np.ndarray:
    """Aplica a máscara H no espectro de frequência de cada canal."""
    channels = cv2.split(img) if len(img.shape) == 3 else [img]
    result_channels = []

    for ch in channels:
        dft = np.fft.fft2(ch.astype(np.float32))
        dft_shift = np.fft.fftshift(dft)
        filtered = dft_shift * H
        idft = np.fft.ifftshift(filtered)
        channel_back = np.abs(np.fft.ifft2(idft))
        result_channels.append(np.clip(channel_back, 0, 255).astype(np.uint8))

    return cv2.merge(result_channels) if len(result_channels) > 1 else result_channels[0]


def gauss_lpf(img: np.ndarray, **params) -> np.ndarray:
    D0 = float(params.get('D0', 30))
    H = _make_gaussian_mask(img.shape[:2], D0, high_pass=False)
    return _apply_frequency_filter(img, H)


def gauss_hpf(img: np.ndarray, **params) -> np.ndarray:
    D0 = float(params.get('D0', 30))
    H = _make_gaussian_mask(img.shape[:2], D0, high_pass=True)
    return _apply_frequency_filter(img, H)


def butter_lpf(img: np.ndarray, **params) -> np.ndarray:
    D0 = float(params.get('D0', 30))
    n  = int(params.get('n', 2))
    H = _make_butterworth_mask(img.shape[:2], D0, n, high_pass=False)
    return _apply_frequency_filter(img, H)


def butter_hpf(img: np.ndarray, **params) -> np.ndarray:
    D0 = float(params.get('D0', 30))
    n  = int(params.get('n', 2))
    H = _make_butterworth_mask(img.shape[:2], D0, n, high_pass=True)
    return _apply_frequency_filter(img, H)
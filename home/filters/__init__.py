from .geral import original, negative, gray_scale
from .intensidade import (
    threshold, log_transform, power_transform,
    equalize_histogram, intensity_slicing
)
from .espaciais import (
    gaussian, mean_filter, median_filter,
    min_filter, max_filter, adaptive_median
)
from .bordas import sobel, unsharp_mask, laplacian_sharpening
from .frequencia import (
    gauss_lpf, gauss_hpf,
    butter_lpf, butter_hpf
)
from .ruido import gaussian_noise, salt_noise, pepper_noise, salt_pepper_noise
from .decomposicao import rgb_channels, hsv_channels

FILTERS = {
    # Geral
    "original":          original,
    "negative":          negative,
    "gray_scale":        gray_scale,
    # Decomposição
    "rgb":               rgb_channels,
    "hsv":               hsv_channels,
    # Intensidade
    "threshold":         threshold,
    "log":               log_transform,
    "power":             power_transform,
    "histogram_eq":      equalize_histogram,   
    "intensity_slice":   intensity_slicing,    
    # Espaciais
    "gaussian":          gaussian,
    "mean":              mean_filter,
    "median":            median_filter,
    "min_filter":        min_filter,
    "max_filter":        max_filter,
    "adaptive_median":   adaptive_median,
    # Bordas
    "sobel":             sobel,
    "unsharp":           unsharp_mask,         
    "laplacian":         laplacian_sharpening,
    # Frequência
    "gauss_lpf":         gauss_lpf,
    "gauss_hpf":         gauss_hpf,
    "butter_lpf":        butter_lpf,
    "butter_hpf":        butter_hpf,
    # Ruído
    "gaussian_noise":    gaussian_noise,
    "salt_noise":        salt_noise,
    "pepper_noise":      pepper_noise,
    "salt_pepper_noise": salt_pepper_noise,
}
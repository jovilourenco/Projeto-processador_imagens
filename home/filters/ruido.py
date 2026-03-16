import numpy as np


def gaussian_noise(img: np.ndarray, **params) -> np.ndarray:
    """Ruído gaussiano com média mu e desvio padrão sigma."""
    sigma = float(params.get('sigma', 25))
    mu    = float(params.get('mu', 0))
    noise = np.random.normal(mu, sigma, img.shape).astype(np.float32)
    noisy = img.astype(np.float32) + noise
    return np.clip(noisy, 0, 255).astype(np.uint8)


def salt_noise(img: np.ndarray, **params) -> np.ndarray:
    """Pixels aleatórios viram branco (sal)."""
    amount = float(params.get('amount', 0.02))
    result = img.copy()
    num_pixels = int(amount * img.shape[0] * img.shape[1])
    coords = [np.random.randint(0, d, num_pixels) for d in img.shape[:2]]
    result[coords[0], coords[1]] = 255
    return result


def pepper_noise(img: np.ndarray, **params) -> np.ndarray:
    """Pixels aleatórios viram preto (pimenta)."""
    amount = float(params.get('amount', 0.02))
    result = img.copy()
    num_pixels = int(amount * img.shape[0] * img.shape[1])
    coords = [np.random.randint(0, d, num_pixels) for d in img.shape[:2]]
    result[coords[0], coords[1]] = 0
    return result


def salt_pepper_noise(img: np.ndarray, **params) -> np.ndarray:
    """Combina sal e pimenta com proporção configurável."""
    amount = float(params.get('amount', 0.02))
    ratio  = float(params.get('ratio', 0.5))
    result = img.copy()
    total  = int(amount * img.shape[0] * img.shape[1])

    # Sal
    n_salt = int(total * ratio)
    coords = [np.random.randint(0, d, n_salt) for d in img.shape[:2]]
    result[coords[0], coords[1]] = 255

    # Pimenta
    n_pepper = total - n_salt
    coords = [np.random.randint(0, d, n_pepper) for d in img.shape[:2]]
    result[coords[0], coords[1]] = 0

    return result
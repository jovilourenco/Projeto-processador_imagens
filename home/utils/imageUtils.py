import cv2
import numpy as np
import base64

ALLOWED_EXTENSIONS = ('.png', '.jpg', '.jpeg')


def validate_extension(filename: str) -> bool:
    """Retorna True se a extensão do arquivo for permitida."""
    return filename.lower().endswith(ALLOWED_EXTENSIONS)


def decode_image(file) -> np.ndarray:
    """
    Converte o arquivo enviado pelo Django (InMemoryUploadedFile)
    em np.ndarray BGR, removendo canal alpha se necessário.

    Lança ValueError se a imagem não puder ser decodificada.
    """
    img_array = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_UNCHANGED)

    if img is None:
        raise ValueError("Não foi possível decodificar a imagem enviada.")

    # PNG com transparência: remove canal alpha compondo sobre fundo branco
    if len(img.shape) == 3 and img.shape[2] == 4:
        alpha = img[:, :, 3:4].astype(np.float32) / 255.0
        bgr   = img[:, :, :3].astype(np.float32)
        white = np.ones_like(bgr) * 255.0
        composed = (bgr * alpha + white * (1 - alpha))
        img = composed.astype(np.uint8)

    # Detecta cinza visual: 3 canais onde B == G == R
    if len(img.shape) == 3 and img.shape[2] == 3:
        b, g, r = img[:, :, 0], img[:, :, 1], img[:, :, 2]
        if np.array_equal(b, g) and np.array_equal(b, r):
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    return img


def encode_image(img: np.ndarray) -> str:
    """
    Converte np.ndarray para string Base64 (PNG).
    Usado para enviar a imagem processada de volta ao frontend.
    """
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode('utf-8')
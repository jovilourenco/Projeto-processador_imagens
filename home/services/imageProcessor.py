import cv2
import numpy as np
from ..filters import FILTERS

def process(img: np.ndarray, process_type: str, params: dict) -> dict:
    """
    Orquestra o pipeline de processamento.
    Retorna dict com 'result' (np.ndarray) e 'histogram' (lista por canal).
    """
    filter_fn = FILTERS.get(process_type)

    if filter_fn is None:
        raise ValueError(f"Filtro desconhecido: '{process_type}'")

    result = filter_fn(img, **params)
    histogram = _generate_histogram(result)

    return {
        "result": result,
        "histogram": histogram,
    }

def generate_histogram_only(img: np.ndarray) -> dict:
    """Exposto para a view de carregamento — gera histograma sem processar."""
    return _generate_histogram(img)


def _generate_histogram(img: np.ndarray) -> dict:

    histograms = {}

    if len(img.shape) == 2:
        # Imagem em escala de cinza
        hist = cv2.calcHist([img], [0], None, [256], [0, 256])
        histograms["gray"] = hist.flatten().tolist()
        print("Entrou aqui, então em escala de cinza")
    else:
        # Imagem colorida (BGR)
        for i, canal in enumerate(["b", "g", "r"]):
            hist = cv2.calcHist([img], [i], None, [256], [0, 256])
            histograms[canal] = hist.flatten().tolist()

    return histograms
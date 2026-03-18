import cv2
import numpy as np
from ..filters import FILTERS
from ..utils.imageUtils import encode_image

def process(img: np.ndarray, process_type: str, params: dict) -> dict:
    filter_fn = FILTERS.get(process_type)

    if filter_fn is None:
        raise ValueError(f"Filtro desconhecido: '{process_type}'")

    result = filter_fn(img, **params)

    # Resultado multi-canal (decomposição, laplaciano, etc.)
    if isinstance(result, dict) and 'channels' in result:
        channels_out = []
        for ch in result['channels']:
            channels_out.append({
                'label': ch['label'],
                'image': encode_image(ch['data']),
            })
        return {
            'result': None,
            'histogram': {},
            'channels': channels_out,
        }

    histogram = _generate_histogram(result)

    return {
        "result": result,
        "histogram": histogram,
        'channels': None,
    }

def _generate_histogram(img: np.ndarray) -> dict:
    histograms = {}

    if len(img.shape) == 2:
        hist = cv2.calcHist([img], [0], None, [256], [0, 256])
        histograms["gray"] = hist.flatten().tolist()
    else:
        for i, canal in enumerate(["b", "g", "r"]):
            hist = cv2.calcHist([img], [i], None, [256], [0, 256])
            histograms[canal] = hist.flatten().tolist()

    return histograms
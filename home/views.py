import json
from django.shortcuts import render
from django.http import JsonResponse

from .services.imageProcessor import process, _generate_histogram
from .utils.imageUtils import decode_image, encode_image, validate_extension


def home(request):
    return render(request, 'home.html')

def carregar_imagem(request):
    if request.method != 'POST' or not request.FILES.get('image'):
        return JsonResponse({'error': 'Requisição inválida'}, status=400)

    try:
        file = request.FILES['image']

        if not validate_extension(file.name):
            return JsonResponse(
                {'error': 'Apenas arquivos PNG e JPEG são permitidos'},
                status=400
            )

        img = decode_image(file)
        histogram = _generate_histogram(img)

        return JsonResponse({
            'histogram': histogram,
            'is_grayscale': 'gray' in histogram,  # ← ADICIONAR ISSO
        })

    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def processar_imagem(request):
    if request.method != 'POST' or not request.FILES.get('image'):
        return JsonResponse({'error': 'Requisição inválida'}, status=400)

    try:
        file = request.FILES['image']

        if not validate_extension(file.name):
            return JsonResponse(
                {'error': 'Apenas arquivos PNG e JPEG são permitidos'},
                status=400
            )

        img = decode_image(file)

        process_type = request.POST.get('process', 'original')
        params = json.loads(request.POST.get('params', '{}'))
        output = process(img, process_type, params)
        if output.get('channels') is not None:             
            return JsonResponse({
                'channels': output['channels'],
            })

        return JsonResponse({
            'image_out':  encode_image(output['result']),
            'histogram':  output['histogram'],
        })

    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
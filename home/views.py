import cv2
import numpy as np
import base64
import json
from django.shortcuts import render
from django.http import JsonResponse

# View que carrega a página home
def home(request):
    return render(request, 'home.html')

# View que processa a imagem
def processar_imagem(request):
    if request.method == 'POST' and request.FILES.get('image'):
        try:
            file = request.FILES['image']
            
            # Validação
            if not file.name.lower().endswith('.png'):
                return JsonResponse({'error': 'Apenas arquivos PNG são permitidos'}, status=400)

            img_array = np.frombuffer(file.read(), np.uint8)
            
            # Lê os 4 canais (Alpha) se existirem
            img = cv2.imdecode(img_array, cv2.IMREAD_UNCHANGED)

            # Como a imagem é png, temos que remover o canal alpha para não quebrar alguns filtros
            if img.shape[2] == 4:
                # Cria um fundo branco onde era transparente
                img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)

            process_type = request.POST.get('process', 'original')
            params = json.loads(request.POST.get('params', '{}'))

            result = img.copy()

            #Negativo
            if process_type == 'negative':
                result = 255 - img

            #Limiarização
            elif process_type == 'threshold':
                k = int(params.get('k', 127))
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                _, result = cv2.threshold(gray, k, 255, cv2.THRESH_BINARY)

            #Transformação Logarítmica: s = c * log(1 + r)
            elif process_type == 'log':
                # define um imagem float
                img_float = img.astype(np.float32)

                # Normaliza
                img_norm = img_float / 255.0
                
                # Aplica o log
                log_image = np.log1p(img_norm)

                # Deixa o intervalo entre 0 - 255
                log_image = log_image / np.max(log_image)
                result = np.uint8(log_image * 255) # img_float/255 * 255 = img_float (porem alterada com o log)
            #Filtro Passa-Baixa Gaussiano
            elif process_type == 'gaussian':
                s = int(params.get('s', 1))
                # O kernel deve ser ímpar: 2s + 1
                kernel_size = (s * 2) + 1
                result = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)

            #Realce de Sobel
            elif process_type == 'sobel':
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
                sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
                result = cv2.magnitude(sobelx, sobely)
                result = np.uint8(np.absolute(result))

            # --- Converte de volta para Base64 ---
            # O JavaScript não lê arquivos .jpg direto do Python, 
            # então mandamos a imagem como uma "string de texto" (Base64)
            _, buffer = cv2.imencode('.png', result)
            encoded_img = base64.b64encode(buffer).decode('utf-8')

            return JsonResponse({'image_out': encoded_img})

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Requisição inválida'}, status=400)
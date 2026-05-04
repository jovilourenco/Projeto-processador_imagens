function hideSiteLoader() {
    const siteLoader = document.getElementById('siteLoader');
    if (siteLoader) {
        siteLoader.style.opacity = '0'; // Faz sumir suavemente
        setTimeout(() => { siteLoader.style.display = 'none'; }, 500); // Remove do HTML
    }
}

// Verifica imediatamente se a página já carregou (para lidar com refreshes no cache)
if (document.readyState === 'complete') {
    hideSiteLoader();
} else {
    // Se não carregou, espera o evento 'load'
    window.addEventListener('load', hideSiteLoader);
}


// 2. LÓGICA PRINCIPAL DA APLICAÇÃO (Processamento Digital de Imagens)
document.addEventListener('DOMContentLoaded', function() {
    let currentProcess = 'original';

    // VARIÁVEIS DE HISTÓRICO 
    const MAX_HISTORY = 10; // Limite para não estourar a memória do navegador
    let imageHistory = [];
    let historyIndex = -1;

    function saveHistoryState(dataUrl) {
        // Se o usuário deu Ctrl+Z e depois aplicou um NOVO filtro, 
        // nós descartamos o futuro alternativo (tudo que estava à frente do index atual)
        if (historyIndex < imageHistory.length - 1) {
            imageHistory = imageHistory.slice(0, historyIndex + 1);
        }
        
        imageHistory.push(dataUrl);
        
        // Mantém a pilha dentro do limite
        if (imageHistory.length > MAX_HISTORY) {
            imageHistory.shift(); // Remove o elemento mais antigo do início do array
        } else {
            historyIndex++;
        }
    }

    const imageInput = document.getElementById('imageInput');
    const imgIn = document.getElementById('imgInput');
    const imgOut = document.getElementById('imgOutput');
    const paramsDiv = document.getElementById('paramsContainer');
    
    /* verificam o campo de imagem original para que quando copiado 
     alguma coisa abra o modal */
    const panelInput = document.getElementById('panelInput');
    const uploadModalEl = document.getElementById('uploadModal');
    const bootstrapModal = new bootstrap.Modal(uploadModalEl);

    // Listener ao input do usuário 
    panelInput.addEventListener('click', () => {
        // desabilita caso o usuário já tenha colocado uma imagem
        if(!imgIn.src || imgIn.classList.contains('d-none')){
            bootstrapModal.show();
        }
    });

    // Gatilho para a imagem original (envio de metadatas dimensões e tipo)
    imgIn.onload = function() {
        if (imgIn.src && imgIn.src !== window.location.href) {
            atualizarMetaDados(imgIn, 'metaInput', imageInput.files[0]);
        }
    };

    // Gatilho para a imagem processada
    imgOut.onload = function() {
        if (imgOut.src && imgOut.src.startsWith('data:image/')) {
            atualizarMetaDados(imgOut, 'metaOutput');
        }
    };

    // LÓGICA DE DESFAZER / REFAZER 
    document.addEventListener('keydown', async function(e) {
        // Ignora se o modal de upload estiver aberto ou se não houver histórico
        if (document.body.classList.contains('modal-open') || imageHistory.length === 0) return;

        // Ctrl + Z (Desfazer)
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                await restoreState(imageHistory[historyIndex]);
            }
        }

        // Ctrl + Y (Refazer)
        if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            if (historyIndex < imageHistory.length - 1) {
                historyIndex++;
                await restoreState(imageHistory[historyIndex]);
            }
        }


        // Ctrl + S (Aplicar filtro)
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();

            // evita aplicar sem imagem processada
            const imgOutSrc = imgOut.src;
            if (!imgOutSrc || !imgOutSrc.startsWith('data:image/')) return;

            // simula clique no botão
            btnApplyFilter?.click();
        }
    });

    // Função que reconstrói a tela de acordo com o passo no histórico
    async function restoreState(dataUrl) {
        imgIn.src = dataUrl;
        
        // Converte de volta para File para o backend conseguir ler
        const file = dataURLtoFile(dataUrl, 'historico.png');
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;

        // Atualiza os metadados visuais
        atualizarMetaDados(imgIn, 'metaInput', file); 
        
        // Recarrega o histograma daquele estado
        await loadOriginalHistogram(file);

        // Reseta a interface visual para "Original" para mostrar limpo
        const activeBtn = document.querySelector('#processSelector .active');
        if (activeBtn) activeBtn.classList.remove('active');
        document.querySelector('[data-process="original"]').classList.add('active');
        currentProcess = 'original';
        paramsDiv.innerHTML = configs['original']();
        
        if (btnApplyFilter) btnApplyFilter.classList.add('d-none');
        
        // Processa a imagem para exibir a saída corretamente
        processImage();
    }

    // Configuração de controles por processo
    const configs = {
        // === GERAL ===
        'original': () => `<p class="text-white mb-0">Exibindo imagem original.</p>`,
        'negative': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        'gray_scale': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        
        // === DECOMPOSIÇÃO ===
        'rgb': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        'hsv': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        
        // === TRANSFORMAÇÕES DE INTENSIDADE ===
        'threshold': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Limiar (k): 
                        <input type="number" min="0" max="255" id="val_k" class="pdi-ctrl" value="127" 
                            oninput="document.getElementById('param_k').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_k" min="0" max="255" value="127" 
                        oninput="document.getElementById('val_k').value = this.value">
                </div>
            </div>`,
        
        'log': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Ganho (c):
                        <input type="number" min="0.1" max="5" step="0.1" id="val_c" class="pdi-ctrl" value="1.0"
                            oninput="document.getElementById('param_c').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_c" min="0.1" max="5" step="0.1" value="1.0"
                        oninput="document.getElementById('val_c').value = this.value">
                </div>
            </div>`,
        
        'power': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Gamma:
                        <input type="number" min="0.1" max="5" step="0.1" id="val_gamma" class="pdi-ctrl" value="1.0"
                            oninput="document.getElementById('param_gamma').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_gamma" min="0.1" max="5" step="0.1" value="1.0"
                        oninput="document.getElementById('val_gamma').value = this.value">
                </div>
            </div>`,
        
        'histogram_eq': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        
        'intensity_slice': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Mínimo (low):
                        <input type="number" min="0" max="255" id="val_low" class="pdi-ctrl" value="100"
                            oninput="document.getElementById('param_low').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_low" min="0" max="255" value="100"
                        oninput="document.getElementById('val_low').value = this.value">
                    
                    <label class="form-label small mt-2">Máximo (high):
                        <input type="number" min="0" max="255" id="val_high" class="pdi-ctrl" value="200"
                            oninput="document.getElementById('param_high').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_high" min="0" max="255" value="200"
                        oninput="document.getElementById('val_high').value = this.value">
                    
                    <div class="form-check mt-2">
                        <input type="checkbox" class="form-check-input pdi-ctrl" id="param_preserve_bg" 
                            onchange="processImage()">
                        <label class="form-check-label small">Preservar fundo</label>
                    </div>
                </div>
            </div>`,
        
        // === FILTROS ESPACIAIS ===
        'gaussian': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Intensidade (Sigma): 
                        <input type="number" min="1" max="70" id="val_s" class="pdi-ctrl" value="1"
                            oninput="document.getElementById('param_s').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_s" min="1" max="70" value="1"
                        oninput="document.getElementById('val_s').value = this.value">
                </div>
            </div>`,
        
        'mean': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Tamanho (s):
                        <input type="number" min="1" max="20" id="val_s" class="pdi-ctrl" value="1"
                            oninput="document.getElementById('param_s').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_s" min="1" max="20" value="1"
                        oninput="document.getElementById('val_s').value = this.value">
                </div>
            </div>`,
        
        'median': () => configs['mean'](),
        'min_filter': () => configs['mean'](),
        'max_filter': () => configs['mean'](),
        
        'adaptive_median': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Janela máxima (smax):
                        <input type="number" min="3" max="11" step="2" id="val_smax" class="pdi-ctrl" value="7"
                            oninput="document.getElementById('param_smax').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_smax" min="3" max="11" step="2" value="7"
                        oninput="document.getElementById('val_smax').value = this.value">
                </div>
            </div>`,
        
        // === REALCE E BORDAS ===
        'sobel': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        
        'unsharp': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Ganho (k):
                        <input type="number" min="0.1" max="5" step="0.1" id="val_k" class="pdi-ctrl" value="1.0"
                            oninput="document.getElementById('param_k').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_k" min="0.1" max="5" step="0.1" value="1.0"
                        oninput="document.getElementById('val_k').value = this.value">
                    
                    <label class="form-label small mt-2">Tamanho janela (s):
                        <input type="number" min="1" max="20" id="val_s" class="pdi-ctrl" value="1"
                            oninput="document.getElementById('param_s').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_s" min="1" max="20" value="1"
                        oninput="document.getElementById('val_s').value = this.value">
                </div>
            </div>`,
        
        'laplacian': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        
        // === DOMÍNIO DA FREQUÊNCIA ===
        'gauss_lpf': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Corte D0:
                        <input type="number" min="1" max="150" id="val_D0" class="pdi-ctrl" value="30"
                            oninput="document.getElementById('param_D0').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_D0" min="1" max="150" value="30"
                        oninput="document.getElementById('val_D0').value = this.value">
                </div>
            </div>`,
        
        'gauss_hpf': () => configs['gauss_lpf'](),
        
        'butter_lpf': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Corte D0:
                        <input type="number" min="1" max="150" id="val_D0" class="pdi-ctrl" value="30"
                            oninput="document.getElementById('param_D0').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_D0" min="1" max="150" value="30"
                        oninput="document.getElementById('val_D0').value = this.value">
                    
                    <label class="form-label small mt-2">Ordem (n):
                        <input type="number" min="1" max="10" id="val_n" class="pdi-ctrl" value="2"
                            oninput="document.getElementById('param_n').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_n" min="1" max="10" value="2"
                        oninput="document.getElementById('val_n').value = this.value">
                </div>
            </div>`,
        
        'butter_hpf': () => configs['butter_lpf'](),
        
        // === RUÍDO ===
        'gaussian_noise': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Desvio padrão (sigma):
                        <input type="number" min="1" max="100" id="val_sigma" class="pdi-ctrl" value="25"
                            oninput="document.getElementById('param_sigma').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_sigma" min="1" max="100" value="25"
                        oninput="document.getElementById('val_sigma').value = this.value">
                    
                    <label class="form-label small mt-2">Média (mu):
                        <input type="number" min="-50" max="50" id="val_mu" class="pdi-ctrl" value="0"
                            oninput="document.getElementById('param_mu').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_mu" min="-50" max="50" value="0"
                        oninput="document.getElementById('val_mu').value = this.value">
                </div>
            </div>`,
        
        'salt_noise': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        
        'pepper_noise': () => `<p class="text-white mb-0">Nenhum parâmetro necessário.</p>`,
        
        'salt_pepper_noise': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Proporção sal/pimenta (ratio):
                        <input type="number" min="0" max="1" step="0.1" id="val_ratio" class="pdi-ctrl" value="0.5"
                            oninput="document.getElementById('param_ratio').value = this.value">
                    </label>
                    <input type="range" class="form-range pdi-ctrl" id="param_ratio" min="0" max="1" step="0.1" value="0.5"
                        oninput="document.getElementById('val_ratio').value = this.value">
                </div>
            </div>`
    };

    // Troca de Processo
    document.querySelectorAll('#processSelector button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelector('#processSelector .active').classList.remove('active');
            this.classList.add('active');
            currentProcess = this.dataset.process;
            paramsDiv.innerHTML = configs[currentProcess] ? configs[currentProcess]() : configs['original']();
            processImage();
        });
    });

    // Reatividade dos Sliders (parâmetros)
    paramsDiv.addEventListener('input', function(e) {
        if (e.target.classList.contains('pdi-ctrl')) {
            const labelId = 'val_' + e.target.id.split('_')[1];
            if (document.getElementById(labelId)) {
                document.getElementById(labelId).innerText = e.target.value;
            }
            processImage(); // AJAX em tempo real
        }
    });

    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('pdi-ctrl')) {
            // sincroniza o range e o número selecionado
            const sufix = e.target.id.split("_")[1];
            const numInput = document.getElementById('val_' + sufix);
            const rangeInput = document.getElementById('param' + sufix);

            if(e.target.type === 'number' && rangeInput){
                rangeInput.value = e.target.value;
            } else if(e.target.type === 'range' && numInput) {
                numInput.value = e.target.value;
            }

            processImage(); // Atualiza para os dois casos
        }
    });

    // Carregamento de imagem original com Loader
    document.getElementById('btnLoad').addEventListener('click', () => {
        const file = imageInput.files[0];
        if (file) {
            // Valida se é formato de imagem aceito
            if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") { 
                alert("Por favor, selecione apenas arquivos PNG e JPEG.");
                imageInput.value = "";
                return;
            }

            const loaderIn = document.getElementById('loaderInput');
            if (loaderIn) loaderIn.classList.remove('d-none'); // MOSTRA O LOADER DO INPUT

            const reader = new FileReader();
            reader.onload = async (e) => {
                imgIn.src = e.target.result;

                imageHistory = [];
                historyIndex = -1;
                saveHistoryState(e.target.result);

                imgIn.classList.remove('d-none');
                // Não mostra o cursor para adicionar foto no 'imagem original'
                panelInput.style.cursor = 'default';
                document.getElementById('placeholderInput').classList.add('d-none');
                
                if (loaderIn) loaderIn.classList.add('d-none'); // ESCONDE O LOADER

                // ← RESET: volta sempre para "original" ao carregar nova imagem
                const activeBtn = document.querySelector('#processSelector .active');
                if (activeBtn) activeBtn.classList.remove('active');
                document.querySelector('[data-process="original"]').classList.add('active');
                currentProcess = 'original';
                paramsDiv.innerHTML = configs['original']();
                restoreOutputPanel(); // limpa canais de decomposição se houver

                await loadOriginalHistogram(imageInput.files[0]);
                processImage();
            };
            reader.readAsDataURL(file);
        }
    });

    // --- LÓGICA DO BOTÃO APLICAR FILTRO ---
    const btnApplyFilter = document.getElementById('btnApplyFilter');

    // Função auxiliar para converter Base64 para File
    function dataURLtoFile(dataurl, filename) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    // Ação ao clicar em Aplicar Filtro
    btnApplyFilter?.addEventListener('click', async () => {
        const imgOutSrc = document.getElementById('imgOutput').src;
        if (!imgOutSrc || !imgOutSrc.startsWith('data:image/')) return;

        // Converter a imagem final de volta para um arquivo
        const file = dataURLtoFile(imgOutSrc, 'imagem_empilhada.png');
        
        // Inserir esse arquivo no input file original usando DataTransfer
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        imageInput.files = dataTransfer.files;

        // Substituir visualmente a Imagem Original pela Processada
        imgIn.src = imgOutSrc;
        document.getElementById('metaInput').innerHTML = document.getElementById('metaOutput').innerHTML;

        saveHistoryState(imgOutSrc)
        
        // Recarregar o histograma da "nova" imagem original via backend
        await loadOriginalHistogram(file);

        // 5. Resetar a interface para o processo "Original"
        const activeBtn = document.querySelector('#processSelector .active');
        if (activeBtn) activeBtn.classList.remove('active');
        document.querySelector('[data-process="original"]').classList.add('active');
        currentProcess = 'original';
        paramsDiv.innerHTML = configs['original']();
        
        // Esconder o próprio botão
        btnApplyFilter.classList.add('d-none');
        
        // Processar para espelhar a saída e os histogramas
        processImage();
    });

    async function processImage() {
    if (!imageInput.files[0]) return;

    // Mostra loader só para o filtro adaptativo
    const isAdaptive = currentProcess === 'adaptive_median';
    if (isAdaptive) setOutputLoader(true);

    const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        formData.append('process', currentProcess);

        const params = {};
        document.querySelectorAll('.pdi-ctrl').forEach(c => {
            params[c.id.replace('param_', '')] = c.type === 'checkbox' ? c.checked : c.value;;
        });
        formData.append('params', JSON.stringify(params));

        try {
            const response = await fetch('/pdi/processar/', {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await response.json();

            // Imagem original -> Imagem processada: renderiza 3 canais lado a lado
            if (data.channels) {
                renderChannels(data.channels);
                // Deixa o histograma processado como nada
                renderHistogram('histOutput', {}, 1);

                return;
            }

            // Imagem original -> Imagem processada
            if (data.image_out) {
                restoreOutputPanel()
                imgOut.src = "data:image/png;base64," + data.image_out;
                imgOut.classList.remove('d-none');
                document.getElementById('placeholderOutput').classList.add('d-none');

                if (data.histogram) {
                    renderHistogram('histOutput', data.histogram, 1);
                }
                // Visibilidade do botão de aplicar filtro
                if (btnApplyFilter) {
                    if (currentProcess !== 'original') {
                        btnApplyFilter.classList.remove('d-none');
                    } else {
                        btnApplyFilter.classList.add('d-none');
                    }
                }
            }
        } catch (err) {
            console.error("Erro no processamento:", err);
        } finally {
            // Esconde o loader sempre, independente de sucesso ou erro
            if (isAdaptive) setOutputLoader(false);
        }
    }

    // Atualiza meta dados das imagens de input e output
    function atualizarMetaDados(imgElement, displayElementId, file = null) {
        const displayElement = document.getElementById(displayElementId);
        if (!displayElement) return;

        // Usamos naturalWidth para pegar o tamanho real do arquivo, não o tamanho exibido na tela
        const largura = imgElement.naturalWidth || 0;
        const altura = imgElement.naturalHeight || 0;
        
        let tipo = "Desconhecido";

        if (file && file.type) {
            tipo = file.type.split('/')[1].toUpperCase();
        } else if (imgElement.src.startsWith('data:image/')) {
            // Extrai o tipo de uma string base64: "data:image/png;base64,..."
            tipo = imgElement.src.split(';')[0].split('/')[1].toUpperCase();
        }

        if (largura > 0) {
            displayElement.innerHTML = `Dimensões: <b>${largura}x${altura}</b> | Tipo: <b>${tipo}</b>`;
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Função para renderizar os histogramas caso necessário
    function renderHistogram(canvasId, histData, panelIndex = 1) {
        const container = document.getElementById('accessoryData');
        const boxes = container.querySelectorAll('.pdi-histogram-box');

        let canvas = document.getElementById(canvasId);
        if (!canvas) {
            const box = boxes[panelIndex];
            box.innerHTML = '';
            canvas = document.createElement('canvas');
            canvas.id = canvasId;
            canvas.width = 256;
            canvas.height = 50;
            canvas.style.width = '100%';
            box.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const channelColors = { r: '#e05555', g: '#55a055', b: '#5577e0', gray: '#aaaaaa' };
        const channels = Object.keys(histData);
        const maxVal = Math.max(...channels.flatMap(ch => histData[ch]));

        channels.forEach(ch => {
            const values = histData[ch];
            ctx.beginPath();
            ctx.strokeStyle = channelColors[ch] || '#aaaaaa';
            ctx.globalAlpha = channels.length > 1 ? 0.75 : 1.0;
            ctx.lineWidth = 1;
            values.forEach((v, i) => {
                const x = i;
                const y = canvas.height - (v / maxVal) * canvas.height;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
        });

        ctx.globalAlpha = 1.0;
    }

    async function loadOriginalHistogram(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/pdi/carregar/', {
                method: 'POST',
                body: formData,
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await response.json();

            if (data.histogram) {
                renderHistogram('histInput', data.histogram, 0);
            }

            setDecompositionEnabled(!data.is_grayscale);
            setNameNegative(!data.is_grayscale)

        } catch (err) {
            console.error('Erro ao carregar histograma original:', err);
        }
    }

    function renderChannels(channels) {
        const wrap = imgOut.closest('.pdi-canvas-wrap');

        imgOut.classList.add('d-none');
        document.getElementById('placeholderOutput').classList.add('d-none');

        const existing = wrap.querySelector('.pdi-channels-row');
        if (existing) existing.remove();

        // Ativa modo canais no wrap
        wrap.classList.add('pdi-channels-mode');

        const row = document.createElement('div');
        row.className = 'pdi-channels-row';

        channels.forEach(ch => {
            const col = document.createElement('div');
            col.className = 'pdi-channel-col';

            const label = document.createElement('span');
            label.className = 'pdi-channel-label';
            label.textContent = ch.label;

            const img = document.createElement('img');
            img.src = 'data:image/png;base64,' + ch.image;
            img.className = 'pdi-channel-img';
            img.alt = ch.label;

            col.appendChild(label);
            col.appendChild(img);
            row.appendChild(col);
        });

        wrap.appendChild(row);
    }

    function restoreOutputPanel() {
        const wrap = imgOut.closest('.pdi-canvas-wrap');
        const existing = wrap.querySelector('.pdi-channels-row');
        if (existing) existing.remove();

        // Remove modo canais e restaura estilos inline anteriores
        wrap.classList.remove('pdi-channels-mode');
        wrap.style.minHeight = '';
        wrap.style.alignItems = '';
    }

    function setOutputLoader(visible) {
        const loaderOut   = document.getElementById('loaderOutput');
        const imgOut      = document.getElementById('imgOutput');
        const placeholder = document.getElementById('placeholderOutput');

        if (visible) {
            loaderOut.classList.remove('d-none');
            imgOut.classList.add('d-none');
            // Só esconde o placeholder se já houver imagem processada
            if (!imgOut.src || imgOut.src === window.location.href) {
                placeholder.classList.remove('d-none');
            }
        } else {
            loaderOut.classList.add('d-none');
        }
    }

    function setNameNegative(enabled){
    // Pega o botão com base no nome dele
    const negativeButton = document.querySelector('.pdi-process-item[data-process="negative"]');
    
    if (negativeButton) {
        if (enabled) {
            // Quando a imagem é colorida o nome fica como "complemento" da imagem
            negativeButton.textContent = "Complemento (Negativo)";
        } else {
            // Quando em escala de cinza fica somente como negativo 
            negativeButton.textContent = "Negativo";
        }
    }
}

    function setDecompositionEnabled(enabled) {
        const decompositionContainer = document.getElementById('cat-decomp');

        // Seleciona botões de decomposição + botão de escala de cinza
        const blockedButtons = document.querySelectorAll(
            '#cat-decomp .pdi-process-item, [data-process="gray_scale"]'
        );

        if (decompositionContainer) {
            decompositionContainer.style.cursor = enabled ? '' : 'not-allowed';
        }

        blockedButtons.forEach(btn => {
            btn.title = enabled ? '' : 'Indisponível para imagens em escala de cinza';

            if (!enabled) {
                btn.classList.add('pdi-process-disabled');

                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    document.querySelector('[data-process="original"]').classList.add('active');
                    currentProcess = 'original';
                    paramsDiv.innerHTML = configs['original']();
                    processImage();
                }
            } else {
                btn.classList.remove('pdi-process-disabled');
            }
        });
    }

});
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

    // Configuração de controles por processo
    const configs = {
        'original': () => `<p class="text-muted mb-0">Exibindo imagem original.</p>`,
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
        'gaussian': () => `
            <div class="row align-items-center">
                <div class="col-md-12">
                    <label class="form-label small">Intensidade (Sigma): <b id="val_s">1</b></label>
                    <input type="range" class="form-range pdi-ctrl" id="param_s" min="1" max="70" value="1">
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
            reader.onload = (e) => {
                imgIn.src = e.target.result;
                imgIn.classList.remove('d-none');
                // Não mostra o cursor para adicionar foto no 'imagem original'
                panelInput.style.cursor = 'default';
                document.getElementById('placeholderInput').classList.add('d-none');
                
                if (loaderIn) loaderIn.classList.add('d-none'); // ESCONDE O LOADER
                
                processImage();
            };
            reader.readAsDataURL(file);
        }
    });

    async function processImage() {
        if (!imageInput.files[0]) return;

        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        formData.append('process', currentProcess);
        
        // Pega todos os valores dos inputs de parâmetros
        const params = {};
        document.querySelectorAll('.pdi-ctrl').forEach(c => {
            params[c.id.replace('param_', '')] = c.value;
        });
        formData.append('params', JSON.stringify(params));

        try {
            const response = await fetch('/pdi/processar/', { // URL do Django (envia como se fosse um servidor)
                method: 'POST',
                body: formData,
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
            });
            const data = await response.json();
            if (data.image_out) {
                imgOut.src = "data:image/png;base64," + data.image_out;
                imgOut.classList.remove('d-none');
                document.getElementById('placeholderOutput').classList.add('d-none');
            }
        } catch (err) { 
            console.error("Erro no processamento:", err); 
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
});
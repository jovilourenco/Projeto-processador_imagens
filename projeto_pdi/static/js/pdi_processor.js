document.addEventListener('DOMContentLoaded', function() {
    let currentProcess = 'original';
    const imageInput = document.getElementById('imageInput');
    const imgIn = document.getElementById('imgInput');
    const imgOut = document.getElementById('imgOutput');
    const paramsDiv = document.getElementById('paramsContainer');

    // Configuração de controles por processo
    const configs = {
        'original': () => `<p class="text-muted mb-0">Exibindo imagem original.</p>`,
        'threshold': () => `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label class="form-label small">Limiar (k): <b id="val_k">127</b></label>
                    <input type="range" class="form-range pdi-ctrl" id="param_k" min="0" max="255" value="127">
                </div>
            </div>`,
        'gaussian': () => `
            <div class="row align-items-center">
                <div class="col-md-4">
                    <label class="form-label small">Intensidade (Sigma): <b id="val_s">1</b></label>
                    <input type="range" class="form-range pdi-ctrl" id="param_s" min="1" max="20" value="1">
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

    // Carregamento de imagem
    document.getElementById('btnLoad').addEventListener('click', () => {
        const file = imageInput.files[0];
        if (file) {
            if (file.type !== "image/png") { // Valida se é png
            alert("Por favor, selecione apenas arquivos PNG.");
            imageInput.value = "";
            return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                imgIn.src = e.target.result;
                imgIn.classList.remove('d-none');
                document.getElementById('placeholderInput').classList.add('d-none');
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
        } catch (err) { console.error("Erro no processamento:", err); }
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
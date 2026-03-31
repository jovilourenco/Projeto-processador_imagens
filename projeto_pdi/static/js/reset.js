(function() {
    const btnReset = document.getElementById('btnReset');
    const imageInput = document.getElementById('imageInput');
    const imgInput = document.getElementById('imgInput');
    const imgOutput = document.getElementById('imgOutput');
    const panelInput = document.getElementById('panelInput');

    if (!btnReset) return;

    btnReset.addEventListener('click', function() {

        // Esconder botão de aplicar filtro no reset
        const btnApplyFilter = document.getElementById('btnApplyFilter');
        if (btnApplyFilter) btnApplyFilter.classList.add('d-none');

        // Limpa input file
        if (imageInput) imageInput.value = '';

        // Limpa e esconde imagem original
        if (imgInput) {
            imgInput.src = '';
            imgInput.classList.add('d-none');
            document.getElementById('placeholderInput').classList.remove('d-none');
        }

        // Limpa canais de decomposição se houver
        if (imgOutput) {
            const wrap = imgOutput.closest('.pdi-canvas-wrap');
            const channelsRow = wrap ? wrap.querySelector('.pdi-channels-row') : null;
            if (channelsRow) channelsRow.remove();
            if (wrap) {
                wrap.classList.remove('pdi-channels-mode');
                wrap.style.minHeight = '';
                wrap.style.alignItems = '';
            }

            imgOutput.src = '';
            imgOutput.classList.add('d-none');
            document.getElementById('placeholderOutput').classList.remove('d-none');
        }

        // Limpa os metadados
        document.getElementById('metaInput').innerHTML = "Dimensões: - | Tipo: -";
        document.getElementById('metaOutput').innerHTML = "Dimensões: - | Tipo: -";

        // Limpa histogramas
        const accessoryData = document.getElementById('accessoryData');
        if (accessoryData) {
            accessoryData.innerHTML = `
                <div class="pdi-histogram-box">
                    <small class="text-muted">Histograma original</small>
                </div>
                <div class="pdi-histogram-box">
                    <small class="text-muted">Histograma processado</small>
                </div>
            `;
        }

        // Reseta processo ativo para "original"
        const activeBtn = document.querySelector('#processSelector .active');
        if (activeBtn) activeBtn.classList.remove('active');
        const originalBtn = document.querySelector('[data-process="original"]');
        if (originalBtn) originalBtn.classList.add('active');

        // Reseta parâmetros
        const paramsContainer = document.getElementById('paramsContainer');
        if (paramsContainer) {
            paramsContainer.innerHTML = '<p class="text-white mb-0">Exibindo imagem original.</p>';
        }

        // Reabilita botões de decomposição e escala de cinza
        document.querySelectorAll('#cat-decomp .pdi-process-item, [data-process="gray_scale"]')
            .forEach(btn => {
                btn.classList.remove('pdi-process-disabled');
                btn.title = '';
            });
        const decomp = document.getElementById('cat-decomp');
        if (decomp) decomp.style.cursor = '';

        panelInput.style.cursor = 'pointer';

        console.log("Imagem resetada.");
    });
})();
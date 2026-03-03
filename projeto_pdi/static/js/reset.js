(function() {
    const btnReset = document.getElementById('btnReset');
    const imageInput = document.getElementById('imageInput');
    const imgInput = document.getElementById('imgInput');
    const imgOutput = document.getElementById('imgOutput');

    if (!btnReset) return;

    btnReset.addEventListener('click', function() {

        //  Limpa input file
        if (imageInput) {
            imageInput.value = '';
        }

        //  Limpa e esconde imagem original
        if (imgInput) {
            imgInput.src = '';
            imgInput.classList.add('d-none');
            document.getElementById('placeholderInput').classList.remove('d-none');
        }

        // Limpa e esconde imagem processada
        if (imgOutput) {
            imgOutput.src = '';
            imgOutput.classList.add('d-none');
            document.getElementById('placeholderOutput').classList.remove('d-none');
        }

        // Limpa histogramas (se existirem dentro da section accessoryData)
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

        console.log("Imagem resetada.");
    });
})();
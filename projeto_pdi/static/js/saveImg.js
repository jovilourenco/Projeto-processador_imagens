(function() {
    const btnSave = document.getElementById('btnSave');

    if (!btnSave) return;

    btnSave.addEventListener('click', function() {
        const processedImg = document.getElementById('imgOutput');
        
        // Vai procurar por imagens de múltiplos canais na tela (casos do RGB e HSV)
        const channelImages = document.querySelectorAll('.pdi-channel-img'); 

        let imagesToDownload = [];

        // Se existirem canais na tela, prepara todos para download
        if (channelImages.length > 0) {
            channelImages.forEach((img, index) => {
                imagesToDownload.push({
                    src: img.src,
                    // Tenta usar um data-label (ex: 'R', 'G', 'B') ou um número genérico
                    name: img.dataset.label ? `Canal_${img.dataset.label}` : `Canal_${index + 1}` 
                });
            });
        } 
        // Se não houver canais, faz o download da imagem única normalmente
        else if (processedImg && processedImg.src && processedImg.src.includes('data:image')) {
            let baseName = "Imagem";
            if (processedImg.dataset.originalName) {
                baseName = processedImg.dataset.originalName.split('.').slice(0, -1).join('.');
            }
            imagesToDownload.push({
                src: processedImg.src,
                name: baseName + "_processada"
            });
        }

        // Se não tiver imagens
        if (imagesToDownload.length === 0) {
            alert("Nenhuma imagem processada para salvar.");
            return;
        }

        // Função auxiliar que faz o download efetivamente
        const downloadImage = (src, fileName) => {
            fetch(src)
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = fileName;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                })
                .catch(err => {
                    console.error(`Erro ao salvar ${fileName}:`, err);
                });
        };

        // Faz um loop e baixa todas as imagens
        imagesToDownload.forEach(imgData => {
            downloadImage(imgData.src, imgData.name);
        });
        
        console.log("Download(s) iniciado(s) com sucesso!");
    });
})();
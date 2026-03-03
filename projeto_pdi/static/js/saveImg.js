(function() {
    const btnSave = document.getElementById('btnSave');
    const processedImg = document.getElementById('imgOutput');

    if (!btnSave || !processedImg) return;

    btnSave.addEventListener('click', function() {
        const src = processedImg.src;

        // Validação: verifica se tem imagem carregada
        if (!src || src === '' || src.includes('data:image') === false) {
            alert("Nenhuma imagem processada para salvar.");
            return;
        }

        let imageName = "Imagem";

        if (processedImg.dataset.originalName) {
            imageName = processedImg.dataset.originalName
                .split('.')
                .slice(0, -1)
                .join('.');
        }

        const fileName = imageName + "_processada";

        // Converte data URL para Blob
        fetch(src)
            .then(res => res.blob())
            .then(blob => {
                // Criar URL temporária do blob
                const url = URL.createObjectURL(blob);
                
                // Criar link e fazer download
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Liberar a URL temporária
                URL.revokeObjectURL(url);
                
                console.log("Download realizado com sucesso!");
            })
            .catch(err => {
                console.error("Erro ao fazer download:", err);
                alert("Erro ao salvar a imagem.");
            });
    });
})();
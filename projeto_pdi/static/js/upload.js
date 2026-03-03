/**
 * upload.js – Lógica do modal de carregamento de imagem (PDI).
 * Aceita: arrastar e soltar, colar (Ctrl+V), clicar para abrir o explorador.
 * Valida PNG, mostra preview; ao confirmar, atribui ao input oculto e dispara o fluxo existente (btnLoad).
 */
(function() {
    'use strict';

    const MIME_PNG = 'image/png';
    const MIME_JPEG = 'image/jpeg';
    const MIME_JPG = 'image/jpg';
    const EXT_PNG = '.png';
    const EXT_JPEG = '.jpeg';
    const EXT_JPG = '.jpg';

    function byId(id) {
        return document.getElementById(id);
    }

    /**
     * Verifica se o arquivo é PNG ou JPEG (por MIME e/ou extensão).
     */
    function isImage(file) {
        if (!file) return false;
        var mimeType = file.type || '';
        if (mimeType === MIME_PNG || mimeType === MIME_JPEG || mimeType === MIME_JPG) return true;
        var name = (file.name || '').toLowerCase();
        return name.endsWith(EXT_PNG) || name.endsWith(EXT_JPEG) || name.endsWith(EXT_JPG);
    }

    /**
     * Atribui um File ao input type="file" via DataTransfer (compatível com navegadores modernos).
     */
    function setInputFile(input, file) {
        if (!input || !file) return;
        try {
            var dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
        } catch (e) {
            console.warn('setInputFile:', e);
        }
    }

    /**
     * Mostra preview, esconde erro e atualiza texto da zona.
     */
    function showPreview(src, filename) {
        var wrap = byId('uploadPreviewWrap');
        var img = byId('uploadPreview');
        var zoneText = byId('uploadZoneText');
        var errEl = byId('uploadError');
        var fileWrap = byId('uploadFileNameWrap');
        var fileText = byId('uploadFileNameText');

        if (wrap && img) {
            img.src = src || '';
            wrap.classList.remove('d-none');
        }

        if(fileWrap && fileText && filename) {
            fileText.textContent = filename;
            fileWrap.classList.remove('d-none');
        }

        if (zoneText) zoneText.textContent = 'Imagem selecionada. Clique em Carregar ou escolha outra.';
        if (errEl) {
            errEl.classList.add('d-none');
            errEl.textContent = '';
        }
    }

    /**
     * Mostra mensagem de erro e esconde preview.
     */
    function showError(message) {
        var errEl = byId('uploadError');
        var wrap = byId('uploadPreviewWrap');
        var zoneText = byId('uploadZoneText');
        var fileWrap = byId('uploadFileNameWrap')

        if (errEl) {
            errEl.textContent = message || 'Apenas arquivos PNG e JPEG são permitidos.';
            errEl.classList.remove('d-none');
        }
        if (wrap) wrap.classList.add('d-none');
        if (fileWrap) fileWrap.classList.add('d-none'); // Esconde nome no erro
        if (zoneText) zoneText.textContent = 'Clique ou arraste a imagem aqui';
    }

    /**
     * Processa um arquivo: valida PNG, define no input, mostra preview ou erro.
     */
    function processFile(file) {
        var imageInput = byId('imageInput');
        var processedImg = document.getElementById('imgOutput');
        if (!imageInput) return;

        if (!file) {
            showError('Nenhum arquivo.');
            return;
        }
        if (!isImage(file)) {
            showError('Apenas arquivos PNG e JPEG são permitidos.');
            return;
        }

        if(processedImg) {
            processedImg.dataset.originalName = file.name;
        }

        setInputFile(imageInput, file);
        var reader = new FileReader();
        var nomeOriginal = file.name;
        reader.onload = function(e) {
            showPreview(e.target.result, nomeOriginal);
        };
        reader.onerror = function() {
            showError('Erro ao ler o arquivo.');
        };
        reader.readAsDataURL(file);
    }

    /**
     * Reseta estado do modal (preview, erro, texto).
     */
    function resetModalState() {
        var wrap = byId('uploadPreviewWrap');
        var img = byId('uploadPreview');
        var zoneText = byId('uploadZoneText');
        var errEl = byId('uploadError');
        var fileWrap = byId('uploadFileNameWrap');
        var fileText = byId('uploadFileNameText');

        if (img) img.src = '';
        if (wrap) wrap.classList.add('d-none');
        if (fileWrap) fileWrap.classList.add('d-none'); // Reseta nome
        if (fileText) fileText.textContent = ''; // Limpa nome
        if (zoneText) zoneText.textContent = 'Clique ou arraste a imagem aqui';
        if (errEl) {
            errEl.classList.add('d-none');
            errEl.textContent = '';
        }
    }

    function init() {
        var uploadModal = byId('uploadModal');
        var uploadZone = byId('uploadZone');
        var imageInput = byId('imageInput');
        var btnConfirm = byId('btnConfirmUpload');

        if (!uploadModal || !uploadZone || !imageInput) return;

        // Obter ou criar uma única instância do modal (compatível com pdi_processor.js)
        var modalInstance = bootstrap.Modal.getInstance(uploadModal) || new bootstrap.Modal(uploadModal);

        // Clicar na zona: abre o explorador de arquivos (input oculto)
        uploadZone.addEventListener('click', function(e) {
            if (e.target.closest('.btn-close') || e.target.closest('[data-bs-dismiss="modal"]')) return;
            imageInput.click();
        });
        

        // Atalho de teclado no modal: Enter para confirmar ou abrir explorador
        uploadModal.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var hasImage = imageInput.files && imageInput.files.length > 0 && isImage(imageInput.files[0]);
                if (hasImage) {
                    // Tem imagem → confirma
                    if (btnConfirm) btnConfirm.click();
                } else {
                    // Sem imagem → abre explorador
                    imageInput.click();
                }
            }
        });

        // Alteração do input (escolha pelo explorador)
        imageInput.addEventListener('change', function() {
            var file = this.files[0];
            processFile(file);
        });

        // Arrastar e soltar na zona
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.add('pdi-upload-zone-dragover');
        });
        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.remove('pdi-upload-zone-dragover');
        });
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadZone.classList.remove('pdi-upload-zone-dragover');
            var file = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) || null;
            processFile(file);
        });

        // Colar (Ctrl+V) no documento/modal
        document.addEventListener('paste', (e) => {
            const items = (e.clipboardData && e.clipboardData.items) || [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                    const file = items[i].getAsFile();
                    // Se o modal não está aberto, abre; caso contrário, apenas processa
                    if (!uploadModal.classList.contains('show')) {
                        modalInstance.show();
                        setTimeout(() => processFile(file), 150);
                    } else {
                        processFile(file);
                    }
                    break;
                }
            }
        });

        // Captura de Arrastar (Drag) sobre a área central
        const mainArea = document.querySelector('.pdi-main');
        mainArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            mainArea.classList.add('pdi-drag-active'); // Opcional: estilo visual
        });

        mainArea.addEventListener('drop', (e) => {
            e.preventDefault();
            mainArea.classList.remove('pdi-drag-active');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                modalInstance.show();
                setTimeout(() => processFile(file), 150);
            }
        });

        // Botão Carregar: fecha o modal e dispara o fluxo existente (btnLoad do pdi_processor.js)
        if (btnConfirm) {
            btnConfirm.addEventListener('click', function() {
                var file = imageInput.files[0];
                if (!file || !isImage(file)) {
                    showError('Selecione um arquivo PNG ou JPEG.');
                    return;
                }
                modalInstance.hide();
                resetModalState();
                var btnLoad = byId('btnLoad');
                if (btnLoad) btnLoad.click();
            });
        }

        // Ao abrir o modal: resetar estado
        uploadModal.addEventListener('show.bs.modal', resetModalState);
        uploadModal.addEventListener('hidden.bs.modal', resetModalState);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

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

        // Clicar na zona: abre o explorador de arquivos (input oculto)
        uploadZone.addEventListener('click', function(e) {
            if (e.target.closest('.btn-close') || e.target.closest('[data-bs-dismiss="modal"]')) return;
            imageInput.click();
        });

        uploadZone.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                imageInput.click();
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
        document.addEventListener('paste', function(e) {
            if (!uploadModal.classList.contains('show')) return;
            var items = (e.clipboardData && e.clipboardData.items) || [];
            for (var i = 0; i < items.length; i++) {
                if (items[i].kind === 'file') {
                    var file = items[i].getAsFile();
                    if (file && file.type.indexOf('image/') === 0) {
                        e.preventDefault();
                        processFile(file);
                    }
                    break;
                }
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
                var modal = bootstrap.Modal.getInstance(uploadModal);
                if (modal) modal.hide();
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

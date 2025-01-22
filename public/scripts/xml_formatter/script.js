const dropZone = document.getElementById('dropZone');
const downloadList = document.getElementById('downloadList');

// Añadir efectos visuales solo cuando el archivo esté sobre el recuadro
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

// Manejar el drop en cualquier parte de la pantalla
document.body.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);

    files.forEach(file => {
        const validMimeTypes = [
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream'
        ];

        if (validMimeTypes.includes(file.type) || file.name.endsWith('.zip')) {
            // Simular archivo procesado
            const processedFile = document.createElement('a');
            processedFile.href = "#";
            processedFile.textContent = `Processed_${file.name}`;
            processedFile.classList.add('list-group-item');
            processedFile.download = `Processed_${file.name}`;
            downloadList.appendChild(processedFile);
        } else {
            alert(`${file.name} is not a .zip file!`);
        }
    });
});

// Prevenir el comportamiento predeterminado para dragover en el body
document.body.addEventListener('dragover', (e) => {
    e.preventDefault();
});

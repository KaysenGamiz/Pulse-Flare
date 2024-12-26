document.getElementById('uploadButton').addEventListener('click', function(e) {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) {
        document.getElementById('uploadStatus').textContent = 'Por favor, selecciona un archivo.';
        document.getElementById('uploadStatus').className = 'text-danger';
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    progressBarContainer.classList.remove('d-none');
    progressBar.style.width = '0%';
    progressBar.setAttribute('aria-valuenow', '0');

    fetch('/cloud_reports/upload', {
        method: 'POST',
        body: formData,
    }).then(response => response.json())
    .then(data => {
        if (data.fileName) {
            document.getElementById('uploadStatus').textContent = 'Archivo subido exitosamente.';
            document.getElementById('uploadStatus').className = 'text-success';
            progressBar.style.width = '100%';
            progressBar.setAttribute('aria-valuenow', '100');

            // Agregar al historial
            const historyList = document.getElementById('historyList');
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.textContent = `${data.fileName} - Subido con éxito`;
            historyList.appendChild(listItem);

        } else {
            throw new Error('No se obtuvo el nombre del archivo');
        }
    })
    .catch(error => {
        document.getElementById('uploadStatus').textContent = 'Error al subir el archivo.';
        document.getElementById('uploadStatus').className = 'text-danger';
        progressBarContainer.classList.add('d-none');
    });
});
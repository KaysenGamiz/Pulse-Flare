const dropZone = document.getElementById('dropZone');
const downloadList = document.getElementById('downloadList');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

document.body.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
        const validMimeTypes = [
            'application/zip',
            'application/x-zip-compressed',
            'application/octet-stream'
        ];

        if (validMimeTypes.includes(file.type) || file.name.endsWith('.zip')) {
            try {
                await uploadToS3(file);
                alert(`📤 Archivo ${file.name} subido exitosamente.`);
                setTimeout(loadProcessedFiles, 3000); // Recargar lista después de subir
            } catch (error) {
                alert(`❌ Error al subir el archivo: ${error.message}`);
            }
        } else {
            alert(`❌ ${file.name} no es un archivo ZIP válido.`);
        }
    }
});

// 📌 **Subir archivo ZIP a S3 usando el backend**
async function uploadToS3(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch('/general_utils/xml_formatter/upload', {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("❌ Error al subir el archivo.");
    }
}

// 📌 **Cargar archivos procesados desde el backend**
async function loadProcessedFiles() {
    try {
        const response = await fetch('/general_utils/xml_formatter/processed-files');
        if (!response.ok) throw new Error("❌ Error al obtener archivos procesados.");

        const files = await response.json();
        downloadList.innerHTML = "";

        files.forEach(file => {
            const processedFile = document.createElement('a');
            processedFile.href = `/general_utils/xml_formatter/download/${file.name}`; // Apunta a nuestro servidor
            processedFile.textContent = `📂 ${file.name}`;
            processedFile.classList.add('list-group-item');
            processedFile.setAttribute('download', file.name);
            processedFile.addEventListener('click', () => {
                setTimeout(() => {
                    loadProcessedFiles(); // Recargar lista después de la descarga
                }, 5000);
            });
            downloadList.appendChild(processedFile);
        });

    } catch (error) {
        console.error("❌ Error cargando archivos procesados:", error);
    }
}

// 📌 **Cargar archivos procesados al inicio**
document.addEventListener("DOMContentLoaded", loadProcessedFiles);

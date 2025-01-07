import { parseFacturaZIP, parseFacturaXML } from "./xml_parser.js";

document.getElementById("analyzeButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Por favor, selecciona un archivo.");
        return;
    }

    try {
        let results;

        if (file.name.endsWith(".zip")) {
            results = await parseFacturaZIP(file);
        } else if (file.name.endsWith(".xml")) {
            const xmlString = await file.text();
            const singleResult = parseFacturaXML(xmlString);
            results = { [singleResult.uuid]: singleResult.productos };
        } else {
            alert("El archivo debe ser un XML o un ZIP.");
            return;
        }

        displayResults(results);
    } catch (error) {
        console.error("Error al procesar el archivo:", error);
        alert("Ocurrió un error al procesar el archivo.");
    }
});

function displayResults(results) {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    Object.keys(results).forEach((uuid) => {
        const productos = results[uuid];
        const tableHTML = `
            <div class="mt-4">
                <h3>Factura UUID: ${uuid}</h3>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Número de Producto</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productos.map((producto, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${producto.noIdentificacion}</td>
                                <td>${producto.descripcion}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;
        resultsContainer.insertAdjacentHTML("beforeend", tableHTML);
    });
}

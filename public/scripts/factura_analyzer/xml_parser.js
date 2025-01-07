export async function parseFacturaZIP(zipFile) {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipFile);

    const resultados = [];

    // Iterar sobre los archivos dentro del ZIP
    for (const fileName of Object.keys(loadedZip.files)) {
        const file = loadedZip.files[fileName];

        // Verificar que el archivo sea XML
        if (fileName.endsWith(".xml")) {
            const xmlString = await file.async("string");
            const resultado = parseFacturaXML(xmlString);
            resultados.push(resultado);
        }
    }

    // Agrupar resultados por UUID
    const agrupadosPorUUID = groupByUUID(resultados);

    return agrupadosPorUUID;
}

export function parseFacturaXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    // Verificar si hay errores de parseo
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
        throw new Error("Error al parsear el archivo XML");
    }

    // Extraer el UUID
    const timbre = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital")[0];
    const uuid = timbre ? timbre.getAttribute("UUID") : "No disponible";

    // Extraer los productos
    const conceptos = xmlDoc.getElementsByTagName("cfdi:Concepto");
    const productos = Array.from(conceptos).map(concepto => {
        return {
            noIdentificacion: concepto.getAttribute("NoIdentificacion") || "No disponible",
            descripcion: concepto.getAttribute("Descripcion") || "No disponible",
        };
    });

    return { uuid, productos };
}

function groupByUUID(results) {
    const grouped = {};

    results.forEach(({ uuid, productos }) => {
        if (!grouped[uuid]) {
            grouped[uuid] = [];
        }
        grouped[uuid] = grouped[uuid].concat(productos);
    });

    return grouped;
}

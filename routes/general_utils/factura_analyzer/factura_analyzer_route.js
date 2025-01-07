const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
const { HTTP } = require(path.join(__dirname, '..', '..', '..', '/config', 'config.js'))

// GET Base
router.get('/', (req, res) => {
    res.status(HTTP.OK).sendFile(path.join(__dirname, '..', '..', '..', 'views', 'general_utils', 'factura_analyzer', 'home.html'));
});
  
// GET Details
router.get('/details', (req, res) => {
    res.status(HTTP.OK).send('Detalle de Factura Analyzer');
});

router.post('/upload', async (req, res) => {
    // Procesar el archivo recibido (ZIP o XML)
    try {
        const file = req.files?.file;
        if (!file) {
            return res.status(400).send('Archivo no proporcionado');
        }

        if (file.name.endsWith('.zip')) {
            const resultados = await parseFacturaZIP(file.data); // Modifica para aceptar buffers
            res.status(200).json(resultados);
        } else if (file.name.endsWith('.xml')) {
            const resultados = parseFacturaXML(file.data.toString()); // Modifica para aceptar buffers
            res.status(200).json(resultados);
        } else {
            res.status(400).send('Formato no soportado');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error procesando el archivo');
    }
});


module.exports = router;

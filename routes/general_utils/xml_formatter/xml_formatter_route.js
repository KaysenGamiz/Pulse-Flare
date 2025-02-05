const express = require('express');
const router = express.Router();
const path = require('path');
const { S3Client, GetObjectCommand, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const multer = require('multer');
const { HTTP } = require(path.join(__dirname, '..', '..', '..', '/config', 'config.js'));

const s3 = new S3Client({ region: process.env.AWS_REGION });

const BUCKET_NAME = "xml-formatter-bucket";
const INPUT_FOLDER = "pre-processed_xml/";
const OUTPUT_FOLDER = "post-processed_xml/";
const ARCHIVE_FOLDER = "archive_post-processed_xml/";

const upload = multer({ storage: multer.memoryStorage() });

// GET Base
router.get('/', (req, res) => {
    res.status(HTTP.OK).sendFile(path.join(__dirname, '..', '..', '..', 'views', 'general_utils', 'xml_formatter', 'home.html'));
});

// GET Details
router.get('/details', (req, res) => {
    res.status(HTTP.OK).send('Detalle de XML Formatter');
});

// POST Upload ZIP a S3 (Pre-Procesado)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(HTTP.BAD_REQUEST).json({ error: "No se envió ningún archivo." });
        }

        const file = req.file;
        const key = `${INPUT_FOLDER}${file.originalname}`;

        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype
        };

        await s3.send(new PutObjectCommand(params));

        res.status(HTTP.OK).json({
            message: "Archivo subido exitosamente.",
            key
        });

    } catch (error) {
        console.error("❌ Error al subir archivo:", error);
        res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: "Error al subir archivo a S3." });
    }
});

// GET Listar archivos procesados en S3
router.get('/processed-files', async (req, res) => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: OUTPUT_FOLDER
        });

        const response = await s3.send(command);

        const files = response.Contents ? response.Contents.map(obj => ({
            name: obj.Key.replace(OUTPUT_FOLDER, ""),
            url: `/xml_formatter/download/${obj.Key.replace(OUTPUT_FOLDER, "")}` // Usa nuestro endpoint de descarga
        })) : [];

        res.status(HTTP.OK).json(files);

    } catch (error) {
        console.error("❌ Error al listar archivos procesados:", error);
        res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: "Error al obtener archivos de S3." });
    }
});

// GET Descargar archivo procesado y moverlo a archivado
router.get('/download/:fileName', async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const sourceKey = `${OUTPUT_FOLDER}${fileName}`;
        const archiveKey = `${ARCHIVE_FOLDER}${fileName}`;

        // Descargar el archivo desde S3
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: sourceKey
        });

        const response = await s3.send(command);

        // Configurar headers para forzar la descarga
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', response.ContentType);

        // Enviar el archivo al cliente
        response.Body.pipe(res);

        // Una vez que se complete la descarga, mover el archivo a la carpeta de archivado
        response.Body.on('end', async () => {
            try {
                // Copiar el archivo a la carpeta de archivado
                await s3.send(new CopyObjectCommand({
                    Bucket: BUCKET_NAME,
                    CopySource: `${BUCKET_NAME}/${sourceKey}`,
                    Key: archiveKey
                }));

                // Eliminar el archivo original de la carpeta post-procesada
                await s3.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: sourceKey
                }));

                console.log(`✅ Archivo ${fileName} movido a ${ARCHIVE_FOLDER}`);
            } catch (moveError) {
                console.error(`❌ Error al mover el archivo: ${moveError}`);
            }
        });

    } catch (error) {
        console.error("❌ Error al descargar el archivo:", error);
        res.status(HTTP.INTERNAL_SERVER_ERROR).json({ error: "No se pudo descargar el archivo." });
    }
});

module.exports = router;

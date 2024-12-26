const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
const { HTTP } = require(path.join(__dirname, '..', '..', '/config', 'config.js'))
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const multer = require('multer');

const upload = multer({ dest: process.env.BUCKET_DESTINATION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

const BUCKET_NAME = process.env.BUCKET_NAME;

// GET Base
router.get('/', (req, res) => {
  res.status(HTTP.OK).sendFile(path.join(__dirname, '..', '..', 'views', 'cloud_reports', 'home.html'));
});
  
// GET Details
router.get('/details', (req, res) => {
    res.status(HTTP.OK).send('Detalle de Cloud Reports');
});

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const fileContent = fs.readFileSync(file.path);

        const params = {
            Bucket: BUCKET_NAME,
            Key: `${process.env.BUCKET_DESTINATION}/${file.originalname}`,
            Body: fileContent,
            ContentType: file.mimetype,
        };

        const command = new PutObjectCommand(params);
        await s3.send(command);

        fs.unlinkSync(file.path);

        res.status(200).json({
            message: 'Archivo subido con éxito',
            fileName: file.originalname, // Agregamos el nombre del archivo
        });
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        res.status(500).json({ error: 'Error al subir el archivo' });
    }
});

module.exports = router;

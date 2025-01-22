const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
const { HTTP } = require(path.join(__dirname, '..', '..', '..', '/config', 'config.js'))

// GET Base
router.get('/', (req, res) => {
    res.status(HTTP.OK).sendFile(path.join(__dirname, '..', '..', '..', 'views', 'general_utils', 'xml_formatter', 'home.html'));
});
  
// GET Details
router.get('/details', (req, res) => {
    res.status(HTTP.OK).send('Detalle de XML Formatter');
});


module.exports = router;

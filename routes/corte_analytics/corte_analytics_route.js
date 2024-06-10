const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
const { Corte } = require(path.join(__dirname, '..', '..', 'controllers', 'schemas', 'corte_schema.js'));
const { HTTP } = require(path.join(__dirname, '..', '..', '/config', 'config.js'))

// GET Base
router.get('/', (req, res) => {
    res.status(HTTP.OK).send('Página de Corte Analytics');
  });
  
  // GET Details
  router.get('/details', (req, res) => {
    res.status(HTTP.OK).send('Detalle de Corte Analytics');
  });

module.exports = router;

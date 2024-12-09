const express = require('express');
const router = express.Router();
const path = require('path');
const moment = require('moment-timezone');
const { Corte } = require(path.join(__dirname, '..', '..', 'controllers', 'schemas', 'corte_schema.js'));
const { HTTP } = require(path.join(__dirname, '..', '..', '/config', 'config.js'))

// GET Base
router.get('/', (req, res) => {
    res.status(HTTP.OK).sendFile(path.join(__dirname, '..', '..', 'views', 'corte_explorer', 'home.html'));
  });
  
  // GET Details
  router.get('/details', (req, res) => {
    res.status(HTTP.OK).send('Detalle de Corte Explorer');
  });

// GET Reimprimir Corte
router.get('/reimprimir/:rcc', async (req, res) => {
  const { rcc } = req.params;

  try {
      const corte = await Corte.findOne({ RCC: rcc });
      if (!corte) {
          return res.status(HTTP.BAD_REQUEST).send('Corte no encontrado.');
      }

      // Renderizar la plantilla EJS con los datos del corte
      res.render('hoja_corte/hoja_corte', { corte });
  } catch (error) {
      console.error(error);
      res.status(HTTP.INTERNAL_SERVER_ERROR).send('Error al cargar el corte para impresión.');
  }
});

module.exports = router;

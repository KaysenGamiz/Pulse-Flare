const express = require('express');
const router = express.Router();
const path = require('path');
const { HTTP } = require(path.join(__dirname, '..', '..', '/config', 'config.js'))
const { Employee } = require(path.join(__dirname, '..', '..', 'controllers', 'schemas', 'employee_schema.js'));


// GET Base
router.get('/', (req, res) => {
  res.status(HTTP.OK).send('Página de empleados');
});

// GET Details
router.get('/details', (req, res) => {
  res.status(HTTP.OK).send('Detalle de empleados');
});

// GET Data
router.get('/data', async (req, res) => {
    try {
        const empleados = await Employee.find({}, { name: 1, _id: 0 });
        res.status(HTTP.OK).json(empleados);
    } catch (error) {
        console.log(error)
        res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener la lista de empleados.' });
    }
});

// GET Data
router.get('/cajeros', async (req, res) => {
  try {
      const empleados = await Employee.find({ 'permissions.Cajero': true }, { name: 1, _id: 0 });
      res.status(HTTP.OK).json(empleados);
  } catch (error) {
      console.log(error);
      res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener la lista de cajeros.' });
  }
});

module.exports = router;

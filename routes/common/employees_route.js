const express = require('express');
const router = express.Router();
const path = require('path');
const { HTTP } = require(path.join(__dirname, '..', '..', '/config', 'config.js'))
const { Employee } = require(path.join(__dirname, '..', '..', 'controllers', 'schemas', 'employee_schema.js'));


// GET Base
router.get('/', (req, res) => {
  res.status(HTTP.OK).sendFile(path.join(__dirname, '..', '..', 'views', 'employees_settings', 'home.html'));
});

// GET Details
router.get('/details', (req, res) => {
  res.status(HTTP.OK).send('Detalle de empleados');
});

// GET Data
router.get('/data', async (req, res) => {
    try {
        const empleados = await Employee.find({}, { password: 0 });
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

// POST Crear Empleado
router.post('/create', async (req, res) => {
  try {
    const { name, username, password, role, permissions } = req.body;

    // Validar datos
    if (!name || !username || !password || !role || !permissions) {
      return res.status(HTTP.BAD_REQUEST).json({ message: 'Datos incompletos.' });
    }

    // Crear nuevo empleado
    const newEmployee = new Employee({
      name,
      username,
      password, // Asegúrate de hashear el password en el esquema de Mongoose
      role,
      permissions,
    });

    await newEmployee.save();
    res.status(HTTP.CREATED).json({ message: 'Empleado creado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: 'Error al crear el empleado.' });
  }
});

// PUT Actualizar Empleado
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, role, permissions } = req.body;

    const updateData = { name, username, role, permissions };

    // Solo actualizar la contraseña si se proporciona
    if (password) {
      updateData.password = password; // Asegúrate de que el esquema maneje el hash automáticamente
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedEmployee) {
      return res.status(HTTP.NOT_FOUND).json({ message: 'Empleado no encontrado.' });
    }

    res.status(HTTP.OK).json({ message: 'Empleado actualizado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: 'Error al actualizar el empleado.' });
  }
});

// DELETE Employee
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Employee.findByIdAndDelete(id);

    if (!result) {
      return res.status(HTTP.NOT_FOUND).json({ message: 'Empleado no encontrado.' });
    }

    res.status(HTTP.OK).json({ message: 'Empleado eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(HTTP.INTERNAL_SERVER_ERROR).json({ message: 'Error al eliminar el empleado.' });
  }
});

module.exports = router;

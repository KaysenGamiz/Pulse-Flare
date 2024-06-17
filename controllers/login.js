const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const { Employee } = require(path.join(__dirname, 'schemas', 'employee_schema.js')); // Ajusta la ruta al modelo de empleado
const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const employee = await Employee.findOne({ username });
    if (!employee) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    req.session.user = {
      id: employee._id,
      username: employee.username,
      role: employee.role,
      permissions: employee.permissions
    };

    res.status(200).json({ message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});


router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'common', 'login.html'));
});

// Ruta para obtener el nombre de usuario
router.get('/username', (req, res) => {
    if (!req.session.user) {
            return res.status(401).json({ message: 'No autorizado' });
        }
    res.json({ username: req.session.user.username });
});

// Ruta para obtener los permisos del usuario
router.get('/permissions', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'No autorizado' });
    }
    res.json({ permissions: req.session.user.permissions });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
      res.status(200).sendFile(path.join(__dirname, '..', 'views', 'common', 'login.html'));
    });
  });

module.exports = router;

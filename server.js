const express = require('express')
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const router = require(path.join(__dirname, 'controllers', 'router.js'))
const config = require(path.join(__dirname, 'config', 'config.js'));
const login_router = require(path.join(__dirname, 'controllers', 'login.js'))
const authMiddleware = require(path.join(__dirname, 'controllers', 'middlewares.js'))
const esp32_router = require(path.join(__dirname, 'controllers', 'esp32.js'));

// Mongo DB

async function connect(){
  const mongoConection = `mongodb+srv://${process.env.db_username}:${process.env.db_password}@${process.env.db_string}`;
  let db = mongoose.connection;
  db.on('connecting', () => {
      console.log('Connecting...');
  });
  db.on('connected', () => {
      console.log('Connected succesfully');
  });
  await mongoose.connect(mongoConection);

};

connect();

// Servidor
const server = express();
server.use(express.json());
server.use(cors());
server.use(session({
  secret: process.env.secret, // Cambia esto a una clave secreta segura
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));
const PORT = process.env.PORT || 3029;

server.use(express.static(path.join(__dirname, '/public')));

server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// Ruta de login sin autenticación
server.use('/login', login_router);

server.use('/api', esp32Router);

// Middleware de autenticación
server.use(authMiddleware);

server.use('/', router);

server.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
})

server.listen(PORT, () => {
  console.log(`server running on port ${PORT} click to http://localhost:${PORT}/`);
})

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Importar el manejador de errores
const errorHandler = require('../driving/api/errorHandler');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    
    // Configuración de multer para archivos CSV
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    });

    this.upload = multer({
      storage,
      fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.csv') {
          return cb(new Error('Solo se permiten archivos CSV'));
        }
        cb(null, true);
      }
    });
  }

  setupRoutes() {
    // Importar el controlador, caso de uso y las rutas
    const StudentController = require('../driving/api/StudentController');
    const ImportStudentsUseCase = require('../../application/usecases/ImportStudentsUseCase');
    const studentRoutes = require('../driving/api/routes');

    // Crear instancia del caso de uso (temporalmente sin repositorio)
    const importStudentsUseCase = new ImportStudentsUseCase({});

    // Crear instancia del controlador con el caso de uso
    const studentController = new StudentController(importStudentsUseCase);

    // Configurar las rutas
    this.app.use('/api', studentRoutes(studentController, this.upload));

    // Ruta de prueba
    this.app.get('/', (req, res) => {
      res.json({ message: 'API de Registro de Estudiantes' });
    });

    // Manejador de errores
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Servidor corriendo en puerto ${this.port}`);
    });
  }
}

// Crear y exportar una instancia del servidor
const server = new Server();
server.start();

module.exports = server;
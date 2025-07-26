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
    // Importar el controlador, casos de uso y las rutas
    const StudentController = require('../driving/api/StudentController');
    const ImportStudentsUseCase = require('../../application/usecases/ImportStudentsUseCase');
    const GetAllStudentsUseCase = require('../../application/usecases/GetAllStudentsUseCase');
    const CreateStudentUseCase = require('../../application/usecases/CreateStudentUseCase');
    const UpdateStudentUseCase = require('../../application/usecases/UpdateStudentUseCase');
    const DeleteStudentUseCase = require('../../application/usecases/DeleteStudentUseCase');
    const GetStudentHistoryUseCase = require('../../application/usecases/GetStudentHistoryUseCase');
    const MySQLStudentRepo = require('../driven/persistence/MySQLStudentRepo');
    const CsvParserImpl = require('../driven/csv/CsvParserImpl');
    const studentRoutes = require('../driving/api/routes');

    // Crear instancias de las dependencias
    const studentRepository = new MySQLStudentRepo();
    const csvParser = new CsvParserImpl();
    
    // Crear instancias de todos los casos de uso
    const importStudentsUseCase = new ImportStudentsUseCase(studentRepository, csvParser);
    const getAllStudentsUseCase = new GetAllStudentsUseCase(studentRepository);
    const createStudentUseCase = new CreateStudentUseCase(studentRepository);
    const updateStudentUseCase = new UpdateStudentUseCase(studentRepository);
    const deleteStudentUseCase = new DeleteStudentUseCase(studentRepository);
    const getStudentHistoryUseCase = new GetStudentHistoryUseCase(studentRepository);

    // Crear instancia del controlador con todos los casos de uso
    const studentController = new StudentController(
      importStudentsUseCase,
      getAllStudentsUseCase,
      createStudentUseCase,
      updateStudentUseCase,
      deleteStudentUseCase,
      getStudentHistoryUseCase
    );

    // Configurar las rutas
    this.app.use('/alumnos', studentRoutes(studentController, this.upload));

    // Ruta de prueba
    this.app.get('/', (req, res) => {
      res.json({ 
        message: 'API de Registro de Estudiantes con Sequelize',
        endpoints: {
          'GET /api/alumnos/listar': 'Obtener todos los alumnos',
          'POST /api/alumnos/crear': 'Crear nuevo alumno',
          'PUT /api/alumnos/:id': 'Actualizar alumno',
          'DELETE /api/alumnos/:id': 'Eliminar alumno',
          'POST /api/alumnos/cargar-csv': 'Importar alumnos desde CSV'
        }
      });
    });

    // Manejador de errores
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Servidor corriendo en puerto ${this.port}`);
      console.log(`📊 API disponible en: http://localhost:${this.port}`);
      console.log(`📁 Endpoint de prueba: http://localhost:${this.port}/`);
    });
  }
}

module.exports = Server;
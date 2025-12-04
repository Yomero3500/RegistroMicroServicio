require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

    // Importar el controlador, casos de uso y las rutas
    const StudentController = require('../driving/api/StudentController');
    const ImportStudentsUseCase = require('../../application/usecases/ImportStudentsUseCase');
    const GetAllStudentsUseCase = require('../../application/usecases/GetAllStudentsUseCase');
    const CreateStudentUseCase = require('../../application/usecases/CreateStudentUseCase');
    const UpdateStudentUseCase = require('../../application/usecases/UpdateStudentUseCase');
    const DeleteStudentUseCase = require('../../application/usecases/DeleteStudentUseCase');
    const GetStudentsBasicInfoUseCase = require('../../application/usecases/GetStudentsBasicInfoUseCase');
    const GetEstudiantesBasicInfoUseCase = require('../../application/usecases/GetEstudiantesBasicInfoUseCase');
    const GetEstudianteByMatriculaUseCase = require('../../application/usecases/GetEstudianteByMatriculaUseCase');
  const LoginAlumnoUseCase = require('../../application/usecases/LoginAlumnoUseCase');
  const SetAlumnoPasswordByEmailUseCase = require('../../application/usecases/SetAlumnoPasswordByEmailUseCase');
    const GoogleLoginAlumnoUseCase = require('../../application/usecases/GoogleLoginAlumnoUseCase');
    const GetEstudianteByEmailUseCase = require('../../application/usecases/GetEstudianteByEmailUseCase');
    
    // Importar los routers
    const asignaturaRouter = require('../routes/asignaturaRouter');
    const gruposRouter = require('../routes/gruposRouter');
    const inscripcionRouter = require('../driving/api/routes/inscripcionRouter')
    const materiasRouter = require('../driving/api/routes/materiasRouter');
    const GetStudentHistoryUseCase = require('../../application/usecases/GetStudentHistoryUseCase');
    const MySQLStudentRepo = require('../driven/persistence/MySQLStudentRepo');
    const EstudianteRepository = require('../driven/persistence/EstudianteRepository');
    const CsvParserImpl = require('../driven/csv/CsvParserImpl');
    const studentRoutes = require('../driving/api/routes');

// Importar el manejador de errores
const errorHandler = require('../driving/api/errorHandler');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3002;
    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    // Configuración de CORS
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:5173', 'http://localhost:3000'];
    
    console.log('🌍 CORS - Orígenes permitidos:', allowedOrigins);
    
    this.app.use(cors({
      origin: (origin, callback) => {
        console.log('🔍 CORS Request from:', origin || 'NO ORIGIN');
        
        // Permitir requests sin origin (como mobile apps o Postman)
        if (!origin) return callback(null, true);
        
        // Si ALLOWED_ORIGINS incluye '*', permitir todo
        if (allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        
        // Verificar si el origen está en la lista
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          console.warn('⚠️ CORS bloqueado para origen:', origin);
          callback(null, true); // Temporal: permitir de todos modos para debugging
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    this.app.use(express.json());
    
    // Configuración de multer para archivos CSV
    const fs = require('fs');
    // Obtener la ruta del directorio raíz del proyecto
    const projectRoot = path.resolve(__dirname, '../../../');
    const uploadDir = path.join(projectRoot, process.env.UPLOAD_DIR || 'uploads');
    
    console.log('📂 Directorio del proyecto:', projectRoot);
    console.log('📁 Directorio de uploads configurado:', uploadDir);
    
    // Asegurar que el directorio existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log(`📁 Directorio de uploads creado: ${uploadDir}`);
    }
    
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        console.log('💾 Multer: Guardando archivo en:', uploadDir);
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log('📝 Multer: Nombre de archivo generado:', filename);
        cb(null, filename);
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


    // Crear instancias de las dependencias
    const studentRepository = new MySQLStudentRepo();
    const estudianteRepository = new EstudianteRepository();
    const csvParser = new CsvParserImpl();
    
    // Crear instancias de todos los casos de uso
    const importStudentsUseCase = new ImportStudentsUseCase(studentRepository, csvParser);
    const getAllStudentsUseCase = new GetAllStudentsUseCase(studentRepository);
    const createStudentUseCase = new CreateStudentUseCase(studentRepository);
    const updateStudentUseCase = new UpdateStudentUseCase(studentRepository);
    const deleteStudentUseCase = new DeleteStudentUseCase(studentRepository);
    const getStudentHistoryUseCase = new GetStudentHistoryUseCase(studentRepository);
    const getStudentsBasicInfoUseCase = new GetStudentsBasicInfoUseCase(studentRepository);
    const getEstudiantesBasicInfoUseCase = new GetEstudiantesBasicInfoUseCase(estudianteRepository);
    const getEstudianteByMatriculaUseCase = new GetEstudianteByMatriculaUseCase(estudianteRepository);
  const loginAlumnoUseCase = new LoginAlumnoUseCase(estudianteRepository);
  const setAlumnoPasswordByEmailUseCase = new SetAlumnoPasswordByEmailUseCase(estudianteRepository);
    const googleLoginAlumnoUseCase = new GoogleLoginAlumnoUseCase(estudianteRepository);
    const getEstudianteByEmailUseCase = new GetEstudianteByEmailUseCase(estudianteRepository);

    // Crear instancia del controlador con todos los casos de uso
    const studentController = new StudentController(
      importStudentsUseCase,
      getAllStudentsUseCase,
      createStudentUseCase,
      updateStudentUseCase,
      deleteStudentUseCase,
      getStudentHistoryUseCase,
      getStudentsBasicInfoUseCase,
      getEstudiantesBasicInfoUseCase,
      getEstudianteByMatriculaUseCase,
      loginAlumnoUseCase,
      setAlumnoPasswordByEmailUseCase,
      googleLoginAlumnoUseCase,
      getEstudianteByEmailUseCase
    );
    // Configurar las rutas
    this.app.use('/alumnos', studentRoutes(studentController, this.upload));
    this.app.use('/api/asignaturas', asignaturaRouter);
    this.app.use('/api/grupos', gruposRouter);
    this.app.use('/api/materias', materiasRouter);
    this.app.use('/api/inscripciones', inscripcionRouter);
    // Ruta de prueba
    this.app.get('/', (req, res) => {
      res.json({ 
        message: 'API de Registro de Estudiantes con Sequelize',
        endpoints: {
          'GET alumnos/listar': 'Obtener todos los alumnos',
          'POST alumnos/crear': 'Crear nuevo alumno',
          'PUT alumnos/:id': 'Actualizar alumno',
          'DELETE alumnos/:id': 'Eliminar alumno',
          'POST alumnos/cargar-csv': 'Importar alumnos desde CSV',
          'GET alumnos/email/:email': 'Obtener alumno por email',
          'POST alumnos/login': 'Iniciar sesión de alumno (email y password)',
          'POST alumnos/login/google': 'Iniciar sesión con Google ID Token'
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
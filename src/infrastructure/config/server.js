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
    const GetStudentsWithoutResponseUseCase = require('../../application/usecases/GetStudentsWithoutResponseUseCase'); // ← NUEVO
    const SurveyRepository = require('../driven/persistence/SurveyRepository');
    
    // Importar los routers
    const respuestasRouter = require('../routes/respuestasRouter')
    const encuestasRouter = require('../routes/encuestasRouter');
    const preguntasRouter = require('../routes/preguntasRouter')
    const asignaturaRouter = require('../routes/asignaturaRouter');
    const gruposRouter = require('../routes/gruposRouter');
    const surveyEmailRouter = require('../routes/surveyEmailRouter')
    const publicSurveyRouter = require('../routes/publicSurveyRouter')
    const inscripcionRouter = require('../driving/api/routes/inscripcionRouter')
    const materiasRouter = require('../driving/api/routes/materiasRouter');
    const GetStudentHistoryUseCase = require('../../application/usecases/GetStudentHistoryUseCase');
    const MySQLStudentRepo = require('../driven/persistence/MySQLStudentRepo');
    const EstudianteRepository = require('../driven/persistence/EstudianteRepository');
    const CsvParserImpl = require('../driven/csv/CsvParserImpl');
    const studentRoutes = require('../driving/api/routes');


    // Crear instancias de las dependencias
    const studentRepository = new MySQLStudentRepo();
    const surveyRepository = new SurveyRepository()
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
    const getStudentsWithoutResponseUseCase = new GetStudentsWithoutResponseUseCase(
     estudianteRepository,
    surveyRepository
  );

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
      getStudentsWithoutResponseUseCase
    );



    // Configurar las rutas
    this.app.use('/alumnos', studentRoutes(studentController, this.upload));
    this.app.use('/api/asignaturas', asignaturaRouter);
    this.app.use('/api/grupos', gruposRouter);
    this.app.use('/api/materias', materiasRouter);
    this.app.use('/api/inscripciones', inscripcionRouter);
    this.app.use('/api/encuestas', encuestasRouter);
    this.app.use('/api/preguntas', preguntasRouter)
    this.app.use('/api/respuestas', respuestasRouter)
    this.app.use('/api/surveyEmail', surveyEmailRouter)
    this.app.use('/api/public', publicSurveyRouter);

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
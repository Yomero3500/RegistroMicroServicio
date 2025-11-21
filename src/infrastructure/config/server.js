require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { sequelize }= require('../config/database'); // ← AGREGAR: importar tu conexión a BD

    // Importar el controlador, casos de uso y las rutas
    const StudentController = require('../driving/api/StudentController');
    const ImportStudentsUseCase = require('../../application/usecases/ImportStudentsUseCase');
    const GetAllStudentsUseCase = require('../../application/usecases/GetAllStudentsUseCase');
    const CreateStudentUseCase = require('../../application/usecases/CreateStudentUseCase');
    const UpdateStudentUseCase = require('../../application/usecases/UpdateStudentUseCase');
    const DeleteStudentUseCase = require('../../application/usecases/DeleteStudentUseCase');
    const GetStudentsBasicInfoUseCase = require('../../application/usecases/GetStudentsBasicInfoUseCase');
    const GetStudentCompletedSurveysUseCase = require('../../application/usecases/GetStudentCompletedSurveysUseCase')
    const GetStudentPendingSurveysUseCase = require('../../application/usecases/GetStudentPendingSurveysUseCase')
    const GetEstudiantesBasicInfoUseCase = require('../../application/usecases/GetEstudiantesBasicInfoUseCase');
    const GetEstudianteByMatriculaUseCase = require('../../application/usecases/GetEstudianteByMatriculaUseCase');
  const LoginAlumnoUseCase = require('../../application/usecases/LoginAlumnoUseCase');
  const SetAlumnoPasswordByEmailUseCase = require('../../application/usecases/SetAlumnoPasswordByEmailUseCase');
    const GoogleLoginAlumnoUseCase = require('../../application/usecases/GoogleLoginAlumnoUseCase');
    
    // Importar los routers
    const asignaturaRouter = require('../routes/asignaturaRouter');
    const gruposRouter = require('../routes/gruposRouter');
    const inscripcionRouter = require('../driving/api/routes/inscripcionRouter')
    const materiasRouter = require('../driving/api/routes/materiasRouter');
    const surveyEmailRouter = require('../routes/surveyEmailRouter')
    const participacionRouter = require('../routes/participacionRouter')
    const estrategiasRouter = require('../routes/estrategiasRouter')
    const encuestasRouter = require('../routes/encuestasRouter')
    const respuestasRouter = require('../routes/respuestasRouter')
    const preguntasRouter = require('../routes/preguntasRouter')
    const publicSurveyRouter = require('../routes/publicSurveyRouter')
    const GetStudentHistoryUseCase = require('../../application/usecases/GetStudentHistoryUseCase');
    const MySQLStudentRepo = require('../driven/persistence/MySQLStudentRepo');
    const EstudianteRepository = require('../driven/persistence/EstudianteRepository');
    const CsvParserImpl = require('../driven/csv/CsvParserImpl');
    const studentRoutes = require('../driving/api/routes');

// Importar el manejador de errores
const errorHandler = require('../driving/api/errorHandler');
const GetStudentsWithoutResponseUseCase = require('../../application/usecases/GetStudentsWithoutResponseUseCase');
const SurveyRepository = require('../driven/persistence/SurveyRepository');

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
    const surveyRepository = new SurveyRepository()
    const csvParser = new CsvParserImpl();
    
    // Crear instancias de todos los casos de uso
    const importStudentsUseCase = new ImportStudentsUseCase(studentRepository, csvParser);
    const getAllStudentsUseCase = new GetAllStudentsUseCase(studentRepository);
    const createStudentUseCase = new CreateStudentUseCase(studentRepository);
    const updateStudentUseCase = new UpdateStudentUseCase(studentRepository);
    const deleteStudentUseCase = new DeleteStudentUseCase(studentRepository);
    const getStudentHistoryUseCase = new GetStudentHistoryUseCase(studentRepository);
    const getStudentsBasicInfoUseCase = new GetStudentsBasicInfoUseCase(studentRepository);
    const getStudentCompletedSurveysUseCase = new GetStudentCompletedSurveysUseCase(estudianteRepository); 
    const getStudentPendingSurveysUseCase = new GetStudentPendingSurveysUseCase(estudianteRepository); 
    const getStudentsWithoutResponse = new GetStudentsWithoutResponseUseCase(estudianteRepository, surveyRepository)
    const getEstudiantesBasicInfoUseCase = new GetEstudiantesBasicInfoUseCase(estudianteRepository);
    const getEstudianteByMatriculaUseCase = new GetEstudianteByMatriculaUseCase(estudianteRepository);
  const loginAlumnoUseCase = new LoginAlumnoUseCase(estudianteRepository);
  const setAlumnoPasswordByEmailUseCase = new SetAlumnoPasswordByEmailUseCase(estudianteRepository);
    const googleLoginAlumnoUseCase = new GoogleLoginAlumnoUseCase(estudianteRepository);

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
      getStudentsWithoutResponse, 
      getStudentPendingSurveysUseCase, 
      getStudentCompletedSurveysUseCase
    );
    // Configurar las rutas
    this.app.use('/alumnos', studentRoutes(studentController, this.upload));
    this.app.use('/api/asignaturas', asignaturaRouter);
    this.app.use('/api/grupos', gruposRouter);
    this.app.use('/api/materias', materiasRouter);
    this.app.use('/api/inscripciones', inscripcionRouter);
    this.app.use('/api/estrategias', estrategiasRouter)
    this.app.use('/api/participaciones', participacionRouter)
    this.app.use('/api/encuestas', encuestasRouter)
    this.app.use('/api/surveyEmail', surveyEmailRouter)
    this.app.use('/api/respuestas', respuestasRouter)
    this.app.use('/api/preguntas', preguntasRouter)
    this.app.use('/api/public', publicSurveyRouter)

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
          'POST alumnos/login': 'Iniciar sesión de alumno (email y password)',
          'POST alumnos/login/google': 'Iniciar sesión con Google ID Token'
        }
      });
    });

    // Manejador de errores
    this.app.use(errorHandler);
  }

  // ← MEJORADO: Método para ejecutar múltiples seeders con verificación individual
  async runSeeders() {
    try {
      console.log('\n🌱 Iniciando ejecución de seeders...\n');

      // ==========================================
      // SEEDER 1: Test de Estilos de Aprendizaje
      // ==========================================
      console.log('🔍 [1/2] Verificando seeder de Estilos de Aprendizaje...');
      
      const encuestaEstilosExistente = await sequelize.models.Encuesta?.findOne({
        where: { titulo: 'Test de Estilos de Aprendizaje' }
      });

      if (encuestaEstilosExistente) {
        console.log('   ✅ Encuesta "Test de Estilos de Aprendizaje" ya existe, saltando...\n');
      } else {
        console.log('   🌱 Ejecutando seeder de Estilos de Aprendizaje...');
        const seederEstilos = require('../driven/persistence/seeders/20250000000000-seeder-encuesta-estilos');
        await seederEstilos.up(sequelize.queryInterface, sequelize.Sequelize);
        console.log('   ✅ Seeder de Estilos de Aprendizaje ejecutado exitosamente\n');
      }

      // ==========================================
      // SEEDER 2: Encuestas de Titulación (5 ENCUESTAS)
      // ==========================================
      console.log('🔍 [2/2] Verificando seeder de Encuestas de Titulación...');
      
      // Lista de todas las encuestas que crea el seeder de titulación
      const encuestasTitulacion = [
        'Estancia 1- encuesta de documentación',
        'Estancia 2 - encuesta de documentación',
        'Estadía Profesional - encuesta de documentación',
        'Requisitos de Titulación',
        'Seguimiento Académico'
      ];

      // Verificar si TODAS las encuestas ya existen
      const encuestasExistentes = await sequelize.models.Encuesta?.findAll({
        where: { 
          titulo: encuestasTitulacion 
        }
      });

      const titulosExistentes = encuestasExistentes ? encuestasExistentes.map(e => e.titulo) : [];
      const todasExisten = encuestasTitulacion.every(titulo => titulosExistentes.includes(titulo));

      if (todasExisten && encuestasExistentes.length === 5) {
        console.log('   ✅ Todas las encuestas de titulación ya existen:');
        titulosExistentes.forEach((titulo, index) => {
          console.log(`      ${index + 1}. ${titulo}`);
        });
        console.log('   Saltando ejecución del seeder...\n');
      } else {
        console.log(`   📊 Encuestas encontradas: ${encuestasExistentes.length}/5`);
        if (encuestasExistentes.length > 0) {
          console.log('   ⚠️  Algunas encuestas ya existen:');
          titulosExistentes.forEach((titulo, index) => {
            console.log(`      ${index + 1}. ${titulo}`);
          });
          console.log('   🔄 Ejecutando seeder para crear las faltantes...');
        } else {
          console.log('   🌱 Ejecutando seeder de Encuestas de Titulación...');
        }
        
        const seederTitulacion = require('../driven/persistence/seeders/20250000000000-seeder-encuesta-titulacion');
        await seederTitulacion.up(sequelize.queryInterface, sequelize.Sequelize);
        console.log('   ✅ Seeder de Encuestas de Titulación ejecutado exitosamente\n');
      }

      console.log('═══════════════════════════════════════');
      console.log('✅ Todos los seeders verificados/ejecutados correctamente');
      console.log('═══════════════════════════════════════\n');

    } catch (error) {
      console.error('❌ Error al ejecutar seeders:', error.message);
      console.error('Stack:', error.stack);
      // No interrumpir la ejecución del servidor si falla el seeder
    }
  }

  async start() {
    try {
      await sequelize.sync({ alter: false });
      console.log('✅ Base de datos sincronizada');

      // Ejecutar seeders (antes era runSeeder, ahora es runSeeders)
      await this.runSeeders();

      // Iniciar servidor
      this.app.listen(this.port, () => {
        console.log(`🚀 Servidor corriendo en puerto ${this.port}`);
        console.log(`📊 API disponible en: http://localhost:${this.port}`);
        console.log(`📁 Endpoint de prueba: http://localhost:${this.port}/`);
      });
    } catch (error) {
      console.error('❌ Error al iniciar el servidor:', error);
      process.exit(1);
    }
  }
}

module.exports = Server;
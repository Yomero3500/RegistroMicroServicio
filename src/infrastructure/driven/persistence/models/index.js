const StudentModel = require('./StudentModel');
const AsignaturaModel = require('./registration/AsignaturaModel');
const PreguntaModel = require('./registration/PreguntaModel')
const RespuestaModel = require('./registration/RespuestaModel')
const ParticipacionModel = require('./registration/ParticipacionModel')
const TokenSurveyModel = require('./registration/TokenEncuestaModel')
const EstrategiaModel = require('./registration/EstrategiaCohorteModel')
const { 
  EstudianteModel,
  InscripcionModel,
  GrupoModel,
  CohorteModel,
  EncuestaModel
} = require('./registration');

// Variable para almacenar los modelos inicializados
let initializedModels = null;

class ModelInitializer {
  static async initializeModels(sequelize) {
    try {
      console.log('🔧 Iniciando proceso de inicialización de modelos...');
      
      // Inicializar todos los modelos
      console.log('📝 Inicializando modelos...');
      const Student = StudentModel.init(sequelize);
      const Estudiante = EstudianteModel.init(sequelize);
      const TokenSurvey = TokenSurveyModel.init(sequelize);  
      const Inscripcion = InscripcionModel.init(sequelize);
      const Grupo = GrupoModel.init(sequelize);
      const Cohorte = CohorteModel.init(sequelize);
      const Asignatura = AsignaturaModel.init(sequelize);
      const Question = PreguntaModel.init(sequelize);
      const Survey = EncuestaModel.init(sequelize)
      const Respuesta = RespuestaModel.init(sequelize)
      const Participacion = ParticipacionModel.init(sequelize)
      const Estrategia = EstrategiaModel.init(sequelize); 
      console.log('✅ Todos los modelos inicializados correctamente');


      // Crear un objeto con todos los modelos para facilitar las asociaciones
      const models = {
        Student,
        Estudiante,
        TokenSurvey, 
        Inscripcion,
        Grupo,
        Cohorte,
        Asignatura,
        Question,
        Survey,
        Respuesta,
        Participacion,
        Estrategia
      };

      console.log('🔗 Configurando asociaciones entre modelos...');
      // Configurar asociaciones
      Object.keys(models).forEach(modelName => {
        if (models[modelName].associate) {
          console.log(`🔗 Configurando asociaciones para ${modelName}...`);
          models[modelName].associate(models);
        }
      });

      // Sincronizar modelos con la base de datos
      console.log('🔄 Sincronizando modelos con la base de datos...');
      if (process.env.NODE_ENV !== 'production') {
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados con la base de datos (modo desarrollo)');
      } else {
        // En producción, NO sincronizar para evitar modificaciones en la estructura
        // La base de datos debe estar previamente configurada con migraciones
        console.log('ℹ️  Modo producción: Sync desactivado (usar migraciones para cambios de schema)');
      }

      console.log('📊 Resumen de modelos inicializados:');
      Object.keys(models).forEach(modelName => {
        console.log(`  - ${modelName}: ✅`);
      });

      // Guardar los modelos inicializados
      initializedModels = models;

      return models;
    } catch (error) {
      console.error('❌ Error al inicializar modelos:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  // ✅ NUEVO: Método para obtener los modelos inicializados
  static getModels() {
    if (!initializedModels) {
      throw new Error('❌ Los modelos no han sido inicializados. Llama a initializeModels() primero.');
    }
    return initializedModels;
  }
}

module.exports = ModelInitializer;
const StudentModel = require('./StudentModel');
const { 
  EstudianteModel,
  InscripcionModel,
  GrupoModel,
  CohorteModel,
  AsignaturaModel 
} = require('./registration');

class ModelInitializer {
  static async initializeModels(sequelize) {
    try {
      console.log('🔧 Iniciando proceso de inicialización de modelos...');
      
      // Inicializar todos los modelos
      console.log('📝 Inicializando modelos...');
      const Student = StudentModel.init(sequelize);
      const Estudiante = EstudianteModel.init(sequelize);
      const Inscripcion = InscripcionModel.init(sequelize);
      const Grupo = GrupoModel.init(sequelize);
      const Cohorte = CohorteModel.init(sequelize);
      const Asignatura = AsignaturaModel.init(sequelize);
      console.log('✅ Todos los modelos inicializados correctamente');

      // Crear un objeto con todos los modelos para facilitar las asociaciones
      const models = {
        Student,
        Estudiante,
        Inscripcion,
        Grupo,
        Cohorte,
        Asignatura
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
        await sequelize.sync();
        console.log('✅ Modelos sincronizados con la base de datos (modo producción)');
      }

      console.log('📊 Resumen de modelos inicializados:');
      Object.keys(models).forEach(modelName => {
        console.log(`  - ${modelName}: ✅`);
      });

      return models;
    } catch (error) {
      console.error('❌ Error al inicializar modelos:', error.message);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }
}

module.exports = ModelInitializer;

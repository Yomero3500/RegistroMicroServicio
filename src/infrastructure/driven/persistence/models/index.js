const StudentModel = require('./StudentModel');

class ModelInitializer {
  static async initializeModels(sequelize) {
    try {
      console.log('🔧 Iniciando proceso de inicialización de modelos...');
      
      // Inicializar todos los modelos
      console.log('📝 Inicializando modelo Student...');
      const Student = StudentModel.init(sequelize);
      console.log('✅ Modelo Student inicializado correctamente');

      // Crear un objeto con todos los modelos para facilitar las asociaciones
      const models = {
        Student
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

const StudentModel = require('./StudentModel');

class ModelInitializer {
  static async initializeModels(sequelize) {
    // Inicializar todos los modelos
    const Student = StudentModel.init(sequelize);

    // Crear un objeto con todos los modelos para facilitar las asociaciones
    const models = {
      Student
    };

    // Configurar asociaciones
    Object.keys(models).forEach(modelName => {
      if (models[modelName].associate) {
        models[modelName].associate(models);
      }
    });

    // Sincronizar modelos con la base de datos (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Modelos sincronizados con la base de datos');
    }

    return models;
  }
}

module.exports = ModelInitializer;

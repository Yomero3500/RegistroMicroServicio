const { Sequelize } = require('sequelize');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.sequelize = null;
  }

  async connect() {
    try {
      console.log('🔍 Configurando conexión con Sequelize...');
      
      this.sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT) || 3306,
          dialect: 'mysql',
          logging: true,

        }
      );

      console.log('🔌 Intentando autenticar con Sequelize...');
      
      // Probar la conexión
      await this.sequelize.authenticate();
      
      console.log('📊 Inicializando modelos...');
      // Inicializar modelos después de la conexión
      try {
        const ModelInitializer = require('../driven/persistence/models');
        console.log('📦 ModelInitializer importado correctamente');
        await ModelInitializer.initializeModels(this.sequelize);
        console.log('🎉 Modelos inicializados exitosamente');
      } catch (modelError) {
        console.error('❌ Error específico al inicializar modelos:', modelError.message);
        console.error('Stack trace del error de modelos:', modelError.stack);
        throw modelError;
      }
      
      console.log('✅ Conexión a la base de datos establecida exitosamente con Sequelize');
      
      return this.sequelize;
    } catch (error) {
      console.error('❌ Error al conectar con Sequelize:', error.message);
      console.error('❌ Código de error:', error.original?.code);
      throw error;
    }
  }

  async getConnection() {
    if (!this.sequelize) {
      await this.connect();
    }
    return this.sequelize;
  }

  getSequelize() {
    return this.sequelize;
  }
}

module.exports = new DatabaseConnection();
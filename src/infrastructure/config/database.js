const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      dateStrings: true,
      typeCast: true,
      // Configuración para evitar errores con datetime en MySQL modo estricto
      connectTimeout: 60000
    },
    timezone: '-06:00',
    define: {
      // Configuración global para timestamps
      timestamps: true,
      underscored: true,
      // Evitar el valor '0000-00-00 00:00:00' usando NULL como default
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    // Desactivar sync en producción para evitar problemas
    sync: {
      force: false,
      alter: process.env.NODE_ENV !== 'production'
    }
  }
);

async function connect() {
  try {
    console.log('🔍 Configurando conexión con Sequelize...');
    console.log('🔌 Intentando autenticar con Sequelize...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida exitosamente con Sequelize');
    
    // Inicializar modelos después de conectar
    const ModelInitializer = require('../driven/persistence/models');
    const models = await ModelInitializer.initializeModels(sequelize);
    console.log('🏗️ Modelos inicializados correctamente');
    
    return { sequelize, models };
  } catch (error) {
    console.error('❌ Error al conectar con Sequelize:', error.message);
    console.error('❌ Código de error:', error.original?.code);
    throw error;
  }
}

module.exports = { sequelize, connect };

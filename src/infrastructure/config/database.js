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
      typeCast: function (field, next) {
        // Manejar fechas inválidas de MySQL
        if (field.type === 'DATETIME' || field.type === 'TIMESTAMP' || field.type === 'DATE') {
          const value = field.string();
          // Si es una fecha inválida, retornar null
          if (!value || value === '0000-00-00 00:00:00' || value === '0000-00-00') {
            return null;
          }
          return value;
        }
        // Para ENUM y otros tipos, usar el comportamiento por defecto
        return next();
      },
      // Permitir fechas inválidas durante ALTER TABLE
      flags: '-INVALID_DATE'
    },
    timezone: '-06:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
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

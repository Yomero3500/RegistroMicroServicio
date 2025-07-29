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
      typeCast: true
    },
    timezone: '-06:00'
  }
);

async function connect() {
  try {
    console.log('🔍 Configurando conexión con Sequelize...');
    console.log('🔌 Intentando autenticar con Sequelize...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida exitosamente con Sequelize');
  } catch (error) {
    console.error('❌ Error al conectar con Sequelize:', error.message);
    console.error('❌ Código de error:', error.original?.code);
    throw error;
  }
}

module.exports = { sequelize, connect };

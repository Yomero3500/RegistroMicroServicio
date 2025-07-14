require('dotenv').config();
const database = require('./src/infrastructure/config/database');

async function testSequelizeConnection() {
  console.log('🧪 Probando conexión con Sequelize...');
  
  try {
    await database.connect();
    console.log('🎉 ¡Conexión con Sequelize exitosa!');
    
    // Obtener información de la base de datos
    const sequelize = database.getSequelize();
    const dialect = sequelize.getDialect();
    console.log('📊 Dialecto:', dialect);
    
  } catch (error) {
    console.error('💥 Error con Sequelize:', error.message);
  }
}

testSequelizeConnection();

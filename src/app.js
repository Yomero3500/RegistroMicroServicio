require('dotenv').config();
const Server = require('./infrastructure/config/server');
const { connect } = require('./infrastructure/config/database');

// Aseguramos que existe el directorio de uploads
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Iniciamos la aplicación
async function startApplication() {
  try {
    console.log('🚀 Iniciando aplicación...');
    
    // Conectar a la base de datos con Sequelize
    console.log('🔌 Conectando a la base de datos...');
    await connect();
    
    // Crear e iniciar el servidor
    console.log('🌐 Iniciando servidor...');
    const server = new Server();
    server.start();
    
  } catch (error) {
    console.error('💥 Error al iniciar la aplicación:', error.message);
    process.exit(1);
  }
}

startApplication();

require('dotenv').config();
const Server = require('./infrastructure/config/server');
const { connect } = require('./infrastructure/config/database');

// Aseguramos que existe el directorio de uploads
const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../');
const uploadDir = path.join(projectRoot, process.env.UPLOAD_DIR || 'uploads');

console.log('📂 Directorio del proyecto:', projectRoot);
console.log('📁 Directorio de uploads:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Directorio de uploads creado: ${uploadDir}`);
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
    console.error('💥 Error al iniciar la aplicación 1:', error.message);
    process.exit(1);
  }
}

startApplication();

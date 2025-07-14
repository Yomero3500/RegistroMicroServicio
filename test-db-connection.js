require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🧪 Probando conexión directa a MySQL...');
  
  console.log('Variables de entorno:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'NO_PASSWORD');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Conexión directa a MySQL exitosa');
    
    // Probar una consulta simple
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Consulta de prueba exitosa:', rows);
    
    await connection.end();
    console.log('✅ Conexión cerrada correctamente');
    
  } catch (error) {
    console.error('❌ Error en conexión directa:', error.message);
    console.error('Código de error:', error.code);
    console.error('SQL State:', error.sqlState);
  }
}

testConnection();

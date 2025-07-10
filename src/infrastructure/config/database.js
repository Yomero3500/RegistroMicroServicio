const mysql = require('mysql2/promise');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
      });

      console.log('Conexión a la base de datos establecida');
      return this.connection;
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      throw error;
    }
  }

  async getConnection() {
    if (!this.connection) {
      await this.connect();
    }
    return this.connection;
  }
}

module.exports = new DatabaseConnection();
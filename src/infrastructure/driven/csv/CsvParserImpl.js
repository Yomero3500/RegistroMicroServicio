const csv = require('csv-parser');
const fs = require('fs');

class CsvParserImpl {
  async parse(filePath) {
    console.log('🔍 CsvParserImpl: Iniciando parsing del archivo:', filePath);
    
    return new Promise((resolve, reject) => {
      const results = [];

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        console.error('❌ CsvParserImpl: Archivo no encontrado:', filePath);
        return reject(new Error(`Archivo no encontrado: ${filePath}`));
      }

      console.log('📖 CsvParserImpl: Creando stream de lectura...');
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          console.log('📋 CsvParserImpl: Headers detectados:', headers);
        })
        .on('data', (data) => {
          console.log(`📝 CsvParserImpl: Registro ${results.length + 1} leído:`, data);
          results.push(data);
        })
        .on('end', () => {
          console.log('✅ CsvParserImpl: Parsing completado');
          console.log('📊 CsvParserImpl: Total de registros parseados:', results.length);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('❌ CsvParserImpl: Error durante el parsing:', error.message);
          reject(error);
        });
    });
  }
}

module.exports = CsvParserImpl;
const csv = require('csv-parser');
const fs = require('fs');

class CsvParserImpl {
  async parse(filePath) {
    console.log('🔍 CsvParserImpl: Iniciando parsing del archivo:', filePath);
    
    return new Promise((resolve, reject) => {
      const results = [];

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return reject(new Error(`Archivo no encontrado: ${filePath}`));
      }
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', (headers) => {
          console.log('📋 CsvParserImpl: Headers detectados:', headers);
        })
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => {
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
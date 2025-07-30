const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

class CsvParserImpl {
  async parse(filePath) {
    console.log('🔍 CsvParserImpl: Iniciando parsing del archivo:', filePath);
    console.log('🔍 CsvParserImpl: Ruta de trabajo actual:', process.cwd());
    console.log('🔍 CsvParserImpl: Ruta absoluta del archivo:', path.resolve(filePath));
    
    return new Promise((resolve, reject) => {
      const results = [];

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        console.error('❌ CsvParserImpl: Archivo no encontrado:', filePath);
        console.error('❌ CsvParserImpl: Directorio actual:', process.cwd());
        console.error('❌ CsvParserImpl: Archivos en uploads:', fs.existsSync('uploads') ? fs.readdirSync('uploads') : 'Directorio no existe');
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
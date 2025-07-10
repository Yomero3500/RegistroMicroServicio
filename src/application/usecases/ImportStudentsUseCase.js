const fs = require('fs');
const csv = require('csv-parser');

class ImportStudentsUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  async execute(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          try {
            // Aquí puedes agregar validaciones de los datos
            results.push(data);
          } catch (error) {
            errors.push({ row: data, error: error.message });
          }
        })
        .on('end', async () => {
          try {
            // Aquí implementaremos la lógica para guardar en la base de datos
            // Por ahora solo retornamos los resultados para pruebas
            resolve({
              success: true,
              processed: results.length,
              errors: errors,
              data: results
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

module.exports = ImportStudentsUseCase;
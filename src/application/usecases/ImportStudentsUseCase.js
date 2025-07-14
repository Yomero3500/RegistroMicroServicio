const Student = require('../../domain/entities/Student');

class ImportStudentsUseCase {
  constructor(studentRepository, csvParser) {
    this.studentRepository = studentRepository;
    this.csvParser = csvParser;
  }

  async execute(filePath) {
    try {
      // Parsear el archivo CSV
      const csvData = await this.csvParser.parse(filePath);
      
      const results = [];
      const errors = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        try {
          // Mapear los datos del CSV a la estructura del estudiante
          const studentData = this.mapCsvToStudent(row);
          
          // Crear la entidad Student con validaciones
          const student = Student.create(studentData);
          
          // Verificar si ya existe un estudiante con esa matrícula
          const existingStudent = await this.studentRepository.findByMatricula(student.matricula);
          if (existingStudent) {
            errors.push({
              row: i + 1,
              matricula: student.matricula,
              error: `La matrícula ${student.matricula} ya existe en la base de datos`
            });
            continue;
          }

          // Guardar el estudiante
          const savedStudent = await this.studentRepository.save(student.toPlainObject());
          results.push(savedStudent);

        } catch (error) {
          errors.push({
            row: i + 1,
            data: row,
            error: error.message
          });
        }
      }

      return {
        success: true,
        totalRows: csvData.length,
        successfullyProcessed: results.length,
        errors: errors.length,
        data: results,
        errorDetails: errors
      };

    } catch (error) {
      throw new Error(`Error al procesar el archivo CSV: ${error.message}`);
    }
  }

  mapCsvToStudent(csvRow) {
    // Mapear las columnas del CSV a las propiedades del estudiante
    // Ajustar según la estructura real de tu CSV
    return {
      matricula: csvRow.matricula || csvRow.Matricula,
      nombres: csvRow.nombres || csvRow.Nombres,
      apellidos: csvRow.apellidos || csvRow.Apellidos,
      carreraId: parseInt(csvRow.carrera_id || csvRow.CarreraId || csvRow['Carrera ID']),
      planEstudiosId: parseInt(csvRow.plan_estudios_id || csvRow.PlanEstudiosId || csvRow['Plan Estudios ID']),
      estatusGeneral: csvRow.estatus_general || csvRow.EstatusGeneral || csvRow['Estatus General'] || 'Inscrito',
      cuatrimestreActual: parseInt(csvRow.cuatrimestre_actual || csvRow.CuatrimestreActual || csvRow['Cuatrimestre Actual']),
      email: csvRow.email || csvRow.Email || null,
      numeroTelefono: csvRow.numero_telefono || csvRow.NumeroTelefono || csvRow['Numero Telefono'] || null,
      nombreTutorLegal: csvRow.nombre_tutor_legal || csvRow.NombreTutorLegal || csvRow['Nombre Tutor Legal'] || null,
      tutorAcademicoId: csvRow.tutor_academico_id ? parseInt(csvRow.tutor_academico_id) : null,
      telefonoTutorLegal: csvRow.telefono_tutor_legal || csvRow.TelefonoTutorLegal || csvRow['Telefono Tutor Legal'] || null
    };
  }
}

module.exports = ImportStudentsUseCase;
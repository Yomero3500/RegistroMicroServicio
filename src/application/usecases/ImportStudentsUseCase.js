const Student = require('../../domain/entities/Student');

class ImportStudentsUseCase {
  constructor(studentRepository, csvParser) {
    this.studentRepository = studentRepository;
    this.csvParser = csvParser;
  }

  async execute(filePath) {
    try {
      console.log('🔍 Iniciando procesamiento de archivo CSV...');
      console.log('📁 Ruta del archivo:', filePath);
      
      // Verificar si el archivo existe y obtener información
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo no existe en la ruta: ${filePath}`);
      }
      
      const stats = fs.statSync(filePath);
      console.log('📊 Información del archivo:');
      console.log('  - Tamaño:', stats.size, 'bytes');
      console.log('  - Fecha de modificación:', stats.mtime);
      
      // Leer una muestra del contenido del archivo para debugging
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      console.log('📋 Análisis del contenido:');
      console.log('  - Total de líneas en el archivo:', lines.length);
      console.log('  - Primera línea (headers):', lines[0]);
      console.log('  - Segunda línea (primer dato):', lines[1]);
      console.log('  - Últimas 3 líneas:', lines.slice(-3));
      
      // Parsear el archivo CSV
      console.log('⚙️ Parseando archivo CSV...');
      const csvData = await this.csvParser.parse(filePath);
      
      console.log('✅ Archivo CSV parseado exitosamente');
      console.log('📊 Resultado del parser:');
      console.log('  - Número de registros parseados:', csvData.length);
      
      if (csvData.length > 0) {
        console.log('  - Columnas detectadas:', Object.keys(csvData[0]));
        console.log('  - Primer registro:', csvData[0]);
        if (csvData.length > 1) {
          console.log('  - Segundo registro:', csvData[1]);
        }
      }
      
      const results = [];
      const errors = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        console.log(`🔄 Procesando fila ${i + 1}/${csvData.length}:`, row);
        
        try {
          // Mapear los datos del CSV a la estructura del estudiante
          const studentData = this.mapCsvToStudent(row);
          console.log('📝 Datos mapeados del estudiante:', studentData);
          
          // Crear la entidad Student con validaciones
          const student = Student.create(studentData);

          // Guardar el estudiante
          console.log(`💾 Guardando estudiante: ${student.matricula} - ${student.nombre}`);
          const savedStudent = await this.studentRepository.save(student.toPlainObject());
          console.log('✅ Estudiante guardado exitosamente:', savedStudent.id);
          results.push(savedStudent);

        } catch (error) {
          console.error(`❌ Error procesando fila ${i + 1}:`, error.message);
          errors.push({
            row: i + 1,
            data: row,
            error: error.message
          });
        }
      }

      const finalResult = {
        success: true,
        totalRows: csvData.length,
        successfullyProcessed: results.length,
        errors: errors.length,
        data: results,
        errorDetails: errors
      };
      
      console.log('📈 Resumen final del procesamiento:');
      console.log('  - Total de filas procesadas:', finalResult.totalRows);
      console.log('  - Estudiantes guardados exitosamente:', finalResult.successfullyProcessed);
      console.log('  - Errores encontrados:', finalResult.errors);
      
      return finalResult;

    } catch (error) {
      console.error('💥 Error crítico al procesar el archivo CSV:', error.message);
      console.error('Stack trace:', error.stack);
      throw new Error(`Error al procesar el archivo CSV: ${error.message}`);
    }
  }

  mapCsvToStudent(csvRow) {
    const normalizedRow = {};
    Object.keys(csvRow).forEach(key => {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '');
      normalizedRow[normalizedKey] = csvRow[key];
    });

    return {
      matricula: normalizedRow.matricula || normalizedRow.matrícula,
      nombre: normalizedRow.nombre,
      carrera: normalizedRow.carrera,
      estatusAlumno: normalizedRow.estatusalumno || normalizedRow.estatus_alumno || 'Activo',
      cuatrimestreActual: normalizedRow.cuatrimestreactual || normalizedRow.cuatrimestre_actual,
      grupoActual: normalizedRow.grupoactual || normalizedRow.grupo_actual,
      materia: normalizedRow.materia,
      periodo: normalizedRow.periodo,
      estatusMateria: normalizedRow.estatusmateria || normalizedRow.estatus_materia || 'Sin cursar',
      final: normalizedRow.final ? parseInt(normalizedRow.final) : 0,
      extra: normalizedRow.extra || 'N/A',
      estatusCardex: normalizedRow.estatuscardex || normalizedRow.estatus_cardex || 'Vigente',
      periodoCursado: normalizedRow.periodocursado || normalizedRow.periodo_cursado,
      planEstudiosClave: normalizedRow.planestudiosclave || normalizedRow.plan_estudios_clave,
      creditos: normalizedRow.creditos ? parseInt(normalizedRow.creditos) : null,
      tutorAcademico: normalizedRow.tutoracademico || normalizedRow.tutor_academico
    };
  }
}

module.exports = ImportStudentsUseCase;
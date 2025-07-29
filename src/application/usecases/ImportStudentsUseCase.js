const Student = require('../../domain/entities/Student');
const PersonalIntegrationService = require('../../infrastructure/services/PersonalIntegrationService');
const CohorteService = require('../../infrastructure/services/CohorteService');

class ImportStudentsUseCase {
  constructor(studentRepository, csvParser) {
    this.studentRepository = studentRepository;
    this.csvParser = csvParser;
    this.personalService = new PersonalIntegrationService();
    // Obtener el Sequelize instance para acceder a los modelos de registro
    const { sequelize } = require('../../infrastructure/config/database');
    this.sequelize = sequelize;
    this.cohorteService = new CohorteService(this.sequelize);
  }

  async createRegistrationRecords(studentData, tutoresValidos) {
    try {
      const { Estudiante, Inscripcion } = this.sequelize.models;
      
      // Generar el email basado en la matrícula
      const email = `${studentData.matricula}@ids.upchiapas.edu.mx`;

      // Buscar el ID del tutor usando el nuevo método mejorado
      let tutor = null;
      let tutorId = null;
      
      if (studentData.tutorAcademico && studentData.tutorAcademico.trim() !== '') {
        tutor = await this.personalService.getTutorByName(studentData.tutorAcademico);
        
        if (tutor) {
          tutorId = tutor.id;
          console.log(`✅ Tutor encontrado para ${studentData.matricula}: ID=${tutorId}, Nombre="${tutor.nombre}", Tipo: ${typeof tutorId}`);
        } else {
          console.warn(`⚠️ Tutor "${studentData.tutorAcademico}" no encontrado para estudiante ${studentData.matricula}`);
          
          // Mostrar tutores disponibles para ayudar en debugging
          console.log('📋 Tutores válidos disponibles:');
          tutoresValidos.forEach(t => console.log(`  - ID: ${t.id}, Nombre: "${t.nombre}"`));
        }
      }

      console.log(`🔍 Datos para guardar estudiante ${studentData.matricula}:`, {
        matricula: studentData.matricula,
        nombre: studentData.nombre,
        email: email,
        estatus: studentData.estatusAlumno,
        tutor_academico_id: tutorId
      });

      // Validar y procesar el cohorte
      if (!this.cohorteService.validarMatricula(studentData.matricula)) {
        throw new Error(`Matrícula inválida: ${studentData.matricula}`);
      }

      // Procesar el cohorte antes de crear el estudiante
      const cohorte = await this.cohorteService.processCohorte(studentData.matricula);
      console.log(`📚 Cohorte procesado para estudiante ${studentData.matricula}: ${cohorte.id}`);

      // Crear o actualizar el registro del estudiante
      const [estudiante, created] = await Estudiante.findOrCreate({
        where: { matricula: studentData.matricula },
        defaults: {
          nombre: studentData.nombre,
          email: email,
          estatus: studentData.estatusAlumno,
          tutor_academico_id: tutorId,
          cohorte_id: cohorte.id  // Asociar el estudiante con su cohorte
        }
      });

      // Si el estudiante ya existía, actualizarlo con el tutor_academico_id y cohorte_id
      if (!created) {
        await estudiante.update({
          tutor_academico_id: tutorId,
          cohorte_id: cohorte.id
        });
        console.log(`🔄 Estudiante actualizado con tutor_academico_id: ${tutorId} y cohorte_id: ${cohorte.id}`);
      }

      console.log(`${created ? 'Creado' : 'Actualizado'} estudiante en nueva estructura:`, estudiante.matricula);
      
      return estudiante;
    } catch (error) {
      console.error('Error al crear registros en nueva estructura:', error);
      throw error;
    }
  }

  async execute(filePath) {
    try {
      
      // Verificar disponibilidad del microservicio de Personal
      const personalServiceAvailable = await this.personalService.checkServiceAvailability();
    
      // Obtener lista de tutores válidos
      const tutoresValidos = await this.personalService.getTutores();
      console.log('👥 Tutores válidos obtenidos:', tutoresValidos.map(t => t.nombre));
      
      // Verificar si el archivo existe y obtener información
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo no existe en la ruta: ${filePath}`);
      }
      
      const stats = fs.statSync(filePath);

      
      // Leer una muestra del contenido del archivo para debugging
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      // Parsear el archivo CSV
      const csvData = await this.csvParser.parse(filePath);
      
      
      if (csvData.length > 0) {
        if (csvData.length > 1) {
          console.log('  - Segundo registro:', csvData[1]);
        }
      }
      
      const results = [];
      const errors = [];
      const tutorWarnings = [];

      for (let i = 0; i < csvData.length; i++) {
        const row = csvData[i];
        
        try {
          // Mapear los datos del CSV a la estructura del estudiante
          const studentData = this.mapCsvToStudent(row);
          
          // Validar el tutor académico con el microservicio de Personal
          if (studentData.tutorAcademico) {
            const tutorValido = await this.personalService.getTutorByName(studentData.tutorAcademico);
            
            if (!tutorValido) {
              const warning = `Tutor académico "${studentData.tutorAcademico}" no encontrado en el sistema de Personal para el estudiante ${studentData.matricula}`;
              console.warn(`⚠️ ${warning}`);
              tutorWarnings.push({
                row: i + 1,
                matricula: studentData.matricula,
                tutorNombre: studentData.tutorAcademico,
                warning: warning
              });
            } else {
              console.log(`✅ Tutor académico "${studentData.tutorAcademico}" validado correctamente como "${tutorValido.nombre}" (ID: ${tutorValido.id})`);
            }
          }
          
          // Crear la entidad Student con validaciones
          const student = Student.create(studentData);

          // Guardar el estudiante en record_student
          const savedStudent = await this.studentRepository.save(student.toPlainObject());

          // Crear registros en la nueva estructura
          const nuevoEstudiante = await this.createRegistrationRecords(studentData, tutoresValidos);

          savedStudent.newStructureId = nuevoEstudiante.id;
          results.push(savedStudent);

        } catch (error) {
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
        errorDetails: errors,
        tutorWarnings: tutorWarnings,
        tutorValidationEnabled: personalServiceAvailable
      };
      
      console.log('📈 Resumen final del procesamiento:');
      console.log('  - Total de filas procesadas:', finalResult.totalRows);
      console.log('  - Estudiantes guardados exitosamente:', finalResult.successfullyProcessed);
      console.log('  - Errores encontrados:', finalResult.errors);
      console.log('  - Advertencias de tutores:', tutorWarnings.length);
      
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
      estatusAlumno: normalizedRow.estatusalumno || normalizedRow.estatus_alumno || 'Inscrito',
      cuatrimestreActual: normalizedRow.semestre || normalizedRow.cuatrimestreactual || normalizedRow.cuatrimestre_actual || '1',
      grupoActual: normalizedRow.grupoactual || normalizedRow.grupo_actual,
      materia: normalizedRow.materias || normalizedRow.materia,
      periodo: normalizedRow.periodo,
      estatusMateria: normalizedRow.estado || normalizedRow.estatusmateria || normalizedRow.estatus_materia || 'Sin cursar',
      final: normalizedRow.calificacion ? parseInt(normalizedRow.calificacion) : normalizedRow.final ? parseInt(normalizedRow.final) : 0,
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
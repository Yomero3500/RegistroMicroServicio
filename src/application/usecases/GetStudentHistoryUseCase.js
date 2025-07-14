class GetStudentHistoryUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  async execute(matricula) {
    try {
      if (!matricula) {
        throw new Error('La matrícula es obligatoria');
      }

      // Obtener todo el historial del estudiante
      const studentHistory = await this.studentRepository.findAllByMatricula(matricula);

      if (!studentHistory || studentHistory.length === 0) {
        return {
          success: false,
          message: `No se encontró ningún registro para la matrícula ${matricula}`,
          data: []
        };
      }

      // Agrupar información básica del estudiante
      const studentInfo = {
        matricula: studentHistory[0].matricula,
        nombre: studentHistory[0].nombre,
        carrera: studentHistory[0].carrera,
        estatusAlumno: studentHistory[0].estatusAlumno,
        cuatrimestreActual: studentHistory[0].cuatrimestreActual,
        grupoActual: studentHistory[0].grupoActual,
        totalRegistros: studentHistory.length
      };

      // Agrupar materias por periodo
      const periodos = {};
      const materias = [];

      studentHistory.forEach(record => {
        if (record.materia) {
          materias.push({
            id: record.id,
            materia: record.materia,
            periodo: record.periodo,
            estatusMateria: record.estatusMateria,
            final: record.final,
            extra: record.extra,
            estatusCardex: record.estatusCardex,
            periodoCursado: record.periodoCursado,
            planEstudiosClave: record.planEstudiosClave,
            creditos: record.creditos,
            tutorAcademico: record.tutorAcademico,
            createdAt: record.created_at,
            updatedAt: record.updated_at
          });

          if (record.periodo) {
            if (!periodos[record.periodo]) {
              periodos[record.periodo] = [];
            }
            periodos[record.periodo].push({
              materia: record.materia,
              estatus: record.estatusMateria,
              calificacion: record.final,
              creditos: record.creditos
            });
          }
        }
      });

      return {
        success: true,
        data: {
          estudiante: studentInfo,
          historialCompleto: materias,
          materiasporPeriodo: periodos,
          estadisticas: {
            totalMaterias: materias.length,
            materiasAprobadas: materias.filter(m => m.estatusMateria === 'Aprobada').length,
            materiasReprobadas: materias.filter(m => m.estatusMateria === 'Reprobada').length,
            materiasCursando: materias.filter(m => m.estatusMateria === 'Cursando').length,
            promedioGeneral: this.calculateAverage(materias.filter(m => m.final > 0).map(m => m.final))
          }
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener historial del estudiante: ${error.message}`);
    }
  }

  calculateAverage(grades) {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return Math.round((sum / grades.length) * 100) / 100;
  }
}

module.exports = GetStudentHistoryUseCase;

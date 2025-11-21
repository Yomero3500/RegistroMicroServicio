class GetStudentCompletedSurveysUseCase {
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  async execute({ studentId }) {
    try {
      console.log(`📝 GetStudentCompletedSurveysUseCase: Ejecutando para estudiante ID: ${studentId}`);
      this._validateInput({ studentId });

      const encuestasCompletadas = await this.estudianteRepository.getStudentCompletedSurveys(studentId);
      console.log(`✅ GetStudentCompletedSurveysUseCase: ${encuestasCompletadas.length} encuestas completadas encontradas`);

      return {
        success: true,
        data: encuestasCompletadas,
        total: encuestasCompletadas.length,
        message: `Se encontraron ${encuestasCompletadas.length} encuesta(s) completada(s)`
      };

    } catch (error) {
      console.error('❌ GetStudentCompletedSurveysUseCase: Error:', error.message);
      throw new Error(`Error al obtener encuestas completadas: ${error.message}`);
    }
  }

  _validateInput({ studentId }) {
    if (!studentId) {
      throw new Error('El ID del estudiante es requerido');
    }

    if (typeof studentId !== 'number' && isNaN(parseInt(studentId))) {
      throw new Error('El ID del estudiante debe ser un número válido');
    }
  }

  async _validateStudent(studentId) {
    const estudiante = await this.estudianteRepository.findById(studentId);

    if (!estudiante) {
      throw new Error(`No se encontró el estudiante con ID: ${studentId}`);
    }

    return estudiante;
  }
}

module.exports = GetStudentCompletedSurveysUseCase;
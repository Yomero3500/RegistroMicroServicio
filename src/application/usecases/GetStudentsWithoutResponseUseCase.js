class GetStudentsWithoutResponseUseCase {
  constructor(estudianteRepository, surveyRepository) {
    this.estudianteRepository = estudianteRepository;
    this.surveyRepository = surveyRepository;
  }

  
  async execute(surveyId) {
    try {
      console.log(`🎯 GetStudentsWithoutResponseUseCase: Iniciando para encuesta ID: ${surveyId}`);
      this._validateInput(surveyId);

      const survey = await this.surveyRepository.findById(surveyId);
      
      if (!survey) {
        throw new Error(`La encuesta con ID ${surveyId} no existe`);
      }


      const estudiantes = await this.estudianteRepository.getStudentsWithoutResponse(surveyId);

      return {
        success: true,
        data: {
            'estudiantes':estudiantes,
        }, 
        message: `Se encontraron ${estudiantes.length} estudiantes sin respuesta`
      };

    } catch (error) {
      console.error('❌ GetStudentsWithoutResponseUseCase: Error:', error.message);
      throw new Error(`Error al obtener estudiantes sin respuesta: ${error.message}`);
    }
  }
  _validateInput(surveyId) {
    if (!surveyId) {
      throw new Error('El ID de la encuesta es requerido');
    }

    if (typeof surveyId !== 'number' || surveyId <= 0) {
      throw new Error('El ID de la encuesta debe ser un número positivo');
    }
  }
}

module.exports = GetStudentsWithoutResponseUseCase;
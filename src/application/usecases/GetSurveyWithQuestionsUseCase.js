// src/application/usecases/survey/GetSurveyWithQuestionsUseCase.js

class GetSurveyWithQuestionsUseCase {
  constructor(surveyRepository) {
    this.surveyRepository = surveyRepository;
  }

  async execute(id_encuesta) {
    try {
      console.log(`🔍 GetSurveyWithQuestionsUseCase: Obteniendo encuesta completa con preguntas ID: ${id_encuesta}`);

      // Validar ID
      if (!id_encuesta) {
        throw new Error('El ID de la encuesta es requerido');
      }

      const idNum = parseInt(id_encuesta);
      if (isNaN(idNum)) {
        throw new Error('El ID de la encuesta debe ser un número válido');
      }

      // Obtener información básica y preguntas en paralelo
      const [surveyInfo, questions] = await Promise.all([
        this.surveyRepository.findById(idNum),
        this.surveyRepository.getSurveyQuestions(idNum)
      ]);

      // Verificar que la encuesta existe
      if (!surveyInfo) {
        throw new Error(`No se encontró la encuesta con ID: ${id_encuesta}`);
      }

      // Combinar información
      const surveyWithQuestions = {
        ...surveyInfo,
        preguntas: questions,
        total_preguntas: questions.length
      };

      console.log(`✅ GetSurveyWithQuestionsUseCase: Encuesta "${surveyInfo.titulo}" obtenida con ${questions.length} pregunta(s)`);

      return {
        success: true,
        data: surveyWithQuestions,
        message: 'Encuesta con preguntas obtenida exitosamente'
      };
    } catch (error) {
      console.error('❌ GetSurveyWithQuestionsUseCase: Error:', error);
      throw error;
    }
  }
}

module.exports = GetSurveyWithQuestionsUseCase;
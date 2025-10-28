class GetSurveysByTypeUseCase {
    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    /**
     * Ejecuta la obtención de encuestas filtradas por tipo
     * @param {Array<string>} tipos - Tipos de encuesta a incluir
     * @returns {Promise<Array>} Lista de encuestas filtradas
     */
    async execute(tipos = ['documento', 'seguimiento', 'final', 'empresa']) {
        return await this.surveyRepository.getSurveysByType(tipos);
    }
}

module.exports = GetSurveysByTypeUseCase;

class DeleteSurveyUseCase {
    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    async execute(id_encuesta) {
        return await this.surveyRepository.delete(id_encuesta);
    }
}

module.exports = DeleteSurveyUseCase;

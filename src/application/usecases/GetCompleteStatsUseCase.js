class GetCompleteStatsUseCase {
    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    async execute(id_encuesta) {
        return await this.surveyRepository.getCompleteStats(id_encuesta);
    }
}

module.exports = GetCompleteStatsUseCase;

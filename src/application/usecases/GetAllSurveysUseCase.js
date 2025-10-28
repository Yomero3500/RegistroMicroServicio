class GetAllSurveysUseCase {
    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    async execute() {
        return await this.surveyRepository.listAll();
    }
}

module.exports = GetAllSurveysUseCase;

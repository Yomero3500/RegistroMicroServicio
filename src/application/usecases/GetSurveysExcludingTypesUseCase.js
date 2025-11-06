class GetSurveysExcludingTypesUseCase {
    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    async execute(tiposExcluir = ['documento', 'seguimiento', 'final', 'empresa']) {
        return await this.surveyRepository.getSurveysExcludingTypes(tiposExcluir);
    }
}

module.exports = GetSurveysExcludingTypesUseCase;

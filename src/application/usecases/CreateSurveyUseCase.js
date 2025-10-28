class CreateSurveyUseCase {
    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    async execute({ titulo, id_usuario, descripcion, fecha_creacion, fecha_inicio, fecha_fin, tipo }) {
        return await this.surveyRepository.save(
            titulo,
            id_usuario,
            descripcion,
            fecha_creacion,
            fecha_inicio,
            fecha_fin, 
            tipo
        );
    }
}

module.exports = CreateSurveyUseCase;

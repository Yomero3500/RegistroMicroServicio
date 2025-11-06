class GetBasicStatsUseCase {
  constructor(surveyRepository) {
    this.surveyRepository = surveyRepository;
  }

  async execute(id_encuesta) {
    if (isNaN(Number(id_encuesta))) {
      throw new Error("ID de encuesta inválido");
    }

    const stats = await this.surveyRepository.getBasicStats(Number(id_encuesta));

    if (!stats) {
      throw new Error("Encuesta no encontrada");
    }

    return stats;
  }
}

module.exports = GetBasicStatsUseCase;

class CreateAnswerUseCase {
    constructor(answerRepository) {
        this.answerRepository = answerRepository;
    }

    async run(id_pregunta, id_participacion, respuesta_texto) {
        return this.answerRepository.save(id_pregunta, id_participacion, respuesta_texto);
    }
}

module.exports = CreateAnswerUseCase;

class UpdateAnswerUseCase {
    constructor(answerRepository) {
        this.answerRepository = answerRepository;
    }

    async run(id_respuesta, respuesta_texto) {
        return this.answerRepository.update(id_respuesta, respuesta_texto);
    }
}

module.exports = UpdateAnswerUseCase;

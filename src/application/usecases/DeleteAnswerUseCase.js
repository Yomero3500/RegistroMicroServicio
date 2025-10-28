class DeleteAnswerUseCase {
    constructor(answerRepository) {
        this.answerRepository = answerRepository;
    }

    async run(id_respuesta) {
        return this.answerRepository.delete(id_respuesta);
    }
}

module.exports = DeleteAnswerUseCase;

class ListAllAnswersUseCase {
    constructor(answerRepository) {
        this.answerRepository = answerRepository;
    }

    async run() {
        return this.answerRepository.listAll();
    }
}

module.exports = ListAllAnswersUseCase;

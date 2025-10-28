class ListAllQuestionsUseCase {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async run() {
    return this.questionRepository.listAll();
  }
}

module.exports = ListAllQuestionsUseCase;

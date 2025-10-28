class CreateQuestionUseCase {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async run(id_encuesta, title, type = 'text', options = [], required = false) {
    if (!title || title === "") {
      throw new Error("Tiene que tener un titulo");
    }

    if (!id_encuesta || id_encuesta <= 0) {
      throw new Error("El ID de la encuesta es inválido.");
    }

    if ((type === 'multiple' || type === 'select') && (!options || options.length === 0)) {
      throw new Error("Las preguntas tipo 'multiple' o 'select' deben tener al menos una opción.");
    }

    return this.questionRepository.save(id_encuesta, title, type, options, required);
  }
}

module.exports = CreateQuestionUseCase;

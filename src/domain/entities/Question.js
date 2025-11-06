const Validators = require('../../shared/utils/validators');

class Question {
  constructor({
    id_pregunta,
    id_encuesta,
    title,
    type,
    options,
    required
  }) {
    this.id_pregunta = id_pregunta;
    this.id_encuesta = id_encuesta;
    this.title = title;
    this.type = type || 'text';
    this.options = options ? JSON.stringify(options) : '[]';
    this.required = required || false;
  }

  static create(data) {
    Validators.validateNotEmpty(data.id_encuesta, 'id_encuesta');
    Validators.validateNotEmpty(data.title, 'título');

    const validTypes = ['text', 'multiple', 'checkbox', 'select'];
    if (data.type && !validTypes.includes(data.type)) {
      throw new Error(`Tipo de pregunta no válido. Debe ser uno de: ${validTypes.join(', ')}`);
    }

    return new Question(data);
  }

  getOptions() {
    try {
      return JSON.parse(this.options);
    } catch {
      return [];
    }
  }

  toPlainObject() {
    return {
      id_pregunta: this.id_pregunta,
      id_encuesta: this.id_encuesta,
      title: this.title,
      type: this.type,
      options: this.options,
      required: this.required
    };
  }
}

module.exports = Question;

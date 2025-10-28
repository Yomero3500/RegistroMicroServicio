const Validators = require('../../shared/utils/validators');

class Answer {
  constructor({ id_respuesta, id_pregunta, id_participacion, respuesta_texto }) {
    this.id_respuesta = id_respuesta;
    this.id_pregunta = id_pregunta;
    this.id_participacion = id_participacion;
    this.respuesta_texto = respuesta_texto;
  }

  static create(data) {
    Validators.validateNotEmpty(data.id_pregunta, 'id_pregunta');
    Validators.validateNotEmpty(data.id_participacion, 'id_participacion');

    return new Answer(data);
  }

  toPlainObject() {
    return {
      id_respuesta: this.id_respuesta,
      id_pregunta: this.id_pregunta,
      id_participacion: this.id_participacion,
      respuesta_texto: this.respuesta_texto
    };
  }
}

module.exports = Answer;

const Validators = require('../../shared/utils/validators');

class Participacion {
  constructor({
    id_participacion,
    id_usuario,
    id_encuesta,
    fecha_respuesta,
    estatus
  }) {
    this.id_participacion = id_participacion;
    this.id_usuario = id_usuario;
    this.id_encuesta = id_encuesta;
    this.fecha_respuesta = fecha_respuesta || new Date();
    this.estatus = estatus || 'Pendiente';
  }

  static create(data) {
    Validators.validateNotEmpty(data.id_usuario, 'id_usuario');
    Validators.validateNotEmpty(data.id_encuesta, 'id_encuesta');

    return new Participacion(data);
  }

  isCompleted() {
    return this.estatus === 'Completado' || this.estatus === 'Finalizado';
  }

  toPlainObject() {
    return {
      id_participacion: this.id_participacion,
      id_usuario: this.id_usuario,
      id_encuesta: this.id_encuesta,
      fecha_respuesta: this.fecha_respuesta,
      estatus: this.estatus
    };
  }
}

module.exports = Participacion;

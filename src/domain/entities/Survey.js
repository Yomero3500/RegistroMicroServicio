const Validators = require('../../shared/utils/validators');

class Survey {
  constructor({
    id_encuesta,
    titulo,
    id_usuario,
    descripcion,
    fecha_creacion,
    fecha_inicio,
    fecha_fin
  }) {
    this.id_encuesta = id_encuesta;
    this.titulo = titulo;
    this.id_usuario = id_usuario;
    this.descripcion = descripcion || '';
    this.fecha_creacion = fecha_creacion || new Date();
    this.fecha_inicio = fecha_inicio || null;
    this.fecha_fin = fecha_fin || null;
  }

  static create(data) {
    Validators.validateNotEmpty(data.titulo, 'título');
    Validators.validateNotEmpty(data.id_usuario, 'id_usuario');
    return new Survey(data);
  }

  isActive() {
    const now = new Date();
    return (!this.fecha_inicio || now >= this.fecha_inicio) &&
           (!this.fecha_fin || now <= this.fecha_fin);
  }

  toPlainObject() {
    return {
      id_encuesta: this.id_encuesta,
      titulo: this.titulo,
      id_usuario: this.id_usuario,
      descripcion: this.descripcion,
      fecha_creacion: this.fecha_creacion,
      fecha_inicio: this.fecha_inicio,
      fecha_fin: this.fecha_fin
    };
  }
}

module.exports = Survey;

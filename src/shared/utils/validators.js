const { ValidationError } = require('../exceptions/DomainError');

class Validators {
  static validateMatricula(matricula) {
    const matriculaRegex = /^\d{8}$/;
    if (!matriculaRegex.test(matricula)) {
      throw new ValidationError('La matrícula debe contener 8 dígitos');
    }
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Formato de email inválido');
    }
  }

  static validatePhone(phone) {
    const phoneRegex = /^\d{10}$/;
    if (phone && !phoneRegex.test(phone)) {
      throw new ValidationError('El número de teléfono debe contener 10 dígitos');
    }
  }

  static validateNotEmpty(value, fieldName) {
    if (!value || value.trim() === '') {
      throw new ValidationError(`El campo ${fieldName} no puede estar vacío`);
    }
  }
}

module.exports = Validators;
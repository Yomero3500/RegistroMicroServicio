const { ValidationError } = require('../../shared/exceptions/DomainError');

class StudentStatus {
  static VALID_STATUSES = [
    'Inscrito',
    'Baja Temporal',
    'Baja Definitiva',
    'Egresado'
  ];

  constructor(value) {
    this.validate(value);
    this.value = value;
  }

  validate(status) {
    if (!StudentStatus.VALID_STATUSES.includes(status)) {
      throw new ValidationError(
        `Estado inválido. Estados permitidos: ${StudentStatus.VALID_STATUSES.join(', ')}`
      );
    }
  }

  toString() {
    return this.value;
  }

  equals(other) {
    return other instanceof StudentStatus && this.value === other.value;
  }
}

module.exports = StudentStatus;
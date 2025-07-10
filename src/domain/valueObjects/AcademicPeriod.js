const { ValidationError } = require('../../shared/exceptions/DomainError');

class AcademicPeriod {
  constructor(year, period) {
    this.validate(year, period);
    this.year = year;
    this.period = period;
  }

  validate(year, period) {
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new ValidationError('Año académico inválido');
    }

    if (!['ENERO-ABRIL', 'MAYO-AGOSTO', 'SEPTIEMBRE-DICIEMBRE'].includes(period)) {
      throw new ValidationError('Periodo académico inválido');
    }
  }

  toString() {
    return `${this.period} ${this.year}`;
  }

  equals(other) {
    return other instanceof AcademicPeriod && 
           this.year === other.year && 
           this.period === other.period;
  }
}

module.exports = AcademicPeriod;
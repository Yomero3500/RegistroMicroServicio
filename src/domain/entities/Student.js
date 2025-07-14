const Validators = require('../../shared/utils/validators');

class Student {
  constructor({
    id,
    matricula,
    nombres,
    apellidos,
    carreraId,
    planEstudiosId,
    estatusGeneral,
    cuatrimestreActual,
    email,
    numeroTelefono,
    nombreTutorLegal,
    tutorAcademicoId,
    telefonoTutorLegal
  }) {
    this.id = id;
    this.matricula = matricula;
    this.nombres = nombres;
    this.apellidos = apellidos;
    this.carreraId = carreraId;
    this.planEstudiosId = planEstudiosId;
    this.estatusGeneral = estatusGeneral;
    this.cuatrimestreActual = cuatrimestreActual;
    this.email = email;
    this.numeroTelefono = numeroTelefono;
    this.nombreTutorLegal = nombreTutorLegal;
    this.tutorAcademicoId = tutorAcademicoId;
    this.telefonoTutorLegal = telefonoTutorLegal;
  }

  static create(studentData) {
    // Validaciones de dominio
    Validators.validateNotEmpty(studentData.matricula, 'matrícula');
    Validators.validateMatricula(studentData.matricula);
    Validators.validateNotEmpty(studentData.nombres, 'nombres');
    Validators.validateNotEmpty(studentData.apellidos, 'apellidos');
    
    if (studentData.email) {
      Validators.validateEmail(studentData.email);
    }
    
    if (studentData.numeroTelefono) {
      Validators.validatePhone(studentData.numeroTelefono);
    }
    
    if (studentData.telefonoTutorLegal) {
      Validators.validatePhone(studentData.telefonoTutorLegal);
    }

    return new Student(studentData);
  }

  // Método para obtener el nombre completo
  getFullName() {
    return `${this.nombres} ${this.apellidos}`;
  }

  // Método para verificar si el estudiante está activo
  isActive() {
    return this.estatusGeneral === 'Inscrito';
  }

  // Método para obtener los datos como un objeto plano
  toPlainObject() {
    return {
      id: this.id,
      matricula: this.matricula,
      nombres: this.nombres,
      apellidos: this.apellidos,
      carreraId: this.carreraId,
      planEstudiosId: this.planEstudiosId,
      estatusGeneral: this.estatusGeneral,
      cuatrimestreActual: this.cuatrimestreActual,
      email: this.email,
      numeroTelefono: this.numeroTelefono,
      nombreTutorLegal: this.nombreTutorLegal,
      tutorAcademicoId: this.tutorAcademicoId,
      telefonoTutorLegal: this.telefonoTutorLegal
    };
  }
}

module.exports = Student;
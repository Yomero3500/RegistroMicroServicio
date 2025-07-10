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
    // Aquí irían las validaciones de dominio
    return new Student(studentData);
  }
}

module.exports = Student;
const Validators = require('../../shared/utils/validators');

class Student {
  constructor({
    id,
    matricula,
    nombre,
    email,
    estatus,
    tutorAcademicoId,
    cohorteId,
    passwordHash,
    // Mantener compatibilidad con campos legacy
    carrera,
    estatusAlumno,
    cuatrimestreActual,
    grupoActual,
    materia,
    periodo,
    estatusMateria,
    final,
    extra,
    estatusCardex,
    periodoCursado,
    planEstudiosClave,
    creditos,
    tutorAcademico
  }) {
    this.id = id;
    this.matricula = matricula;
    this.nombre = nombre;
    this.email = email;
    this.estatus = estatus || estatusAlumno || 'Inscrito';
    this.tutorAcademicoId = tutorAcademicoId || tutorAcademico;
    this.cohorteId = cohorteId || carrera;
    this.passwordHash = passwordHash;
    
    // Campos legacy para compatibilidad
    this.carrera = carrera || cohorteId;
    this.estatusAlumno = estatusAlumno || estatus;
    this.cuatrimestreActual = cuatrimestreActual;
    this.grupoActual = grupoActual;
    this.materia = materia;
    this.periodo = periodo;
    this.estatusMateria = estatusMateria;
    this.final = final;
    this.extra = extra;
    this.estatusCardex = estatusCardex;
    this.periodoCursado = periodoCursado;
    this.planEstudiosClave = planEstudiosClave;
    this.creditos = creditos;
    this.tutorAcademico = tutorAcademico || tutorAcademicoId;
  }

  static create(studentData) {
    // Validaciones de dominio
    Validators.validateNotEmpty(studentData.matricula, 'matrícula');
    Validators.validateMatricula(studentData.matricula);
    Validators.validateNotEmpty(studentData.nombre, 'nombre');
    
    // Validar email si se proporciona
    if (studentData.email) {
      if (!Validators.validateEmail(studentData.email)) {
        throw new Error('Email inválido');
      }
    }
    
    // Validar cohorteId o carrera
    if (!studentData.cohorteId && !studentData.carrera) {
      throw new Error('Se requiere cohorteId o carrera');
    }

    return new Student(studentData);
  }

  // Método para verificar si el estudiante está inscrito
  isActive() {
    return this.estatus === 'Inscrito' || this.estatusAlumno === 'Inscrito';
  }

  // Método para verificar si la materia está aprobada
  isMateriaAprobada() {
    return this.estatusMateria === 'Aprobada';
  }

  // Método para obtener los datos como un objeto plano
  toPlainObject() {
    return {
      id: this.id,
      matricula: this.matricula,
      nombre: this.nombre,
      email: this.email,
      estatus: this.estatus,
      tutorAcademicoId: this.tutorAcademicoId,
      cohorteId: this.cohorteId,
      // Incluir campos legacy para compatibilidad
      carrera: this.carrera,
      estatusAlumno: this.estatusAlumno,
      cuatrimestreActual: this.cuatrimestreActual,
      grupoActual: this.grupoActual,
      materia: this.materia,
      periodo: this.periodo,
      estatusMateria: this.estatusMateria,
      final: this.final,
      extra: this.extra,
      estatusCardex: this.estatusCardex,
      periodoCursado: this.periodoCursado,
      planEstudiosClave: this.planEstudiosClave,
      creditos: this.creditos,
      tutorAcademico: this.tutorAcademico
    };
  }
}

module.exports = Student;
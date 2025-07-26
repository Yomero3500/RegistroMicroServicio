const Validators = require('../../shared/utils/validators');

class Student {
  constructor({
    id,
    matricula,
    nombre,
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
    this.carrera = carrera;
    this.estatusAlumno = estatusAlumno;
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
    this.tutorAcademico = tutorAcademico;
  }

  static create(studentData) {
    // Validaciones de dominio
    Validators.validateNotEmpty(studentData.matricula, 'matrícula');
    Validators.validateMatricula(studentData.matricula);
    Validators.validateNotEmpty(studentData.nombre, 'nombre');
    Validators.validateNotEmpty(studentData.carrera, 'carrera');
    
    // Validar calificación final si se proporciona
    if (studentData.final !== undefined && studentData.final !== null) {
      const finalNum = parseInt(studentData.final);
      if (isNaN(finalNum) || finalNum < 0 || finalNum > 100) {
        throw new Error('La calificación final debe ser un número entre 0 y 100');
      }
    }

    // Validar créditos si se proporcionan
    if (studentData.creditos !== undefined && studentData.creditos !== null) {
      const creditosNum = parseInt(studentData.creditos);
      if (isNaN(creditosNum) || creditosNum < 0) {
        throw new Error('Los créditos deben ser un número positivo');
      }
    }

    return new Student(studentData);
  }

  // Método para verificar si el estudiante está inscrito
  isActive() {
    return this.estatusAlumno === 'Inscrito' || this.estatusAlumno === 'Inscrito';
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
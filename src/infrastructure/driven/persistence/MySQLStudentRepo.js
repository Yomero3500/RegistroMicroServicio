const StudentRepository = require('../../../application/ports/output/StudentRepository');
const { sequelize } = require('../../config/database');
const StudentModel = require('./models/StudentModel');

class MySQLStudentRepo extends StudentRepository {
  constructor() {
    super();
    this.Student = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      console.log('🔄 MySQLStudentRepo: Inicializando modelo Student...');
      
      // Inicializar el modelo directamente
      this.Student = StudentModel.init(sequelize);
      
      if (!this.Student) {
        throw new Error('Error al inicializar el modelo Student.');
      }
      
      console.log('✅ MySQLStudentRepo: Modelo Student inicializado correctamente');
      this.initialized = true;
    }
  }

  async save(student) {
    try {
      await this.initialize();
      
      const savedStudent = await this.Student.create({
        matricula: student.matricula,
        nombre: student.nombre,
        carrera: student.carrera,
        estatusAlumno: student.estatusAlumno,
        cuatrimestreActual: student.cuatrimestreActual,
        grupoActual: student.grupoActual,
        materia: student.materia,
        periodo: student.periodo,
        estatusMateria: student.estatusMateria,
        final: student.final,
        extra: student.extra,
        estatusCardex: student.estatusCardex,
        periodoCursado: student.periodoCursado,
        planEstudiosClave: student.planEstudiosClave,
        creditos: student.creditos,
        tutorAcademico: student.tutorAcademico
      });

      return savedStudent.toJSON();
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message).join(', ');
        throw new Error(`Error de validación: ${messages}`);
      }
      throw new Error(`Error al guardar estudiante: ${error.message}`);
    }
  }

  async findByMatricula(matricula) {
    try {
      await this.initialize();
      
      // Busca el primer registro de la matrícula (para compatibilidad)
      const student = await this.Student.findOne({
        where: { matricula },
        order: [['id', 'ASC']]
      });

      return student ? student.toJSON() : null;
    } catch (error) {
      throw new Error(`Error al buscar estudiante: ${error.message}`);
    }
  }

  async findAllByMatricula(matricula) {
    try {
      await this.initialize();
      
      // Busca todos los registros de la matrícula (historial completo)
      const students = await this.Student.findAll({
        where: { matricula },
        order: [['id', 'ASC']]
      });

      return students.map(student => student.toJSON());
    } catch (error) {
      throw new Error(`Error al buscar historial del estudiante: ${error.message}`);
    }
  }

  async findAll() {
    try {
      await this.initialize();
      
      const students = await this.Student.findAll({
        order: [['id', 'DESC']]
      });

      return students.map(student => student.toJSON());
    } catch (error) {
      throw new Error(`Error al obtener estudiantes: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      await this.initialize();
      
      const student = await this.Student.findByPk(id);

      return student ? student.toJSON() : null;
    } catch (error) {
      throw new Error(`Error al buscar estudiante por ID: ${error.message}`);
    }
  }

  async update(id, studentData) {
    try {
      await this.initialize();
      
      const [updatedRowsCount] = await this.Student.update(studentData, {
        where: { id }
      });

      if (updatedRowsCount === 0) {
        throw new Error('Estudiante no encontrado');
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar estudiante: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      await this.initialize();
      
      const deletedRowsCount = await this.Student.destroy({
        where: { id }
      });

      if (deletedRowsCount === 0) {
        throw new Error('Estudiante no encontrado');
      }

      return true;
    } catch (error) {
      throw new Error(`Error al eliminar estudiante: ${error.message}`);
    }
  }

  async getStudentsBasicInfo() {
    try {
      await this.initialize();
      
      console.log('🔍 MySQLStudentRepo: Obteniendo información básica de estudiantes...');
      
      const students = await this.Student.findAll({
        attributes: ['matricula', 'nombre', 'tutorAcademico'],
        order: [['matricula', 'ASC']]
      });

      console.log(`✅ MySQLStudentRepo: ${students.length} estudiantes encontrados`);
      return students;
    } catch (error) {
      console.error('❌ MySQLStudentRepo: Error al obtener información básica de estudiantes:', error);
      throw new Error(`Error al obtener información básica de estudiantes: ${error.message}`);
    }
  }
}

module.exports = MySQLStudentRepo;
const StudentRepository = require('../../../application/ports/output/StudentRepository');
const database = require('../../config/database');
const ModelInitializer = require('./models');

class MySQLStudentRepo extends StudentRepository {
  constructor() {
    super();
    this.Student = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      const sequelize = await database.getConnection();
      const models = await ModelInitializer.initializeModels(sequelize);
      this.Student = models.Student;
      this.initialized = true;
    }
  }

  async save(student) {
    try {
      await this.initialize();
      
      const savedStudent = await this.Student.create({
        matricula: student.matricula,
        nombres: student.nombres,
        apellidos: student.apellidos,
        carreraId: student.carreraId,
        planEstudiosId: student.planEstudiosId,
        estatusGeneral: student.estatusGeneral,
        cuatrimestreActual: student.cuatrimestreActual,
        email: student.email,
        numeroTelefono: student.numeroTelefono,
        nombreTutorLegal: student.nombreTutorLegal,
        tutorAcademicoId: student.tutorAcademicoId,
        telefonoTutorLegal: student.telefonoTutorLegal
      });

      return savedStudent.toJSON();
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`La matrícula ${student.matricula} ya existe`);
      }
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
      
      const student = await this.Student.findOne({
        where: { matricula }
      });

      return student ? student.toJSON() : null;
    } catch (error) {
      throw new Error(`Error al buscar estudiante: ${error.message}`);
    }
  }

  async findAll() {
    try {
      await this.initialize();
      
      const students = await this.Student.findAll({
        order: [['createdAt', 'DESC']]
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
}

module.exports = MySQLStudentRepo;
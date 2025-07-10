const StudentRepository = require('../../../application/ports/output/StudentRepository');
const database = require('../../config/database');

class MySQLStudentRepo extends StudentRepository {
  async save(student) {
    const connection = await database.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO estudiantes (matricula, nombres, apellidos, carrera_id, plan_estudios_id, estatus_general, cuatrimestre_actual) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          student.matricula,
          student.nombres,
          student.apellidos,
          student.carreraId,
          student.planEstudiosId,
          student.estatusGeneral,
          student.cuatrimestreActual
        ]
      );

      return { ...student, id: result.insertId };
    } catch (error) {
      throw new Error(`Error al guardar estudiante: ${error.message}`);
    }
  }

  async findByMatricula(matricula) {
    const connection = await database.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM estudiantes WHERE matricula = ?',
        [matricula]
      );

      return rows[0] ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error al buscar estudiante: ${error.message}`);
    }
  }

  async findAll() {
    const connection = await database.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM estudiantes');
      return rows;
    } catch (error) {
      throw new Error(`Error al obtener estudiantes: ${error.message}`);
    }
  }
}

module.exports = MySQLStudentRepo;
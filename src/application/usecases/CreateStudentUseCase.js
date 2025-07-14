const Student = require('../../domain/entities/Student');

class CreateStudentUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  async execute(studentData) {
    try {
      // Crear la entidad Student con validaciones
      const student = Student.create(studentData);
      
      // Verificar si ya existe un estudiante con esa matrícula
      const existingStudent = await this.studentRepository.findByMatricula(student.matricula);
      if (existingStudent) {
        throw new Error(`La matrícula ${student.matricula} ya existe en la base de datos`);
      }

      // Guardar el estudiante
      const savedStudent = await this.studentRepository.save(student.toPlainObject());
      
      return {
        success: true,
        data: savedStudent,
        message: 'Estudiante creado exitosamente'
      };

    } catch (error) {
      throw new Error(`Error al crear estudiante: ${error.message}`);
    }
  }
}

module.exports = CreateStudentUseCase;

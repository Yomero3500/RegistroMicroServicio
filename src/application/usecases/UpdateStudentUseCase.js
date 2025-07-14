const Student = require('../../domain/entities/Student');

class UpdateStudentUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  async execute(id, studentData) {
    try {
      // Verificar que el estudiante existe
      const existingStudent = await this.studentRepository.findById(id);
      if (!existingStudent) {
        throw new Error('Estudiante no encontrado');
      }

      // Si se está cambiando la matrícula, verificar que no exista otra con la misma
      if (studentData.matricula && studentData.matricula !== existingStudent.matricula) {
        const duplicateStudent = await this.studentRepository.findByMatricula(studentData.matricula);
        if (duplicateStudent) {
          throw new Error(`La matrícula ${studentData.matricula} ya existe en la base de datos`);
        }
      }

      // Crear entidad con los nuevos datos para validar
      const updatedData = { ...existingStudent, ...studentData };
      const student = Student.create(updatedData);
      
      // Actualizar el estudiante
      const updatedStudent = await this.studentRepository.update(id, student.toPlainObject());
      
      return {
        success: true,
        data: updatedStudent,
        message: 'Estudiante actualizado exitosamente'
      };

    } catch (error) {
      throw new Error(`Error al actualizar estudiante: ${error.message}`);
    }
  }
}

module.exports = UpdateStudentUseCase;

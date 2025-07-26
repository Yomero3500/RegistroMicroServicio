class DeleteStudentUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  async execute(id) {
    try {
      // Verificar que el estudiante existe
      const existingStudent = await this.studentRepository.findById(id);
      if (!existingStudent) {
        throw new Error('Estudiante no encontrado');
      }

      // Eliminar el estudiante
      await this.studentRepository.delete(id);
      
      return {
        success: true,
        message: 'Estudiante eliminado exitosamente'
      };

    } catch (error) {
      throw new Error(`Error al eliminar estudiante: ${error.message}`);
    }
  }
}

module.exports = DeleteStudentUseCase;

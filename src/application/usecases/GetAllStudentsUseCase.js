class GetAllStudentsUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository;
  }

  async execute() {
    try {
      const students = await this.studentRepository.findAll();
      
      if (!students || students.length === 0) {
        return {
          success: false,
          message: 'No se encontraron alumnos',
          data: []
        };
      }

      return {
        success: true,
        data: students,
        total: students.length
      };
    } catch (error) {
      throw new Error(`Error al obtener estudiantes: ${error.message}`);
    }
  }
}

module.exports = GetAllStudentsUseCase;

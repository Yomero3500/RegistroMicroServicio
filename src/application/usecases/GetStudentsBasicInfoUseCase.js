class GetStudentsBasicInfoUseCase {
    constructor(studentRepository) {
        this.studentRepository = studentRepository;
    }

    async execute() {
        try {
            console.log('🔍 GetStudentsBasicInfoUseCase: Obteniendo información básica de estudiantes...');
            
            const students = await this.studentRepository.getStudentsBasicInfo();
            
            // Formatear la respuesta para incluir solo los datos necesarios
            const formattedStudents = students.map(student => ({
                matricula: student.matricula,
                nombre: student.nombre,
                tutorAcademicoId: student.tutorAcademico // Este es el ID del tutor
            }));

            console.log(`✅ GetStudentsBasicInfoUseCase: ${formattedStudents.length} estudiantes procesados`);
            return formattedStudents;
        } catch (error) {
            console.error('❌ GetStudentsBasicInfoUseCase: Error:', error);
            throw new Error(`Error al obtener información básica de estudiantes: ${error.message}`);
        }
    }
}

module.exports = GetStudentsBasicInfoUseCase;

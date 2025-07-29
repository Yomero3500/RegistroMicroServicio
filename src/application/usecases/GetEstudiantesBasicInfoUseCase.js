class GetEstudiantesBasicInfoUseCase {
    constructor(estudianteRepository) {
        this.estudianteRepository = estudianteRepository;
    }

    async execute() {
        try {
            console.log('🔍 GetEstudiantesBasicInfoUseCase: Obteniendo información básica de estudiantes...');
            
            const estudiantes = await this.estudianteRepository.getEstudiantesBasicInfo();
            
            // Formatear la respuesta para incluir solo los datos necesarios
            const formattedEstudiantes = estudiantes.map(estudiante => ({
                matricula: estudiante.matricula,
                nombre: estudiante.nombre,
                tutorAcademicoId: estudiante.tutor_academico_id
            }));

            console.log(`✅ GetEstudiantesBasicInfoUseCase: ${formattedEstudiantes.length} estudiantes procesados`);
            return formattedEstudiantes;
        } catch (error) {
            console.error('❌ GetEstudiantesBasicInfoUseCase: Error:', error);
            throw new Error(`Error al obtener información básica de estudiantes: ${error.message}`);
        }
    }
}

module.exports = GetEstudiantesBasicInfoUseCase;

class GetEstudianteByMatriculaUseCase {
    constructor(estudianteRepository) {
        this.estudianteRepository = estudianteRepository;
    }

    async execute(matricula) {
        try {
            console.log(`🔍 GetEstudianteByMatriculaUseCase: Buscando estudiante con matrícula: ${matricula}`);
            
            // Validar que se proporcione la matrícula
            if (!matricula) {
                throw new Error('La matrícula es requerida');
            }

            // Validar formato de matrícula (6 dígitos)
            if (!/^[0-9]{6}$/.test(matricula)) {
                throw new Error('La matrícula debe tener exactamente 6 dígitos numéricos');
            }
            
            const estudiante = await this.estudianteRepository.getEstudianteByMatricula(matricula);
            
            if (!estudiante) {
                throw new Error(`No se encontró un estudiante con la matrícula: ${matricula}`);
            }

            console.log(`✅ GetEstudianteByMatriculaUseCase: Estudiante encontrado: ${estudiante.nombre}`);
            return estudiante;
        } catch (error) {
            console.error('❌ GetEstudianteByMatriculaUseCase: Error:', error);
            throw error;
        }
    }
}

module.exports = GetEstudianteByMatriculaUseCase;

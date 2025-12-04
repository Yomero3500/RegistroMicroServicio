class GetEstudianteByEmailUseCase {
    constructor(estudianteRepository) {
        this.estudianteRepository = estudianteRepository;
    }

    async execute(email) {
        try {
            console.log(`🔍 GetEstudianteByEmailUseCase: Buscando estudiante con email: ${email}`);
            
            // Validar que se proporcione el email
            if (!email) {
                throw new Error('El email es requerido');
            }

            // Validar formato básico de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('El formato del email no es válido');
            }
            
            const estudiante = await this.estudianteRepository.getEstudianteByEmail(email);
            
            if (!estudiante) {
                throw new Error(`No se encontró un estudiante con el email: ${email}`);
            }

            console.log(`✅ GetEstudianteByEmailUseCase: Estudiante encontrado: ${estudiante.nombre}`);
            
            // Retornar información del estudiante (sin contraseña)
            const { password, ...estudianteData } = estudiante.toJSON ? estudiante.toJSON() : estudiante;
            
            return estudianteData;
        } catch (error) {
            console.error('❌ GetEstudianteByEmailUseCase: Error:', error);
            throw error;
        }
    }
}

module.exports = GetEstudianteByEmailUseCase;

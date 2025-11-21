// application/usecases/SendPendingRequirementsEmailUseCase.js

class SendPendingRequirementsEmailUseCase {
    constructor(surveyRepository) {
        this.surveyRepository = surveyRepository;
    }

    /**
     * Envía correo de requisitos pendientes a un estudiante
     * @param {Object} params - Parámetros del estudiante
     * @param {string} params.studentEmail - Email del estudiante
     * @param {string} params.studentName - Nombre completo del estudiante
     * @param {string} params.matricula - Matrícula del estudiante
     * @param {Array<string>} params.requisitosFaltantes - Array de requisitos pendientes
     * @param {number} params.numRequisitos - Número de requisitos pendientes
     * @returns {Promise<Object>} Resultado del envío
     */
    async execute({ studentEmail, studentName, matricula, requisitosFaltantes, numRequisitos }) {
        // Validaciones
        if (!studentEmail || typeof studentEmail !== 'string') {
            throw new Error('El email del estudiante es requerido y debe ser una cadena de texto');
        }

        if (!studentName || typeof studentName !== 'string') {
            throw new Error('El nombre del estudiante es requerido y debe ser una cadena de texto');
        }

        if (!matricula || typeof matricula !== 'string') {
            throw new Error('La matrícula del estudiante es requerida y debe ser una cadena de texto');
        }

        if (!Array.isArray(requisitosFaltantes) || requisitosFaltantes.length === 0) {
            throw new Error('Debe proporcionar al menos un requisito pendiente');
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentEmail)) {
            throw new Error('El formato del email no es válido');
        }

        // Calcular número de requisitos si no se proporciona
        const totalRequisitos = numRequisitos || requisitosFaltantes.length;

        try {
            // Ejecutar el envío a través del repositorio
            const result = await this.surveyRepository.sendPendingRequirementsEmail(
                studentEmail,
                studentName,
                matricula,
                requisitosFaltantes,
                totalRequisitos
            );

            console.log(`✅ Correo enviado exitosamente a ${studentName} (${matricula})`);

            return {
                success: true,
                message: 'Correo enviado exitosamente',
                data: result,
                recipient: {
                    email: studentEmail,
                    name: studentName,
                    matricula: matricula
                },
                numRequisitosPendientes: totalRequisitos
            };

        } catch (error) {
            console.error(`❌ Error al enviar correo a ${studentName} (${matricula}):`, error.message);
            throw new Error(`Error al enviar correo: ${error.message}`);
        }
    }
}

module.exports = SendPendingRequirementsEmailUseCase;
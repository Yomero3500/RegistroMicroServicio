class GetCohortCompleteDataUseCase {
    constructor(estudianteRepositoryCohorte) {
        this.estudianteRepositoryCohorte = estudianteRepositoryCohorte;
    }

    async execute(cohort = null) {
        try {
            // Obtener todos los datos consolidados
            const data = await this.estudianteRepositoryCohorte.getCohortCompleteData(cohort);

            // Transformar los datos para el frontend si es necesario
            return data;
        } catch (error) {
            console.error('Error en GetCohortCompleteDataUseCase:', error);
            throw error;
        }
    }
}

module.exports = GetCohortCompleteDataUseCase;
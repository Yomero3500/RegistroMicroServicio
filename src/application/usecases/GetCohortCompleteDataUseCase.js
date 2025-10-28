class GetCohortCompleteDataUseCase {
    constructor(estudianteRepositoryCohorte) {
        this.estudianteRepositoryCohorte = estudianteRepositoryCohorte;
    }

    async execute(year = null) {
        try {
            // Validar el año si se proporciona
            if (year && !this.isValidYear(year)) {
                throw new Error('El año proporcionado no es válido. Debe ser un número de 4 dígitos.');
            }

            // Obtener todos los datos consolidados
            const data = await this.estudianteRepositoryCohorte.getCohortCompleteData(year);

            // Transformar los datos para el frontend si es necesario
            return data;
        } catch (error) {
            console.error('Error en GetCohortCompleteDataUseCase:', error);
            throw error;
        }
    }

    isValidYear(year) {
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        return yearNum >= 2000 && yearNum <= currentYear + 1;
    }
}

module.exports = GetCohortCompleteDataUseCase;
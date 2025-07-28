class CreateAsignaturaUseCase {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async execute(asignaturaData) {
        try {
            const { Asignatura } = this.sequelize.models;

            // Crear la asignatura
            const asignatura = await Asignatura.create({
                nombre: asignaturaData.nombre,
                num_cuatri: asignaturaData.num_cuatri
            });

            console.log('✅ Asignatura creada:', asignatura.nombre);
            return asignatura;

        } catch (error) {
            console.error('💥 Error al crear asignatura:', error);
            throw error;
        }
    }
}

module.exports = CreateAsignaturaUseCase;

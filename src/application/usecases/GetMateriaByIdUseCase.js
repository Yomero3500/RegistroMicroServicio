class GetMateriaByIdUseCase {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async execute(asignatura_id) {
        try {
            const { Asignatura } = this.sequelize.models;

            const materia = await Asignatura.findOne({
                where: {
                    id: asignatura_id
                }
            });

            if (!materia) {
                throw new Error('Asignatura no encontrada');
            }

            return {
                status: 'success',
                data: {
                    nombre: materia.nombre,
                    cuatrimestre: materia.num_cuatri
                }
            };
        } catch (error) {
            console.error('💥 Error al buscar materia:', error);
            throw error;
        }
    }
}

module.exports = GetMateriaByIdUseCase;

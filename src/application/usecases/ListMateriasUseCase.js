class ListMateriasUseCase {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async execute() {
        try {
            const { Asignatura } = this.sequelize.models;

            const materias = await Asignatura.findAll({
                order: [
                    ['num_cuatri', 'ASC'],
                    ['nombre', 'ASC']
                ]
            });

            // Transformar los datos para la respuesta
            return materias.map(materia => ({
                id: materia.id,
                nombre: materia.nombre,
                cuatrimestre: materia.num_cuatri,
                grupos: materia.grupos.map(grupo => ({
                    numero: grupo.id,
                    grado: grupo.grado,
                    profesor_id: grupo.profesor_id
                }))
            }));

        } catch (error) {
            console.error('💥 Error al listar materias:', error);
            throw error;
        }
    }
}

module.exports = ListMateriasUseCase;

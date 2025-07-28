const { Op } = require('sequelize');

class FindMultipleMateriasUseCase {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async execute(asignatura_ids) {
        try {
            if (!Array.isArray(asignatura_ids)) {
                throw new Error('El parámetro asignatura_ids debe ser un array');
            }

            const { Asignatura } = this.sequelize.models;

            const materias = await Asignatura.findAll({
                where: {
                    id: {
                        [Op.in]: asignatura_ids
                    }
                },
                order: [
                    ['num_cuatri', 'ASC'],
                    ['nombre', 'ASC']
                ]
            });

            return {
                success: true,
                message: `${materias.length} asignaturas encontradas`,
                data: materias.map(materia => ({
                    id: materia.id,
                    nombre: materia.nombre,
                    cuatrimestre: materia.num_cuatri
                }))
            };
        } catch (error) {
            console.error('💥 Error al buscar materias:', error);
            throw error;
        }
    }
}

module.exports = FindMultipleMateriasUseCase;

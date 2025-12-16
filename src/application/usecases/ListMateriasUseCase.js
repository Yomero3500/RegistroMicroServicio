class ListMateriasUseCase {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async execute() {
        try {
            const { Asignatura, Grupo } = this.sequelize.models;

            // Verificar si existe el modelo Grupo para incluirlo en la consulta
            const includeOptions = [];
            
            if (Grupo) {
                // Si existe la asociación con Grupo, incluirla
                includeOptions.push({
                    model: Grupo,
                    as: 'grupos',
                    required: false // LEFT JOIN para no excluir materias sin grupos
                });
            }

            const materias = await Asignatura.findAll({
                include: includeOptions,
                order: [
                    ['num_cuatri', 'ASC'],
                    ['nombre', 'ASC']
                ]
            });

            // Transformar los datos para la respuesta
            return materias.map(materia => {
                const resultado = {
                    id: materia.id,
                    nombre: materia.nombre,
                    cuatrimestre: materia.num_cuatri,
                    grupos: []
                };

                // Solo mapear grupos si existen
                if (materia.grupos && Array.isArray(materia.grupos)) {
                    resultado.grupos = materia.grupos.map(grupo => ({
                        numero: grupo.id,
                        grado: grupo.grado || null,
                        profesor_id: grupo.profesor_id || null
                    }));
                }

                return resultado;
            });

        } catch (error) {
            console.error('💥 Error al listar materias:', error);
            throw error;
        }
    }
}

module.exports = ListMateriasUseCase;

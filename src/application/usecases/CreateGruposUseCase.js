class CreateGruposUseCase {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    async execute(data) {
        const { Grupo } = this.sequelize.models;
        const t = await this.sequelize.transaction();

        try {
            const gruposCreados = [];
            
            for (const grupoData of data.grupos) {
                // Validar que el número del grupo existe
                if (!grupoData.numero) {
                    throw new Error('Cada grupo debe tener un número');
                }

                // Convertir el número del grupo a entero
                const grupoNumero = parseInt(grupoData.numero);
                if (isNaN(grupoNumero) || grupoNumero < 1) {
                    throw new Error(`Número de grupo inválido: ${grupoData.numero}. Debe ser un número positivo.`);
                }

                const [grupo, created] = await Grupo.findOrCreate({
                    where: { id: grupoNumero },
                    defaults: {
                        id: grupoNumero,
                        grado: data.num_cuatri || null, // Usar el número de cuatrimestre como grado
                        profesor_id: grupoData.profesorId || null
                    },
                    transaction: t
                });

                gruposCreados.push({
                    id: grupo.id,
                    created: created,
                    cohorte_id: grupo.cohorte_id,
                    grado: grupo.grado
                });
            }

            await t.commit();
            return gruposCreados;

        } catch (error) {
            await t.rollback();
            console.error('💥 Error al crear grupos:', error);
            throw error;
        }
    }

    async updateGrupo(id, updateData) {
        const { Grupo } = this.sequelize.models;

        try {
            const grupo = await Grupo.findByPk(id);
            
            if (!grupo) {
                throw new Error(`No se encontró el grupo con ID: ${id}`);
            }

            // Actualizar solo los campos proporcionados
            await grupo.update({
                cohorte_id: updateData.cohorte_id !== undefined ? updateData.cohorte_id : grupo.cohorte_id,
                grado: updateData.grado !== undefined ? updateData.grado : grupo.grado
            });

            return grupo;

        } catch (error) {
            console.error(`💥 Error al actualizar grupo ${id}:`, error);
            throw error;
        }
    }
}

module.exports = CreateGruposUseCase;

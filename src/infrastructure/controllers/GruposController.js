const CreateGruposUseCase = require('../../application/usecases/CreateGruposUseCase');

class GruposController {
    constructor() {
        const { sequelize } = require('../config/database');
        this.sequelize = sequelize;
        this.createGruposUseCase = new CreateGruposUseCase(this.sequelize);
    }

    async createGrupos(req, res) {
        try {
            const { num_cuatri, grupos } = req.body;

            // Validaciones
            if (!grupos || !Array.isArray(grupos)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Se requiere un array de grupos'
                });
            }

            if (num_cuatri && (typeof num_cuatri !== 'number' || num_cuatri < 1)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'num_cuatri debe ser un número positivo'
                });
            }

            // Validar que los números de grupo sean válidos
            for (const grupo of grupos) {
                if (typeof grupo.numero !== 'number' || grupo.numero < 1) {
                    return res.status(400).json({
                        status: 'error',
                        message: `Número de grupo inválido: ${grupo.numero}. Debe ser un número positivo.`
                    });
                }
            }

            const gruposCreados = await this.createGruposUseCase.execute({
                num_cuatri,
                grupos: grupos.map(grupo => ({
                    numero: grupo.numero,
                    profesorId: grupo.profesorId
                }))
            });

            return res.status(201).json({
                status: 'success',
                message: `${gruposCreados.length} grupos procesados`,
                data: gruposCreados
            });

        } catch (error) {
            console.error('Error en GruposController.createGrupos:', error);
            return res.status(500).json({
                status: 'error',
                message: error.message || 'Error interno del servidor'
            });
        }
    }

    async updateGrupo(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validaciones
            if (updateData.grado && (typeof updateData.grado !== 'number' || updateData.grado < 1)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'El grado debe ser un número positivo'
                });
            }

            if (updateData.cohorte_id && !/^[0-9]{3}$/.test(updateData.cohorte_id)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'El cohorte_id debe ser un número de 3 dígitos'
                });
            }

            const grupoActualizado = await this.createGruposUseCase.updateGrupo(id, updateData);

            return res.status(200).json({
                status: 'success',
                data: grupoActualizado
            });

        } catch (error) {
            console.error('Error en GruposController.updateGrupo:', error);
            
            if (error.message.includes('No se encontró el grupo')) {
                return res.status(404).json({
                    status: 'error',
                    message: error.message
                });
            }

            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = GruposController;

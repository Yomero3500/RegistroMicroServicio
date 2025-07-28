const ListMateriasUseCase = require('../../application/usecases/ListMateriasUseCase');

class ListMateriasController {
    constructor() {
        const database = require('../config/database');
        this.sequelize = database.getSequelize();
        this.listMateriasUseCase = new ListMateriasUseCase(this.sequelize);
    }

    async execute(req, res) {
        try {
            const materias = await this.listMateriasUseCase.execute();

            if (!materias || materias.length === 0) {
                return res.status(200).json({
                    status: 'success',
                    message: 'No hay materias registradas',
                    data: []
                });
            }

            return res.status(200).json({
                status: 'success',
                message: `${materias.length} materias encontradas`,
                data: materias
            });

        } catch (error) {
            console.error('Error en ListMateriasController:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = ListMateriasController;

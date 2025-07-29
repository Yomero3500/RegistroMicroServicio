const { sequelize } = require('../../config/database');
const AsignaturaModel = require('./models/registration/AsignaturaModel');

class AsignaturaRepository {
    constructor() {
        // Inicializar el modelo si no está ya inicializado
        this.Asignatura = AsignaturaModel.init(sequelize);
    }

    async findByIds(ids) {
        try {
            const asignaturas = await this.Asignatura.findAll({
                where: {
                    id: ids
                }
            });
            return asignaturas;
        } catch (error) {
            throw new Error('Error al buscar las asignaturas: ' + error.message);
        }
    }
}

module.exports = AsignaturaRepository;

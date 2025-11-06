const CreateBulkInscripcionUseCase = require('../../../application/usecases/CreateBulkInscripcionUseCase');
const database = require('../../config/database');

class InscripcionController {
    async getInscripciones(req, res, next) {
        try {
            const { sequelize } = require('../../config/database');
            const { Inscripcion } = sequelize.models;

            if (!Inscripcion) {
                return res.status(500).json({
                    success: false,
                    message: 'Modelo Inscripcion no inicializado',
                    timestamp: new Date().toISOString()
                });
            }

            const {
                grupo_id,
                tutor_usuario_id,
                estudiante_id,
                estado,
                limit,
                offset
            } = req.query;

            const where = {};
            if (grupo_id) {
                const gid = parseInt(grupo_id);
                if (!Number.isNaN(gid)) where.grupo_id = gid;
            }
            if (tutor_usuario_id) where.tutor_usuario_id = tutor_usuario_id;
            if (estudiante_id) where.estudiante_id = estudiante_id;
            if (estado) where.estado = estado;

            const query = {
                where,
                order: [['id', 'DESC']]
            };
            const lmt = parseInt(limit);
            const off = parseInt(offset);
            if (!Number.isNaN(lmt) && lmt > 0) query.limit = lmt;
            if (!Number.isNaN(off) && off >= 0) query.offset = off;

            const rows = await Inscripcion.findAll(query);
            const data = rows.map(r => r.get({ plain: true }));

            return res.status(200).json({
                success: true,
                data,
                count: data.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('💥 InscripcionController: Error al listar inscripciones:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor al listar inscripciones',
                timestamp: new Date().toISOString()
            });
        }
    }

    async createBulkInscripcion(req, res, next) {
        try {
            const { tutor_id, grupo_id } = req.body;
            const csvFile = req.file;
            console.log('Body de la solicitud:', req.body);
            console.log('Archivo CSV:', csvFile);

            const { sequelize } = require('../../config/database');

            if (!tutor_id || !grupo_id || !csvFile) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requieren tutor_id, grupo_id y un archivo CSV'
                });
            }

            // Leer el contenido del archivo CSV
            const csvContent = csvFile.buffer.toString();
            
            const useCase = new CreateBulkInscripcionUseCase(sequelize);
            const result = await useCase.execute(
                tutor_id,
                grupo_id,
                csvContent
            );

            res.status(200).json(result);
        } catch (error) {
            console.error('Error al procesar inscripciones:', error);
            next(error);
        }
    }
}

module.exports = InscripcionController;

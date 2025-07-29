const CreateBulkInscripcionUseCase = require('../../../application/usecases/CreateBulkInscripcionUseCase');
const database = require('../../config/database');

class InscripcionController {
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

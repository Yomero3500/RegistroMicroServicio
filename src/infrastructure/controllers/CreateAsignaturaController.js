const CreateAsignaturaUseCase = require('../../application/usecases/CreateAsignaturaUseCase');

class CreateAsignaturaController {
    constructor() {
        const database = require('../../infrastructure/config/database');
        this.sequelize = database.getSequelize();
        this.createAsignaturaUseCase = new CreateAsignaturaUseCase(this.sequelize);
    }

    async execute(req, res) {
        try {
            const { nombre, num_cuatri } = req.body;

            // Validaciones básicas
            if (!nombre || !num_cuatri) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Los campos nombre y num_cuatri son requeridos'
                });
            }

            if (typeof num_cuatri !== 'number' || num_cuatri < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'num_cuatri debe ser un número positivo'
                });
            }

            // Crear la asignatura
            const asignatura = await this.createAsignaturaUseCase.execute({
                nombre,
                num_cuatri
            });

            // Responder con la asignatura creada
            return res.status(201).json({
                status: 'success',
                data: {
                    id: asignatura.id,
                    nombre: asignatura.nombre,
                    num_cuatri: asignatura.num_cuatri,
                    created_at: asignatura.created_at,
                    updated_at: asignatura.updated_at
                }
            });

        } catch (error) {
            console.error('Error en CreateAsignaturaController:', error);
            
            // Si es un error de validación de Sequelize
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Error de validación',
                    errors: error.errors.map(e => e.message)
                });
            }

            // Para cualquier otro error
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = CreateAsignaturaController;

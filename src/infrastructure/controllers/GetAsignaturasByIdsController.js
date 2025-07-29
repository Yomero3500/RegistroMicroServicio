class GetAsignaturasByIdsController {
    constructor(getAsignaturasByIdsUseCase) {
        this.getAsignaturasByIdsUseCase = getAsignaturasByIdsUseCase;
    }

    async execute(req, res) {
        try {
            const { asignaturaIds } = req.body;

            // Validar que se recibió un array de IDs
            if (!Array.isArray(asignaturaIds)) {
                return res.status(400).json({
                    message: 'Se requiere un array de IDs de asignaturas'
                });
            }

            // Validar que el array no esté vacío
            if (asignaturaIds.length === 0) {
                return res.status(400).json({
                    message: 'El array de IDs no puede estar vacío'
                });
            }

            // Obtener las asignaturas
            const asignaturas = await this.getAsignaturasByIdsUseCase.execute(asignaturaIds);

            // Verificar si se encontraron asignaturas
            if (asignaturas.length === 0) {
                return res.status(404).json({
                    message: 'No se encontraron asignaturas con los IDs proporcionados'
                });
            }

            return res.status(200).json({
                message: 'Asignaturas encontradas exitosamente',
                data: asignaturas
            });

        } catch (error) {
            console.error('Error al obtener asignaturas:', error);
            return res.status(500).json({
                message: 'Error interno del servidor al obtener las asignaturas'
            });
        }
    }
}

module.exports = GetAsignaturasByIdsController;

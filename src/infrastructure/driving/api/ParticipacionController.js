class ParticipacionController {
  constructor(createParticipacionUseCase) {
    this.createParticipacionUseCase = createParticipacionUseCase;
  }

  async create(req, res, next) {
    try {
      const data = req.body;

      const participacion = data || null; 


        if (!participacion.id_estudiante || isNaN(Number(participacion.id_estudiante))) {
          return res.status(400).json({
            success: false,
            message: 'El id_estudiante es obligatorio y debe ser un número válido.'
          });
        }

        if (!participacion.id_encuesta || isNaN(Number(participacion.id_encuesta))) {
          return res.status(400).json({
            success: false,
            message: 'El id_encuesta es obligatorio y debe ser un número válido.'
          });
        }

        if (participacion.estatus) {
          const estatusValidos = ['pendiente', 'completada', 'incompleta'];
          if (!estatusValidos.includes(participacion.estatus)) {
            return res.status(400).json({
              success: false,
              message: `El estatus debe ser uno de: ${estatusValidos.join(', ')}`
            });
          }
        }

      const result = await this.createParticipacionUseCase.execute(data);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('💥 ParticipacionController: Error al crear participación:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error interno del servidor al crear la participación'
      });
    }
  }
}

module.exports = ParticipacionController;
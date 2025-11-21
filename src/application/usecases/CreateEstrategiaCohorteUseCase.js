class CreateEstrategiaCohorteUseCase {
  constructor(estrategiaCohorteRepository) {
    this.estrategiaCohorteRepository = estrategiaCohorteRepository;
  }

  async execute(data) {
    try {
      // Validaciones
      if (!data.cohorte_id) {
        throw new Error('El ID del cohorte es requerido');
      }

      if (!data.id_usuario_creador) {
        throw new Error('El ID del usuario creador es requerido');
      }

      // Crear estrategia
      const estrategia = await this.estrategiaCohorteRepository.create({
        cohorte_id: data.cohorte_id,
        fecha_estrategia: data.fecha_estrategia || new Date(),
        periodo_aplicacion: data.periodo_aplicacion,
        estatus_seguimiento: data.estatus_seguimiento || 'pendiente',
        descripcion: data.descripcion,
        id_usuario_creador: data.id_usuario_creador,
        activa: true
      });

      return {
        success: true,
        data: estrategia,
        message: 'Estrategia creada exitosamente'
      };
    } catch (error) {
      console.error('❌ CreateEstrategiaCohorteUseCase: Error:', error);
      throw error;
    }
  }
}

module.exports = CreateEstrategiaCohorteUseCase;
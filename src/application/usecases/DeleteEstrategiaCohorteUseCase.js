class DeleteEstrategiaCohorteUseCase {
  constructor(estrategiaCohorteRepository) {
    this.estrategiaCohorteRepository = estrategiaCohorteRepository;
  }

  async execute(id) {
    try {
      console.log(`🗑️ DeleteEstrategiaCohorteUseCase: Eliminando estrategia ${id}`);

      // Validar ID
      if (!id) {
        throw new Error('El ID de la estrategia es requerido');
      }

      // Verificar que la estrategia existe antes de eliminar
      await this.estrategiaCohorteRepository.findById(id);

      // Eliminar estrategia
      await this.estrategiaCohorteRepository.delete(id);

      return {
        success: true,
        message: 'Estrategia eliminada exitosamente'
      };
    } catch (error) {
      console.error('❌ DeleteEstrategiaCohorteUseCase: Error:', error);
      throw error;
    }
  }
}

module.exports = DeleteEstrategiaCohorteUseCase;
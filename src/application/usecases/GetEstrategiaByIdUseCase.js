class GetEstrategiaByIdUseCase {
  constructor(estrategiaCohorteRepository) {
    this.estrategiaCohorteRepository = estrategiaCohorteRepository;
  }

  async execute(id) {
    try {
      console.log(`🔍 GetEstrategiaByIdUseCase: Buscando estrategia con ID: ${id}`);

      // Validar ID
      if (!id) {
        throw new Error('El ID de la estrategia es requerido');
      }

      const estrategia = await this.estrategiaCohorteRepository.findById(id);

      const estrategiaJson = estrategia.toJSON();
      
      // Agregar información formateada del cohorte
      if (estrategiaJson.cohorte) {
        estrategiaJson.cohorte_nombre = `Cohorte ${estrategiaJson.cohorte.anio_ingreso}-${estrategiaJson.cohorte.periodo_ingreso}`;
      }

      return {
        success: true,
        data: estrategiaJson,
        message: 'Estrategia encontrada exitosamente'
      };
    } catch (error) {
      console.error('❌ GetEstrategiaByIdUseCase: Error:', error);
      throw error;
    }
  }
}

module.exports = GetEstrategiaByIdUseCase;
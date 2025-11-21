class GetEstrategiasCohorteUseCase {
  constructor(estrategiaCohorteRepository) {
    this.estrategiaCohorteRepository = estrategiaCohorteRepository;
  }

  async execute(filters = {}) {
    try {
      console.log('🔍 GetEstrategiasCohorteUseCase: Obteniendo estrategias con filtros:', filters);

      const estrategias = await this.estrategiaCohorteRepository.findAll(filters);

      // Transformar datos para incluir información legible del cohorte
      const estrategiasTransformadas = estrategias.map(estrategia => {
        const estrategiaJson = estrategia.toJSON();
        
        // Agregar información formateada del cohorte
        if (estrategiaJson.cohorte) {
          estrategiaJson.cohorte_nombre = `Cohorte ${estrategiaJson.cohorte.anio_ingreso}-${estrategiaJson.cohorte.periodo_ingreso}`;
        }
        
        return estrategiaJson;
      });

      return {
        success: true,
        data: estrategiasTransformadas,
        total: estrategiasTransformadas.length,
        message: `Se encontraron ${estrategiasTransformadas.length} estrategia(s)`
      };
    } catch (error) {
      console.error('❌ GetEstrategiasCohorteUseCase: Error:', error);
      throw new Error(`Error al obtener estrategias: ${error.message}`);
    }
  }
}

module.exports = GetEstrategiasCohorteUseCase;
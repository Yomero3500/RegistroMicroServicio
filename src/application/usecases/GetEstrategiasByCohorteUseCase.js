// src/application/usecases/estrategia/GetEstrategiasByCohorteUseCase.js

class GetEstrategiasByCohorteUseCase {
  constructor(estrategiaCohorteRepository) {
    this.estrategiaCohorteRepository = estrategiaCohorteRepository;
  }

  async execute(cohorteId) {
    try {
      console.log(`🔍 GetEstrategiasByCohorteUseCase: Obteniendo estrategias para cohorte: ${cohorteId}`);

      // Validar cohorteId
      if (!cohorteId) {
        throw new Error('El ID del cohorte es requerido');
      }

      const estrategias = await this.estrategiaCohorteRepository.findByCohorteId(cohorteId);

      // Transformar datos
      const estrategiasTransformadas = estrategias.map(estrategia => {
        const estrategiaJson = estrategia.toJSON();
        
        if (estrategiaJson.cohorte) {
          estrategiaJson.cohorte_nombre = `Cohorte ${estrategiaJson.cohorte.anio_ingreso}-${estrategiaJson.cohorte.periodo_ingreso}`;
        }
        
        return estrategiaJson;
      });

      return {
        success: true,
        data: estrategiasTransformadas,
        total: estrategiasTransformadas.length,
        message: `Se encontraron ${estrategiasTransformadas.length} estrategia(s) para el cohorte ${cohorteId}`
      };
    } catch (error) {
      console.error('❌ GetEstrategiasByCohorteUseCase: Error:', error);
      throw new Error(`Error al obtener estrategias del cohorte: ${error.message}`);
    }
  }
}

module.exports = GetEstrategiasByCohorteUseCase;
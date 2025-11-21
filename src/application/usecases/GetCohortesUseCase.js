// src/application/usecases/estrategia/GetCohortesUseCase.js

class GetCohortesUseCase {
  constructor(estrategiaCohorteRepository) {
    this.estrategiaCohorteRepository = estrategiaCohorteRepository;
  }

  async execute() {
    try {
      console.log('🔍 GetCohortesUseCase: Obteniendo cohortes disponibles...');

      const cohortes = await this.estrategiaCohorteRepository.getAllCohortes();

      // Transformar datos para incluir información legible
      const cohortesTransformados = cohortes.map(cohorte => {
        const cohorteJson = cohorte.toJSON();
        
        // Agregar nombre formateado
        cohorteJson.nombre = `Cohorte ${cohorteJson.anio_ingreso}-${cohorteJson.periodo_ingreso}`;
        
        // Agregar descripción del periodo
        cohorteJson.periodo_nombre = cohorteJson.periodo_ingreso === 1 ? 'Enero' : 'Septiembre';
        
        return cohorteJson;
      });

      return {
        success: true,
        data: cohortesTransformados,
        total: cohortesTransformados.length,
        message: `Se encontraron ${cohortesTransformados.length} cohorte(s)`
      };
    } catch (error) {
      console.error('❌ GetCohortesUseCase: Error:', error);
      throw new Error(`Error al obtener cohortes: ${error.message}`);
    }
  }
}

module.exports = GetCohortesUseCase;
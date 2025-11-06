class GetDashboardCompletoUseCase {
  constructor(encuestaMetricasDinamicasRepository) {
    this.repository = encuestaMetricasDinamicasRepository;
  }

  async execute(idEncuesta) {
    try {
      if (!idEncuesta) {
        throw new Error('ID de encuesta es requerido');
      }

      const dashboard = await this.repository.getReporteConsolidado(idEncuesta);

      if (!dashboard) {
        throw new Error('No se encontraron datos para esta encuesta');
      }

      console.log('✅ Dashboard completo generado');
      return dashboard;

    } catch (error) {
      console.error('Error en GetDashboardCompletoUseCase:', error);
      throw error;
    }
  }
}

module.exports = GetDashboardCompletoUseCase; 
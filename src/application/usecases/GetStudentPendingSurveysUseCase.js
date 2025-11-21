
class GetStudentPendingSurveysUseCase {
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }


  async execute({ studentId }) {
    try {
      console.log(`📝 GetStudentPendingSurveysUseCase: Ejecutando para estudiante ID: ${studentId}`);
      this._validateInput({ studentId });
      const encuestasPendientes = await this.estudianteRepository.getStudentPendingSurveys(studentId);

      return {
        success: true,
        data: {
          encuestas: encuestasPendientes,
        }
      };

    } catch (error) {
      console.error('❌ GetStudentPendingSurveysUseCase: Error:', error.message);
      throw new Error(`Error al obtener encuestas pendientes: ${error.message}`);
    }
  }

  _validateInput({ studentId }) {
    if (!studentId) {
      throw new Error('El ID del estudiante es requerido');
    }

    if (typeof studentId !== 'number' && isNaN(parseInt(studentId))) {
      throw new Error('El ID del estudiante debe ser un número válido');
    }
  }


  async _validateStudent(studentId) {
    const estudiante = await this.estudianteRepository.findById(studentId);

    if (!estudiante) {
      throw new Error(`No se encontró el estudiante con ID: ${studentId}`);
    }

    return estudiante;
  }

  _enrichSurveyData(encuestas) {
    return encuestas.map(encuesta => ({
      ...encuesta,
      // Agregar badge de prioridad
      prioridad: this._calculatePriority(encuesta),
      // Agregar indicador de sistema
      es_obligatoria: encuesta.es_sistema || false,
      // Agregar tiempo estimado (1 min por pregunta)
      tiempo_estimado_minutos: encuesta.total_preguntas || 0,
      // Formatear tipo
      tipo_formateado: this._formatSurveyType(encuesta.tipo)
    }));
  }

  /**
   * Calcula la prioridad de una encuesta
   * @private
   */
  _calculatePriority(encuesta) {
    // Prioridad alta para encuestas del sistema
    if (encuesta.es_sistema) {
      return 'alta';
    }

    // Prioridad media para encuestas de estancia
    if (encuesta.tipo === 'estancia') {
      return 'media';
    }

    // Prioridad normal para el resto
    return 'normal';
  }

  /**
   * Formatea el tipo de encuesta
   * @private
   */
  _formatSurveyType(tipo) {
    const tipos = {
      'estancia': 'Estancia Empresarial',
      'seguimiento': 'Seguimiento Académico',
      'satisfaccion': 'Satisfacción',
      'otro': 'General'
    };

    return tipos[tipo] || 'Sin categoría';
  }

  /**
   * Calcula estadísticas sobre las encuestas
   * @private
   */
  _calculateStatistics(encuestas) {
    return {
      total: encuestas.length,
      por_tipo: this._groupByType(encuestas),
      obligatorias: encuestas.filter(e => e.es_obligatoria).length,
      opcionales: encuestas.filter(e => !e.es_obligatoria).length,
      tiempo_total_estimado: encuestas.reduce((acc, e) => acc + (e.tiempo_estimado_minutos || 0), 0),
      prioridad_alta: encuestas.filter(e => e.prioridad === 'alta').length,
      prioridad_media: encuestas.filter(e => e.prioridad === 'media').length,
      prioridad_normal: encuestas.filter(e => e.prioridad === 'normal').length
    };
  }

  /**
   * Agrupa encuestas por tipo
   * @private
   */
  _groupByType(encuestas) {
    const grouped = {};

    encuestas.forEach(encuesta => {
      const tipo = encuesta.tipo || 'otro';
      if (!grouped[tipo]) {
        grouped[tipo] = 0;
      }
      grouped[tipo]++;
    });

    return grouped;
  }
}

module.exports = GetStudentPendingSurveysUseCase;
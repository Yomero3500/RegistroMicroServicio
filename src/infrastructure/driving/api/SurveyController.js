class SurveyController {
  constructor(createSurveyUseCase, deleteSurveyUseCase, listAllSurveysUseCase, getCompleteStatsUseCase, getBasicStatsUseCase, getCohortCompleteDataUseCase, sendStudentEmailUseCase, encuestaMetricasDinamicasUseCase, getSurveysByTypeUseCase, getSurveysExcludingTypesUseCase) {
    this.createSurveyUseCase = createSurveyUseCase;
    this.deleteSurveyUseCase = deleteSurveyUseCase;
    this.listAllSurveysUseCase = listAllSurveysUseCase;
    this.getCompleteStatsUseCase = getCompleteStatsUseCase; 
    this.getBasicStatsUseCase = getBasicStatsUseCase; // Nuevo caso de uso
    this.getCohortCompleteDataUseCase = getCohortCompleteDataUseCase;
    this.sendStudentEmailUseCase = sendStudentEmailUseCase, 
    this.encuestaMetricasDinamicasUseCase = encuestaMetricasDinamicasUseCase
    this.getSurveysByTypeUseCase = getSurveysByTypeUseCase;
    this.getSurveysExcludingTypesUseCase = getSurveysExcludingTypesUseCase;
  }

  // 📌 Crear encuesta
  async createSurvey(req, res, next) {
    try {
      const { titulo, id_usuario, descripcion, fecha_creacion, fecha_inicio, fecha_fin, tipo } = req.body;

      if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'El título es obligatorio y debe ser un string válido.' });
      }
      if (!id_usuario || isNaN(Number(id_usuario))) {
        return res.status(400).json({ success: false, message: 'El id_usuario es obligatorio y debe ser un número válido.' });
      }
      if (descripcion && typeof descripcion !== 'string') {
        return res.status(400).json({ success: false, message: 'La descripción debe ser un string.' });
      }

      const fechaCreacionDate = fecha_creacion ? new Date(fecha_creacion) : undefined;
      const fechaInicioDate = fecha_inicio ? new Date(fecha_inicio) : undefined;
      const fechaFinDate = fecha_fin ? new Date(fecha_fin) : undefined;

      if (fechaInicioDate && fechaFinDate && fechaInicioDate > fechaFinDate) {
        return res.status(400).json({ success: false, message: 'La fecha de inicio no puede ser mayor que la fecha de fin.' });
      }

      const survey = await this.createSurveyUseCase.execute({
        titulo,
        id_usuario,
        descripcion,
        fecha_creacion: fechaCreacionDate,
        fecha_inicio: fechaInicioDate,
        fecha_fin: fechaFinDate, 
        tipo
      });

      return res.status(201).json({ success: true, message: 'Encuesta creada exitosamente', data: survey });
    } catch (error) {
      console.error('💥 SurveyController: Error en createSurvey:', error.message);
      return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor al crear la encuesta' });
    }
  }

  // 📋 Obtener todas las encuestas
  async getAllSurveys(req, res, next) {
    try {
      const result = await this.listAllSurveysUseCase.execute();
      return res.status(200).json({ success: true, message: 'Encuestas obtenidas correctamente', total: result.length, data: result });
    } catch (error) {
      console.error('💥 SurveyController: Error al obtener encuestas:', error.message);
      return res.status(500).json({ success: false, message: error.message || 'Error interno al obtener las encuestas' });
    }
  }

  async getSurveysByType(req, res, next) {
    try {
      const tipos = req.query.tipos ? req.query.tipos.split(',') : ['documento', 'seguimiento', 'final', 'empresa'];
      const result = await this.getSurveysByTypeUseCase.execute(tipos);

      return res.status(200).json({
        success: true,
        message: 'Encuestas filtradas por tipo obtenidas correctamente',
        total: result.length,
        data: result
      });
    } catch (error) {
      console.error('💥 SurveyController: Error al obtener encuestas por tipo:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error interno al obtener las encuestas por tipo'
      });
    }
  }

  /**
   * Obtiene encuestas excluyendo ciertos tipos
   * @route GET /api/surveys/excluding-types
   * @query tiposExcluir[] - Lista opcional de tipos a excluir
   */
  async getSurveysExcludingTypes(req, res, next) {
    try {
      const tiposExcluir = req.query.tiposExcluir ? req.query.tiposExcluir.split(',') : ['documento', 'seguimiento', 'final', 'empresa'];
      const result = await this.getSurveysExcludingTypesUseCase.execute(tiposExcluir);

      return res.status(200).json({
        success: true,
        message: 'Encuestas obtenidas excluyendo ciertos tipos correctamente',
        total: result.length,
        data: result
      });
    } catch (error) {
      console.error('💥 SurveyController: Error al obtener encuestas excluyendo tipos:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error interno al obtener las encuestas excluyendo tipos'
      });
    }
  }

  // ❌ Eliminar encuesta
  async deleteSurvey(req, res, next) {
    try {
      const { id } = req.params;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'Debe proporcionar un ID de encuesta válido' });
      }

      const result = await this.deleteSurveyUseCase.execute(Number(id));
      if (!result) {
        return res.status(404).json({ success: false, message: `No se encontró la encuesta con ID ${id}` });
      }

      return res.status(200).json({ success: true, message: `Encuesta con ID ${id} eliminada correctamente`, deleted: result });
    } catch (error) {
      console.error('💥 SurveyController: Error al eliminar encuesta:', error.message);
      return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor al eliminar la encuesta' });
    }
  }

  // 📊 Obtener estadísticas completas de una encuesta
  async getCompleteStats(req, res, next) {
    try {
      const { id } = req.params;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'Debe proporcionar un ID de encuesta válido' });
      }

      const stats = await this.getCompleteStatsUseCase.execute(Number(id));
      if (!stats) {
        return res.status(404).json({ success: false, message: `No se encontraron estadísticas para la encuesta con ID ${id}` });
      }

      return res.status(200).json({ success: true, message: 'Estadísticas obtenidas correctamente', data: stats });
    } catch (error) {
      console.error('💥 SurveyController: Error al obtener estadísticas:', error.message);
      return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor al obtener estadísticas' });
    }
  }

  // 📊 Obtener estadísticas básicas de una encuesta
  async getBasicStats(req, res, next) {
    try {
      const { id } = req.params;
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'Debe proporcionar un ID de encuesta válido' });
      }

      const stats = await this.getBasicStatsUseCase.execute(Number(id));
      if (!stats) {
        return res.status(404).json({ success: false, message: `No se encontraron estadísticas para la encuesta con ID ${id}` });
      }

      return res.status(200).json({ success: true, message: 'Estadísticas básicas obtenidas correctamente', data: stats });
    } catch (error) {
      console.error('💥 SurveyController: Error al obtener estadísticas básicas:', error.message);
      return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor al obtener estadísticas básicas' });
    }
  }

// SurveyController.js
// Método actualizado para getCohortCompleteData

async getCohortCompleteData(req, res, next) {
  try {
    const { year } = req.query;

    // Validar año si se proporciona
    if (year && (!/^\d{4}$/.test(year) || Number(year) < 2000 || Number(year) > new Date().getFullYear() + 1)) {
      return res.status(400).json({ 
        success: false, 
        message: 'El año debe ser un número válido de 4 dígitos entre 2000 y el próximo año.' 
      });
    }

    console.log('📊 Obteniendo datos de cohortes...');
    console.log('   Año filtrado:', year || 'Todos');

    // Ejecutar el caso de uso
    const rawData = await this.getCohortCompleteDataUseCase.execute(year || null);

    if (!rawData) {
      return res.status(404).json({ 
        success: false, 
        message: 'No se encontraron datos de cohortes.' 
      });
    }

    console.log('✅ Datos obtenidos exitosamente');
    console.log('   Estudiantes:', rawData.students?.length || 0);
    console.log('   Cohortes:', rawData.cohorts?.length || 0);
    console.log('   Timeline:', rawData.timeline?.length || 0);

    // Transformar la respuesta al formato esperado por el frontend
    const responseData = {
      students: rawData.students || [],
      statusDistribution: {
        regular: rawData.statusDistribution?.regular || 0,
        irregular: rawData.statusDistribution?.irregular || 0
      },
      tableData: rawData.tableData || [], 
      graduationRequirements: rawData.graduationRequirements || [], 
      graduationWithOutRequirements: rawData.graduationWithOutRequirements || [], 
      timeline: rawData.timeline || [],
      cohortComparison: rawData.cohortComparison || [],
      graduationMetrics: {
        estudiantes_activos: rawData.graduationMetrics?.estudiantes_activos || 0,
        estudiantes_con_cuatrimestres_completos: rawData.graduationMetrics?.estudiantes_con_cuatrimestres_completos || 0,
        promedio_grupos: rawData.graduationMetrics?.promedio_grupos || 0,
        estudiantes_egresados: rawData.graduationMetrics?.estudiantes_egresados || 0,
        estudiantes_proximo_egreso: rawData.graduationMetrics?.estudiantes_proximo_egreso || 0,
        porcentaje_avance_promedio: rawData.graduationMetrics?.porcentaje_avance_promedio || 0
      },
      cohorts: rawData.cohorts || []
    };

    return res.status(200).json({ 
      success: true, 
      message: 'Datos de cohortes obtenidos correctamente', 
      data: responseData
    });

  } catch (error) {
    console.error('💥 SurveyController: Error al obtener datos de cohortes:', error.message);
    console.error('   Stack:', error.stack);
    
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error interno del servidor al obtener datos de cohortes',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

async sendStudentEmailUse(req, res, next) {
  try {
    const { studentEmail, studentName, surveyName } = req.body;

    if (!studentEmail || !studentName || !surveyName) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios: studentEmail, studentName o surveyName.",
      });
    }

    const response = await this.sendStudentEmailUseCase.execute(studentEmail,studentName,  surveyName);

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "No se pudo enviar el correo al estudiante.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Correo enviado correctamente a ${studentName} (${studentEmail}) para la encuesta "${surveyName}".`,
      data: response,
    });

  } catch (error) {
    console.error("💥 SurveyController: Error al enviar correo a estudiante:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Error interno del servidor al enviar el correo.",
    });
  }
}

async getDashboardCompleto(req, res) {
    try {
      const { id } = req.params;

      console.log('📊 EncuestaMetricasController: getDashboardCompleto');
      console.log('   ID Encuesta:', id);

      // Ejecutar caso de uso
      const dashboard = await this.encuestaMetricasDinamicasUseCase.execute(id);

      return res.status(200).json({
        success: true,
        message: 'Dashboard obtenido correctamente',
        data: dashboard
      });

    } catch (error) {
      console.error('💥 Error en getDashboardCompleto:', error);

      if (error.message === 'No se encontraron datos para esta encuesta') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error al obtener dashboard',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

}

module.exports = SurveyController;

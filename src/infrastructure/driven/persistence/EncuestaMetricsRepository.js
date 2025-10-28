// src/infrastructure/driven/persistence/repositories/EncuestaMetricsRepository.js
const { Op, Sequelize } = require('sequelize');
const SurveyModel = require('./models/registration/EncuestaModel');
const QuestionModel = require('./models/registration/PreguntaModel');
const AnswerModel = require('./models/registration/RespuestaModel');
const ParticipationModel = require('./models/registration/ParticipacionModel');
const InscripcionModel = require('./models/registration/InscripcionModel');
const EstudianteModel = require('./models/registration/EstudianteModel');
const GrupoModel = require('./models/registration/GrupoModel');
const CohorteModel = require('./models/registration/CohorteModel');
const { sequelize } = require('../../config/database');

class EncuestaMetricsRepository {
  constructor() {
    const Encuesta = SurveyModel.init(sequelize);
    const Pregunta = QuestionModel.init(sequelize);
    const Respuesta = AnswerModel.init(sequelize);
    const Participacion = ParticipationModel.init(sequelize);
    const Estudiante = EstudianteModel.init(sequelize);
    const Inscripcion = InscripcionModel.init(sequelize);
    const Grupo = GrupoModel.init(sequelize);
    const Cohorte = CohorteModel.init(sequelize);
    
    const models = {
      Encuesta,
      Pregunta,
      Respuesta,
      Participacion, 
      Estudiante,
      Inscripcion,
      Grupo,
      Cohorte
    };

    SurveyModel.associate(models);
    QuestionModel.associate(models);
    AnswerModel.associate(models);
    ParticipationModel.associate(models);
    
    this.Encuesta = Encuesta;
    this.Pregunta = Pregunta;
    this.Respuesta = Respuesta;
    this.Participacion = Participacion;
    this.Estudiante = Estudiante;
    this.Inscripcion = Inscripcion;
    this.Grupo = Grupo;
    this.Cohorte = Cohorte;
  }

  identificarTipoEncuesta(encuesta) {
    if (!encuesta || !encuesta.titulo) return 'desconocido';

    const titulo = encuesta.titulo.toLowerCase();

    if (titulo.includes('documento')) return 'documentos';
    if (titulo.includes('seguimiento')) return 'seguimiento';
    if (titulo.includes('final')) return 'final';
    if (titulo.includes('empresa')) return 'evaluacion_empresa';
    if (titulo.includes('rezago')) return 'rezago';

    return 'desconocido';
  }

  /**
   * MÉTODO PRINCIPAL - Reporte Consolidado Mejorado
   */
  async getReporteConsolidado(idEncuesta) {
    try {
      const encuesta = await this.Encuesta.findByPk(idEncuesta);
      
      if (!encuesta) {
        return {
          error: true,
          mensaje: `No se encontró la encuesta con ID ${idEncuesta}`
        };
      }

      const tipoEncuesta = this.identificarTipoEncuesta(encuesta);
      
      // Obtener preguntas con respuestas
      const preguntas = await this.Pregunta.findAll({
        where: { id_encuesta: idEncuesta },
        include: [{
          model: this.Respuesta,
          as: 'respuestas',
          required: false
        }],
        order: [['id_pregunta', 'ASC']]
      });

      // Métricas básicas
      const metricasBasicas = await this.getMetricasBasicas(idEncuesta);

      // Análisis de preguntas con estadísticas
      const preguntasAnalizadas = await this.analizarPreguntas(preguntas);

      // Métricas específicas según tipo
      let metricasEspecificas = {};
      let insights = [];
      let recomendaciones = [];
      let graficas = [];

      switch (tipoEncuesta) {
        case 'documentos':
          metricasEspecificas = await this.analizarDocumentos(preguntas);
          insights = this.generarInsightsDocumentos(metricasEspecificas, metricasBasicas);
          recomendaciones = this.generarRecomendacionesDocumentos(metricasEspecificas, metricasBasicas);
          graficas = this.generarGraficasDocumentos(metricasEspecificas, preguntasAnalizadas);
          break;

        case 'seguimiento':
          metricasEspecificas = await this.analizarSeguimiento(preguntas);
          insights = this.generarInsightsSeguimiento(metricasEspecificas, metricasBasicas);
          recomendaciones = this.generarRecomendacionesSeguimiento(metricasEspecificas, metricasBasicas);
          graficas = this.generarGraficasSeguimiento(metricasEspecificas, preguntasAnalizadas);
          break;

        case 'final':
          metricasEspecificas = await this.analizarFinal(preguntas);
          insights = this.generarInsightsFinal(metricasEspecificas, metricasBasicas);
          recomendaciones = this.generarRecomendacionesFinal(metricasEspecificas, metricasBasicas);
          graficas = this.generarGraficasFinal(metricasEspecificas, preguntasAnalizadas);
          break;

        case 'evaluacion_empresa':
          metricasEspecificas = await this.analizarEvaluacionEmpresa(preguntas);
          insights = this.generarInsightsEmpresa(metricasEspecificas, metricasBasicas);
          recomendaciones = this.generarRecomendacionesEmpresa(metricasEspecificas, metricasBasicas);
          graficas = this.generarGraficasEmpresa(metricasEspecificas, preguntasAnalizadas);
          break;

        default:
          metricasEspecificas = await this.analizarGenerico(preguntas);
          insights = ['Análisis genérico realizado'];
          recomendaciones = [];
          graficas = this.generarGraficasGenericas(preguntasAnalizadas);
      }

      return {
        encuesta: {
          id: encuesta.id_encuesta,
          titulo: encuesta.titulo,
          descripcion: encuesta.descripcion,
          tipo: tipoEncuesta,
          fecha_inicio: encuesta.fecha_inicio,
          fecha_fin: encuesta.fecha_fin,
          fecha_creacion: encuesta.fecha_creacion
        },
        metricas_basicas: metricasBasicas,
        metricas_especificas: metricasEspecificas,
        preguntas: preguntasAnalizadas,
        graficas,
        insights,
        recomendaciones,
        calificacion_general: this.calcularCalificacionGeneral(metricasBasicas, metricasEspecificas),
        fecha_analisis: new Date()
      };

    } catch (error) {
      console.error('Error en getReporteConsolidado:', error);
      throw error;
    }
  }

  /**
   * Analiza todas las preguntas y sus respuestas
   */
  async analizarPreguntas(preguntas) {
    const preguntasAnalizadas = [];

    for (const pregunta of preguntas) {
      const totalRespuestas = pregunta.respuestas?.length || 0;
      
      // Contar frecuencia de cada respuesta
      const frecuenciaRespuestas = {};
      pregunta.respuestas?.forEach(r => {
        const texto = r.respuesta_texto;
        frecuenciaRespuestas[texto] = (frecuenciaRespuestas[texto] || 0) + 1;
      });

      // Convertir a array y ordenar
      const respuestasAgrupadas = Object.entries(frecuenciaRespuestas)
        .map(([opcion, total]) => ({
          opcion,
          total,
          porcentaje: totalRespuestas > 0 ? (total / totalRespuestas) * 100 : 0
        }))
        .sort((a, b) => b.total - a.total);

      // Análisis numérico si aplica
      const valoresNumericos = pregunta.respuestas
        ?.map(r => this.extraerNumero(r.respuesta_texto))
        .filter(n => n !== null) || [];

      const analisisNumerico = valoresNumericos.length > 0 ? {
        promedio: this.calcularPromedio(valoresNumericos),
        maximo: Math.max(...valoresNumericos),
        minimo: Math.min(...valoresNumericos),
        mediana: this.calcularMediana(valoresNumericos),
        desviacion_estandar: this.calcularDesviacionEstandar(valoresNumericos)
      } : null;

      preguntasAnalizadas.push({
        id_pregunta: pregunta.id_pregunta,
        pregunta: pregunta.title,
        tipo: pregunta.type,
        opciones: pregunta.options,
        obligatoria: pregunta.required,
        total_respuestas: totalRespuestas,
        respuestas: respuestasAgrupadas,
        analisis_numerico: analisisNumerico,
        categoria: this.clasificarPregunta(pregunta.title)
      });
    }

    return preguntasAnalizadas;
  }

  /**
   * Clasifica la pregunta según su contenido
   */
  clasificarPregunta(titulo) {
    const tituloLower = titulo.toLowerCase();
    
    if (tituloLower.includes('documento') || tituloLower.includes('entrega')) return 'documentacion';
    if (tituloLower.includes('avance') || tituloLower.includes('progreso')) return 'avance';
    if (tituloLower.includes('satisf') || tituloLower.includes('experiencia')) return 'satisfaccion';
    if (tituloLower.includes('califica') || tituloLower.includes('evalúa')) return 'evaluacion';
    if (tituloLower.includes('empleo') || tituloLower.includes('trabajo')) return 'empleabilidad';
    if (tituloLower.includes('competencia') || tituloLower.includes('habilidad')) return 'competencias';
    if (tituloLower.includes('recomienda')) return 'recomendacion';
    if (tituloLower.includes('asist') || tituloLower.includes('puntual')) return 'asistencia';
    if (tituloLower.includes('problema') || tituloLower.includes('dificultad')) return 'problemas';
    
    return 'general';
  }

  /**
   * Métricas básicas mejoradas
   */
  async getMetricasBasicas(idEncuesta) {
    const totalPreguntas = await this.Pregunta.count({
      where: { id_encuesta: idEncuesta }
    });

    const totalParticipaciones = await this.Participacion.count({
      where: { id_encuesta: idEncuesta }
    });

    const participacionesCompletadas = await this.Participacion.count({
      where: { 
        id_encuesta: idEncuesta,
        estatus: { [Op.in]: ['completado', 'completo', 'finalizado'] }
      }
    });

    const totalRespuestas = await this.Respuesta.count({
      include: [{
        model: this.Pregunta,
        as: 'pregunta',
        where: { id_encuesta: idEncuesta }
      }]
    });

    // Participantes únicos
    const participantesUnicos = await this.Participacion.count({
      where: { id_encuesta: idEncuesta },
      distinct: true,
      col: 'id_estudiante'
    });

    const tasaCompletacion = totalParticipaciones > 0 
      ? parseFloat(((participacionesCompletadas / totalParticipaciones) * 100).toFixed(2))
      : 0;

    const promedioRespuestasPorParticipacion = totalParticipaciones > 0
      ? parseFloat((totalRespuestas / totalParticipaciones).toFixed(2))
      : 0;

    const tasaRespuesta = totalPreguntas > 0 && totalParticipaciones > 0
      ? parseFloat(((totalRespuestas / (totalPreguntas * totalParticipaciones)) * 100).toFixed(2))
      : 0;

    return {
      total_preguntas: totalPreguntas,
      total_participaciones: totalParticipaciones,
      participantes_unicos: participantesUnicos,
      participaciones_completadas: participacionesCompletadas,
      participaciones_pendientes: totalParticipaciones - participacionesCompletadas,
      total_respuestas: totalRespuestas,
      tasa_completacion: tasaCompletacion,
      tasa_respuesta: tasaRespuesta,
      promedio_respuestas_por_participacion: promedioRespuestasPorParticipacion,
      preguntas_respondidas: totalRespuestas > 0 ? Math.min(totalPreguntas, Math.ceil(totalRespuestas / Math.max(1, participantesUnicos))) : 0
    };
  }

  /**
   * Análisis DOCUMENTOS mejorado
   */
  async analizarDocumentos(preguntas) {
    let documentosCompletos = 0;
    let documentosPendientes = 0;
    let totalEvaluaciones = 0;
    const documentosPorTipo = {};
    const estudiantesPorEstado = { completo: 0, incompleto: 0, parcial: 0 };

    for (const pregunta of preguntas) {
      if (!pregunta.respuestas || pregunta.respuestas.length === 0) continue;

      const titulo = pregunta.title.toLowerCase();
      if (titulo.includes('documento') || titulo.includes('entrega') || titulo.includes('completo')) {
        totalEvaluaciones++;
        
        const respuestasPositivas = pregunta.respuestas.filter(r => {
          const texto = r.respuesta_texto.toLowerCase();
          return texto.includes('sí') || texto.includes('si') || 
                 texto.includes('completo') || texto.includes('entregado');
        }).length;

        documentosCompletos += respuestasPositivas;
        documentosPendientes += (pregunta.respuestas.length - respuestasPositivas);

        // Clasificar por tipo de documento
        const tipoDoc = this.identificarTipoDocumento(titulo);
        if (!documentosPorTipo[tipoDoc]) {
          documentosPorTipo[tipoDoc] = { completos: 0, pendientes: 0 };
        }
        documentosPorTipo[tipoDoc].completos += respuestasPositivas;
        documentosPorTipo[tipoDoc].pendientes += (pregunta.respuestas.length - respuestasPositivas);
      }
    }

    const totalDocumentos = documentosCompletos + documentosPendientes;
    const porcentajeCompletitud = totalDocumentos > 0
      ? parseFloat(((documentosCompletos / totalDocumentos) * 100).toFixed(2))
      : 0;

    return {
      total_documentos_evaluados: totalDocumentos,
      documentos_completos: documentosCompletos,
      documentos_pendientes: documentosPendientes,
      porcentaje_completitud: porcentajeCompletitud,
      tasa_entrega: porcentajeCompletitud,
      total_preguntas_documentos: totalEvaluaciones,
      documentos_por_tipo: documentosPorTipo,
      promedio_documentos_por_estudiante: totalEvaluaciones > 0 
        ? parseFloat((documentosCompletos / totalEvaluaciones).toFixed(2))
        : 0
    };
  }

  identificarTipoDocumento(titulo) {
    if (titulo.includes('carta')) return 'Carta de presentación';
    if (titulo.includes('cv') || titulo.includes('currículum')) return 'CV';
    if (titulo.includes('seguro')) return 'Seguro';
    if (titulo.includes('formato')) return 'Formatos';
    if (titulo.includes('reporte')) return 'Reportes';
    return 'Otros documentos';
  }

  /**
   * Análisis SEGUIMIENTO mejorado
   */
  async analizarSeguimiento(preguntas) {
    const avances = [];
    const satisfacciones = [];
    const problemas = [];
    let totalAsistencias = 0;
    let asistenciasPositivas = 0;
    let horasCumplidas = 0;

    for (const pregunta of preguntas) {
      if (!pregunta.respuestas || pregunta.respuestas.length === 0) continue;

      const titulo = pregunta.title.toLowerCase();

      // Analizar avance
      if (titulo.includes('avance') || titulo.includes('progreso') || titulo.includes('%')) {
        pregunta.respuestas.forEach(r => {
          const numero = this.extraerNumero(r.respuesta_texto);
          if (numero !== null) avances.push(numero);
        });
      }

      // Analizar horas
      if (titulo.includes('hora')) {
        pregunta.respuestas.forEach(r => {
          const numero = this.extraerNumero(r.respuesta_texto);
          if (numero !== null) horasCumplidas += numero;
        });
      }

      // Analizar satisfacción
      if (titulo.includes('satisf') || titulo.includes('contento') || titulo.includes('experiencia')) {
        pregunta.respuestas.forEach(r => {
          const numero = this.extraerNumero(r.respuesta_texto);
          if (numero !== null) satisfacciones.push(numero);
        });
      }

      // Analizar problemas
      if (titulo.includes('problema') || titulo.includes('dificultad')) {
        pregunta.respuestas.forEach(r => {
          const texto = r.respuesta_texto.toLowerCase();
          if (texto.includes('sí') || texto.includes('si')) {
            problemas.push(r.respuesta_texto);
          }
        });
      }

      // Analizar asistencia
      if (titulo.includes('asist') || titulo.includes('puntual')) {
        totalAsistencias += pregunta.respuestas.length;
        asistenciasPositivas += pregunta.respuestas.filter(r => {
          const texto = r.respuesta_texto.toLowerCase();
          return texto.includes('sí') || texto.includes('si') || texto.includes('presente');
        }).length;
      }
    }

    const avancePromedio = this.calcularPromedio(avances);
    const satisfaccionPromedio = this.calcularPromedio(satisfacciones);
    const estudiantesEnRiesgo = avances.filter(a => a < 50).length;
    const tasaAsistencia = totalAsistencias > 0
      ? parseFloat(((asistenciasPositivas / totalAsistencias) * 100).toFixed(2))
      : 0;

    return {
      avance_promedio: parseFloat(avancePromedio.toFixed(2)),
      avance_maximo: avances.length > 0 ? Math.max(...avances) : 0,
      avance_minimo: avances.length > 0 ? Math.min(...avances) : 0,
      satisfaccion_promedio: parseFloat(satisfaccionPromedio.toFixed(2)),
      estudiantes_evaluados: avances.length,
      estudiantes_en_riesgo: estudiantesEnRiesgo,
      estudiantes_criticos: avances.filter(a => a < 30).length,
      porcentaje_riesgo: avances.length > 0
        ? parseFloat(((estudiantesEnRiesgo / avances.length) * 100).toFixed(2))
        : 0,
      total_evaluaciones_avance: avances.length,
      tasa_asistencia: tasaAsistencia,
      horas_cumplidas: horasCumplidas,
      horas_requeridas: 480,
      porcentaje_horas: parseFloat(((horasCumplidas / 480) * 100).toFixed(2)),
      total_problemas_reportados: problemas.length,
      distribucion_avance: {
        excelente: avances.filter(a => a >= 90).length,
        bueno: avances.filter(a => a >= 70 && a < 90).length,
        regular: avances.filter(a => a >= 50 && a < 70).length,
        riesgo: avances.filter(a => a < 50).length
      }
    };
  }

  /**
   * Análisis FINAL mejorado
   */
  async analizarFinal(preguntas) {
    const calificaciones = [];
    const competencias = [];
    let conEmpleo = 0;
    let sinEmpleo = 0;
    let recomendaria = 0;
    let noRecomendaria = 0;
    let completaron = 0;
    let noCompletaron = 0;

    for (const pregunta of preguntas) {
      if (!pregunta.respuestas || pregunta.respuestas.length === 0) continue;

      const titulo = pregunta.title.toLowerCase();

      // Analizar calificaciones
      if (titulo.includes('califica') || titulo.includes('evalúa') || titulo.includes('puntúa')) {
        pregunta.respuestas.forEach(r => {
          const numero = this.extraerNumero(r.respuesta_texto);
          if (numero !== null && numero >= 0 && numero <= 10) {
            calificaciones.push(numero);
          }
        });
      }

      // Analizar competencias
      if (titulo.includes('competencia') || titulo.includes('habilidad')) {
        pregunta.respuestas.forEach(r => {
          const numero = this.extraerNumero(r.respuesta_texto);
          if (numero !== null) competencias.push(numero);
        });
      }

      // Analizar completitud
      if (titulo.includes('complet') || titulo.includes('termin') || titulo.includes('finaliz')) {
        pregunta.respuestas.forEach(r => {
          const texto = r.respuesta_texto.toLowerCase();
          if (texto.includes('sí') || texto.includes('si')) {
            completaron++;
          } else {
            noCompletaron++;
          }
        });
      }

      // Analizar empleo
      if (titulo.includes('empleo') || titulo.includes('trabajo') || titulo.includes('contratado')) {
        pregunta.respuestas.forEach(r => {
          const texto = r.respuesta_texto.toLowerCase();
          if (texto.includes('sí') || texto.includes('si') || texto.includes('empleado')) {
            conEmpleo++;
          } else if (texto.includes('no') || texto.includes('desempleado')) {
            sinEmpleo++;
          }
        });
      }

      // Analizar recomendación
      if (titulo.includes('recomienda') || titulo.includes('recomendaría')) {
        pregunta.respuestas.forEach(r => {
          const texto = r.respuesta_texto.toLowerCase();
          if (texto.includes('sí') || texto.includes('si')) {
            recomendaria++;
          } else if (texto.includes('no')) {
            noRecomendaria++;
          }
        });
      }
    }

    const calificacionPromedio = this.calcularPromedio(calificaciones);
    const competenciasPromedio = this.calcularPromedio(competencias);
    const totalEgresados = conEmpleo + sinEmpleo;
    const tasaEmpleabilidad = totalEgresados > 0
      ? parseFloat(((conEmpleo / totalEgresados) * 100).toFixed(2))
      : 0;
    const totalRespuestasRecomendacion = recomendaria + noRecomendaria;
    const porcentajeRecomendacion = totalRespuestasRecomendacion > 0
      ? parseFloat(((recomendaria / totalRespuestasRecomendacion) * 100).toFixed(2))
      : 0;
    const totalCompletitud = completaron + noCompletaron;
    const porcentajeCompletitud = totalCompletitud > 0
      ? parseFloat(((completaron / totalCompletitud) * 100).toFixed(2))
      : 0;

    return {
      calificacion_promedio: parseFloat(calificacionPromedio.toFixed(2)),
      calificacion_maxima: calificaciones.length > 0 ? Math.max(...calificaciones) : 0,
      calificacion_minima: calificaciones.length > 0 ? Math.min(...calificaciones) : 0,
      total_calificaciones: calificaciones.length,
      competencias_promedio: parseFloat(competenciasPromedio.toFixed(2)),
      total_competencias_evaluadas: competencias.length,
      estancias_completadas: completaron,
      estancias_incompletas: noCompletaron,
      porcentaje_completitud: porcentajeCompletitud,
      con_empleo: conEmpleo,
      sin_empleo: sinEmpleo,
      total_egresados: totalEgresados,
      tasa_empleabilidad: tasaEmpleabilidad,
      recomendaria: recomendaria,
      no_recomendaria: noRecomendaria,
      porcentaje_recomendacion: porcentajeRecomendacion,
      nps_score: this.calcularNPS(recomendaria, noRecomendaria, totalRespuestasRecomendacion),
      distribucion_calificaciones: {
        excelente: calificaciones.filter(c => c >= 9).length,
        bueno: calificaciones.filter(c => c >= 7 && c < 9).length,
        regular: calificaciones.filter(c => c >= 6 && c < 7).length,
        bajo: calificaciones.filter(c => c < 6).length
      }
    };
  }

  calcularNPS(promotores, detractores, total) {
    if (total === 0) return 0;
    return parseFloat((((promotores - detractores) / total) * 100).toFixed(2));
  }

  /**
   * Análisis EVALUACIÓN EMPRESA mejorado
   */
  async analizarEvaluacionEmpresa(preguntas) {
    const evaluaciones = [];
    const competencias = {};
    const categorias = {
      tecnico: [],
      actitud: [],
      puntualidad: [],
      equipo: [],
      comunicacion: [],
      iniciativa: []
    };

    for (const pregunta of preguntas) {
      if (!pregunta.respuestas || pregunta.respuestas.length === 0) continue;

      const titulo = pregunta.title.toLowerCase();
      
      pregunta.respuestas.forEach(r => {
        const numero = this.extraerNumero(r.respuesta_texto);
        if (numero !== null && numero >= 0 && numero <= 10) {
          evaluaciones.push(numero);
          
          // Clasificar por categoría
          if (titulo.includes('técnico') || titulo.includes('conocimiento')) {
            categorias.tecnico.push(numero);
          } else if (titulo.includes('actitud') || titulo.includes('comportamiento')) {
            categorias.actitud.push(numero);
          } else if (titulo.includes('puntual')) {
            categorias.puntualidad.push(numero);
          } else if (titulo.includes('equipo')) {
            categorias.equipo.push(numero);
          } else if (titulo.includes('comunica')) {
            categorias.comunicacion.push(numero);
          } else if (titulo.includes('iniciativa')) {
            categorias.iniciativa.push(numero);
          }
          
          // Guardar por competencia
          if (!competencias[pregunta.title]) {
            competencias[pregunta.title] = [];
          }
          competencias[pregunta.title].push(numero);
        }
      });
    }

    const evaluacionPromedio = this.calcularPromedio(evaluaciones);
    
    // Top 3 y Bottom 3 competencias
    const competenciasOrdenadas = Object.entries(competencias)
      .map(([nombre, valores]) => ({
        nombre,
        promedio: this.calcularPromedio(valores),
        total_evaluaciones: valores.length
      }))
      .sort((a, b) => b.promedio - a.promedio);

    const top3 = competenciasOrdenadas.slice(0, 3);
    const bottom3 = competenciasOrdenadas.slice(-3).reverse();

    // Promedios por categoría
    const promediosCategorias = {};
    Object.entries(categorias).forEach(([cat, valores]) => {
      if (valores.length > 0) {
        promediosCategorias[cat] = parseFloat(this.calcularPromedio(valores).toFixed(2));
      }
    });

    return {
      evaluacion_promedio: parseFloat(evaluacionPromedio.toFixed(2)),
      evaluacion_maxima: evaluaciones.length > 0 ? Math.max(...evaluaciones) : 0,
      evaluacion_minima: evaluaciones.length > 0 ? Math.min(...evaluaciones) : 0,
      total_evaluaciones: evaluaciones.length,
      empresas_satisfechas: evaluaciones.filter(e => e >= 7).length,
      empresas_insatisfechas: evaluaciones.filter(e => e < 5).length,
      porcentaje_satisfaccion: evaluaciones.length > 0
        ? parseFloat(((evaluaciones.filter(e => e >= 7).length / evaluaciones.length) * 100).toFixed(2))
        : 0,
      top_3_competencias: top3,
      bottom_3_competencias: bottom3,
      total_competencias_evaluadas: Object.keys(competencias).length,
      promedios_por_categoria: promediosCategorias,
      distribucion_evaluaciones: {
        excelente: evaluaciones.filter(e => e >= 9).length,
        bueno: evaluaciones.filter(e => e >= 7 && e < 9).length,
        regular: evaluaciones.filter(e => e >= 5 && e < 7).length,
        deficiente: evaluaciones.filter(e => e < 5).length
      }
    };
  }

  /**
   * Análisis genérico mejorado
   */
  async analizarGenerico(preguntas) {
    const valores = [];
    const respuestasTexto = [];
    const preguntasPorCategoria = {};
    
    for (const pregunta of preguntas) {
      if (!pregunta.respuestas) continue;
      
      const categoria = this.clasificarPregunta(pregunta.title);
      if (!preguntasPorCategoria[categoria]) {
        preguntasPorCategoria[categoria] = { preguntas: 0, respuestas: 0 };
      }
      preguntasPorCategoria[categoria].preguntas++;
      preguntasPorCategoria[categoria].respuestas += pregunta.respuestas.length;
      
      pregunta.respuestas.forEach(r => {
        const numero = this.extraerNumero(r.respuesta_texto);
        if (numero !== null) {
          valores.push(numero);
        } else {
          respuestasTexto.push(r.respuesta_texto);
        }
      });
    }

    return {
      promedio_general: parseFloat(this.calcularPromedio(valores).toFixed(2)),
      total_valores: valores.length,
      total_respuestas_texto: respuestasTexto.length,
      valor_maximo: valores.length > 0 ? Math.max(...valores) : 0,
      valor_minimo: valores.length > 0 ? Math.min(...valores) : 0,
      mediana: valores.length > 0 ? this.calcularMediana(valores) : 0,
      desviacion_estandar: valores.length > 0 ? parseFloat(this.calcularDesviacionEstandar(valores).toFixed(2)) : 0,
      preguntas_por_categoria: preguntasPorCategoria
    };
  }

  // ==================== GENERADORES DE GRÁFICAS ====================

  generarGraficasDocumentos(metricas, preguntas) {
    const graficas = [];

    // Gráfica 1: Completitud general
    graficas.push({
      id: 'completitud_general',
      titulo: 'Estado General de Documentos',
      tipo: 'pie',
      datos: [
        { nombre: 'Completos', valor: metricas.documentos_completos },
        { nombre: 'Pendientes', valor: metricas.documentos_pendientes }
      ]
    });

    // Gráfica 2: Documentos por tipo
    if (metricas.documentos_por_tipo && Object.keys(metricas.documentos_por_tipo).length > 0) {
      const datosBarras = Object.entries(metricas.documentos_por_tipo).map(([tipo, datos]) => ({
        tipo,
        completos: datos.completos,
        pendientes: datos.pendientes
      }));

      graficas.push({
        id: 'documentos_por_tipo',
        titulo: 'Documentos por Tipo',
        tipo: 'bar',
        datos: datosBarras
      });
    }

    return graficas;
  }

  generarGraficasSeguimiento(metricas, preguntas) {
    const graficas = [];

    // Gráfica 1: Distribución de avance
    graficas.push({
      id: 'distribucion_avance',
      titulo: 'Distribución de Avance',
      tipo: 'bar',
      datos: [
        { rango: 'Excelente (90-100%)', cantidad: metricas.distribucion_avance.excelente },
        { rango: 'Bueno (70-89%)', cantidad: metricas.distribucion_avance.bueno },
        { rango: 'Regular (50-69%)', cantidad: metricas.distribucion_avance.regular },
        { rango: 'Riesgo (<50%)', cantidad: metricas.distribucion_avance.riesgo }
      ]
    });

    // Gráfica 2: Resumen de métricas
    graficas.push({
      id: 'metricas_seguimiento',
      titulo: 'Métricas Clave de Seguimiento',
      tipo: 'radar',
      datos: [
        { metrica: 'Avance Promedio', valor: metricas.avance_promedio },
        { metrica: 'Satisfacción', valor: metricas.satisfaccion_promedio * 10 },
        { metrica: 'Asistencia', valor: metricas.tasa_asistencia },
        { metrica: 'Horas Cumplidas', valor: metricas.porcentaje_horas }
      ]
    });

    return graficas;
  }

  generarGraficasFinal(metricas, preguntas) {
    const graficas = [];

    // Gráfica 1: Distribución de calificaciones
    graficas.push({
      id: 'distribucion_calificaciones',
      titulo: 'Distribución de Calificaciones',
      tipo: 'pie',
      datos: [
        { categoria: 'Excelente (9-10)', valor: metricas.distribucion_calificaciones.excelente },
        { categoria: 'Bueno (7-8)', valor: metricas.distribucion_calificaciones.bueno },
        { categoria: 'Regular (6)', valor: metricas.distribucion_calificaciones.regular },
        { categoria: 'Bajo (<6)', valor: metricas.distribucion_calificaciones.bajo }
      ]
    });

    // Gráfica 2: Empleabilidad
    if (metricas.total_egresados > 0) {
      graficas.push({
        id: 'empleabilidad',
        titulo: 'Estado de Empleabilidad',
        tipo: 'pie',
        datos: [
          { categoria: 'Con Empleo', valor: metricas.con_empleo },
          { categoria: 'Sin Empleo', valor: metricas.sin_empleo }
        ]
      });
    }

    // Gráfica 3: Recomendación
    if (metricas.recomendaria + metricas.no_recomendaria > 0) {
      graficas.push({
        id: 'recomendacion',
        titulo: 'Recomendarían la Institución',
        tipo: 'pie',
        datos: [
          { categoria: 'Sí', valor: metricas.recomendaria },
          { categoria: 'No', valor: metricas.no_recomendaria }
        ]
      });
    }

    return graficas;
  }

  generarGraficasEmpresa(metricas, preguntas) {
    const graficas = [];

    // Gráfica 1: Top 3 competencias
    if (metricas.top_3_competencias && metricas.top_3_competencias.length > 0) {
      graficas.push({
        id: 'top_competencias',
        titulo: 'Top 3 Competencias Mejor Evaluadas',
        tipo: 'bar',
        datos: metricas.top_3_competencias.map(c => ({
          competencia: c.nombre.substring(0, 30),
          promedio: c.promedio
        }))
      });
    }

    // Gráfica 2: Distribución de evaluaciones
    graficas.push({
      id: 'distribucion_evaluaciones',
      titulo: 'Distribución de Evaluaciones',
      tipo: 'pie',
      datos: [
        { nivel: 'Excelente', valor: metricas.distribucion_evaluaciones.excelente },
        { nivel: 'Bueno', valor: metricas.distribucion_evaluaciones.bueno },
        { nivel: 'Regular', valor: metricas.distribucion_evaluaciones.regular },
        { nivel: 'Deficiente', valor: metricas.distribucion_evaluaciones.deficiente }
      ]
    });

    // Gráfica 3: Promedios por categoría
    if (metricas.promedios_por_categoria && Object.keys(metricas.promedios_por_categoria).length > 0) {
      graficas.push({
        id: 'categorias_evaluacion',
        titulo: 'Evaluación por Categoría',
        tipo: 'radar',
        datos: Object.entries(metricas.promedios_por_categoria).map(([cat, prom]) => ({
          categoria: cat.charAt(0).toUpperCase() + cat.slice(1),
          promedio: prom
        }))
      });
    }

    return graficas;
  }

  generarGraficasGenericas(preguntas) {
    const graficas = [];

    // Gráfica de preguntas por categoría
    const categorias = {};
    preguntas.forEach(p => {
      categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
    });

    if (Object.keys(categorias).length > 0) {
      graficas.push({
        id: 'preguntas_por_categoria',
        titulo: 'Distribución de Preguntas por Categoría',
        tipo: 'pie',
        datos: Object.entries(categorias).map(([cat, total]) => ({
          categoria: cat,
          total
        }))
      });
    }

    return graficas;
  }

  // ==================== GENERADORES DE INSIGHTS MEJORADOS ====================

  generarInsightsDocumentos(metricas, metricasBasicas) {
    const insights = [];
    
    if (parseFloat(metricas.porcentaje_completitud) >= 90) {
      insights.push(`✅ Excelente completitud de documentos (${metricas.porcentaje_completitud}%)`);
    } else if (parseFloat(metricas.porcentaje_completitud) < 70) {
      insights.push(`⚠️ Baja completitud de documentos (${metricas.porcentaje_completitud}%)`);
    }
    
    if (metricas.documentos_pendientes > 0) {
      insights.push(`📄 ${metricas.documentos_pendientes} documentos pendientes de entrega`);
    }

    if (metricasBasicas.tasa_completacion >= 80) {
      insights.push(`👥 Alta tasa de participación (${metricasBasicas.tasa_completacion}%)`);
    }

    if (metricas.promedio_documentos_por_estudiante >= 0.8) {
      insights.push(`📊 Promedio de ${metricas.promedio_documentos_por_estudiante} documentos por estudiante`);
    }

    return insights;
  }

  generarInsightsSeguimiento(metricas, metricasBasicas) {
    const insights = [];
    
    if (metricas.avance_promedio >= 80) {
      insights.push(`📈 Excelente avance promedio (${metricas.avance_promedio}%)`);
    } else if (metricas.avance_promedio < 60) {
      insights.push(`⚠️ Avance promedio bajo (${metricas.avance_promedio}%)`);
    }
    
    if (metricas.estudiantes_en_riesgo > 0) {
      insights.push(`🚨 ${metricas.estudiantes_en_riesgo} estudiantes en riesgo académico (${metricas.porcentaje_riesgo}%)`);
    }

    if (metricas.estudiantes_criticos > 0) {
      insights.push(`⛔ ${metricas.estudiantes_criticos} estudiantes en situación crítica (<30% avance)`);
    }
    
    if (metricas.satisfaccion_promedio >= 8) {
      insights.push(`😊 Alta satisfacción (${metricas.satisfaccion_promedio}/10)`);
    } else if (metricas.satisfaccion_promedio < 6) {
      insights.push(`😟 Satisfacción baja (${metricas.satisfaccion_promedio}/10)`);
    }

    if (metricas.tasa_asistencia >= 90) {
      insights.push(`✅ Excelente asistencia (${metricas.tasa_asistencia}%)`);
    }

    if (metricas.porcentaje_horas >= 80) {
      insights.push(`⏱️ Buen cumplimiento de horas (${metricas.horas_cumplidas}/${metricas.horas_requeridas})`);
    }

    return insights;
  }

  generarInsightsFinal(metricas, metricasBasicas) {
    const insights = [];
    
    if (parseFloat(metricas.tasa_empleabilidad) >= 70) {
      insights.push(`💼 Excelente tasa de empleabilidad (${metricas.tasa_empleabilidad}%)`);
    } else if (parseFloat(metricas.tasa_empleabilidad) < 50) {
      insights.push(`⚠️ Tasa de empleabilidad baja (${metricas.tasa_empleabilidad}%)`);
    }
    
    if (metricas.calificacion_promedio >= 8) {
      insights.push(`⭐ Alta calificación promedio (${metricas.calificacion_promedio}/10)`);
    } else if (metricas.calificacion_promedio < 6) {
      insights.push(`⚠️ Calificación promedio baja (${metricas.calificacion_promedio}/10)`);
    }
    
    if (parseFloat(metricas.porcentaje_recomendacion) >= 80) {
      insights.push(`👍 ${metricas.porcentaje_recomendacion}% recomendaría la institución`);
    }

    if (metricas.nps_score > 50) {
      insights.push(`📊 NPS Score positivo: ${metricas.nps_score}`);
    }

    if (parseFloat(metricas.porcentaje_completitud) >= 90) {
      insights.push(`✅ ${metricas.porcentaje_completitud}% completó su estancia exitosamente`);
    }

    if (metricas.competencias_promedio >= 8) {
      insights.push(`🎯 Alto nivel de competencias adquiridas (${metricas.competencias_promedio}/10)`);
    }

    return insights;
  }

  generarInsightsEmpresa(metricas, metricasBasicas) {
    const insights = [];
    
    if (metricas.evaluacion_promedio >= 8) {
      insights.push(`⭐ Excelente evaluación empresarial (${metricas.evaluacion_promedio}/10)`);
    } else if (metricas.evaluacion_promedio < 6) {
      insights.push(`⚠️ Evaluación empresarial baja (${metricas.evaluacion_promedio}/10)`);
    }
    
    if (metricas.top_3_competencias && metricas.top_3_competencias.length > 0) {
      const top = metricas.top_3_competencias[0];
      insights.push(`🏆 Mejor competencia: ${top.nombre} (${top.promedio}/10)`);
    }

    if (metricas.bottom_3_competencias && metricas.bottom_3_competencias.length > 0) {
      const bottom = metricas.bottom_3_competencias[0];
      insights.push(`📉 Área de mejora: ${bottom.nombre} (${bottom.promedio}/10)`);
    }

    if (parseFloat(metricas.porcentaje_satisfaccion) >= 80) {
      insights.push(`👍 ${metricas.porcentaje_satisfaccion}% de empresas satisfechas`);
    }

    if (metricas.empresas_insatisfechas > 0) {
      insights.push(`⚠️ ${metricas.empresas_insatisfechas} empresas con evaluaciones bajas`);
    }

    return insights;
  }

  // ==================== GENERADORES DE RECOMENDACIONES MEJORADOS ====================

  generarRecomendacionesDocumentos(metricas, metricasBasicas) {
    const recomendaciones = [];
    
    if (metricas.documentos_pendientes > 10) {
      recomendaciones.push({
        area: 'Documentación',
        prioridad: 'ALTA',
        accion: 'Implementar sistema de seguimiento automatizado para documentos pendientes',
        beneficiarios: metricas.documentos_pendientes,
        impacto: 'Mejorar completitud documental'
      });
    }

    if (parseFloat(metricas.porcentaje_completitud) < 70) {
      recomendaciones.push({
        area: 'Documentación',
        prioridad: 'URGENTE',
        accion: 'Realizar campaña de concientización sobre importancia de documentación completa',
        beneficiarios: 'Todos los estudiantes',
        impacto: 'Aumentar tasa de completitud'
      });
    }

    if (metricasBasicas.tasa_completacion < 60) {
      recomendaciones.push({
        area: 'Participación',
        prioridad: 'MEDIA',
        accion: 'Enviar recordatorios periódicos a estudiantes sin completar',
        beneficiarios: metricasBasicas.participaciones_pendientes,
        impacto: 'Aumentar participación'
      });
    }

    return recomendaciones;
  }

  generarRecomendacionesSeguimiento(metricas, metricasBasicas) {
    const recomendaciones = [];
    
    if (metricas.estudiantes_en_riesgo > 0) {
      recomendaciones.push({
        area: 'Académica',
        prioridad: 'URGENTE',
        accion: 'Implementar programa de tutorías y seguimiento personalizado',
        beneficiarios: metricas.estudiantes_en_riesgo,
        impacto: 'Reducir riesgo de abandono'
      });
    }

    if (metricas.estudiantes_criticos > 0) {
      recomendaciones.push({
        area: 'Académica',
        prioridad: 'URGENTE',
        accion: 'Intervención inmediata con plan de recuperación',
        beneficiarios: metricas.estudiantes_criticos,
        impacto: 'Evitar deserción'
      });
    }

    if (metricas.satisfaccion_promedio < 6) {
      recomendaciones.push({
        area: 'Mejora Continua',
        prioridad: 'ALTA',
        accion: 'Realizar grupos focales para identificar puntos de mejora',
        beneficiarios: 'Todos los estudiantes',
        impacto: 'Mejorar experiencia estudiantil'
      });
    }

    if (metricas.tasa_asistencia < 80) {
      recomendaciones.push({
        area: 'Asistencia',
        prioridad: 'MEDIA',
        accion: 'Investigar causas de ausentismo e implementar medidas',
        beneficiarios: 'Estudiantes con baja asistencia',
        impacto: 'Aumentar asistencia'
      });
    }

    if (metricas.porcentaje_horas < 60) {
      recomendaciones.push({
        area: 'Horas Prácticas',
        prioridad: 'ALTA',
        accion: 'Revisar y ajustar plan de actividades para cumplir horas requeridas',
        beneficiarios: 'Todos los estudiantes',
        impacto: 'Cumplir requisitos de titulación'
      });
    }

    return recomendaciones;
  }

  generarRecomendacionesFinal(metricas, metricasBasicas) {
    const recomendaciones = [];
    
    if (parseFloat(metricas.tasa_empleabilidad) < 60) {
      recomendaciones.push({
        area: 'Vinculación',
        prioridad: 'ALTA',
        accion: 'Fortalecer bolsa de trabajo y convenios con empresas',
        beneficiarios: metricas.sin_empleo,
        impacto: 'Aumentar empleabilidad'
      });
    }

    if (metricas.calificacion_promedio < 7) {
      recomendaciones.push({
        area: 'Calidad Académica',
        prioridad: 'ALTA',
        accion: 'Revisar y mejorar programas de estancia profesional',
        beneficiarios: 'Próximas generaciones',
        impacto: 'Mejorar satisfacción general'
      });
    }

    if (parseFloat(metricas.porcentaje_recomendacion) < 70) {
      recomendaciones.push({
        area: 'Reputación',
        prioridad: 'MEDIA',
        accion: 'Implementar plan de mejora basado en retroalimentación',
        beneficiarios: 'Comunidad educativa',
        impacto: 'Aumentar recomendación'
      });
    }

    if (metricas.competencias_promedio < 7) {
      recomendaciones.push({
        area: 'Desarrollo de Competencias',
        prioridad: 'ALTA',
        accion: 'Reforzar talleres y capacitación en competencias clave',
        beneficiarios: 'Todos los estudiantes',
        impacto: 'Mejorar preparación laboral'
      });
    }

    return recomendaciones;
  }

  generarRecomendacionesEmpresa(metricas, metricasBasicas) {
    const recomendaciones = [];
    
    if (metricas.evaluacion_promedio < 7) {
      recomendaciones.push({
        area: 'Desarrollo Profesional',
        prioridad: 'ALTA',
        accion: 'Implementar programa de preparación pre-estancia',
        beneficiarios: 'Todos los estudiantes',
        impacto: 'Mejorar evaluaciones empresariales'
      });
    }

    if (metricas.empresas_insatisfechas > 0) {
      recomendaciones.push({
        area: 'Relaciones Empresariales',
        prioridad: 'URGENTE',
        accion: 'Contactar empresas insatisfechas para plan de mejora',
        beneficiarios: metricas.empresas_insatisfechas,
        impacto: 'Mantener convenios vigentes'
      });
    }

    if (metricas.bottom_3_competencias && metricas.bottom_3_competencias.length > 0) {
      const competenciasMejora = metricas.bottom_3_competencias.map(c => c.nombre).join(', ');
      recomendaciones.push({
        area: 'Capacitación',
        prioridad: 'MEDIA',
        accion: `Diseñar talleres para reforzar: ${competenciasMejora}`,
        beneficiarios: 'Estudiantes en estancia',
        impacto: 'Mejorar competencias débiles'
      });
    }

    if (parseFloat(metricas.porcentaje_satisfaccion) < 70) {
      recomendaciones.push({
        area: 'Calidad',
        prioridad: 'ALTA',
        accion: 'Revisar proceso de selección y preparación de estudiantes',
        beneficiarios: 'Programa completo',
        impacto: 'Aumentar satisfacción empresarial'
      });
    }

    return recomendaciones;
  }

  // ==================== MÉTODOS AUXILIARES ====================

  extraerNumero(texto) {
    const match = texto.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }

  calcularPromedio(valores) {
    if (valores.length === 0) return 0;
    const suma = valores.reduce((a, b) => a + b, 0);
    return suma / valores.length;
  }

  calcularMediana(valores) {
    if (valores.length === 0) return 0;
    const sorted = [...valores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  calcularDesviacionEstandar(valores) {
    if (valores.length === 0) return 0;
    const promedio = this.calcularPromedio(valores);
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / valores.length;
    return Math.sqrt(varianza);
  }

  calcularCalificacionGeneral(metricasBasicas, metricasEspecificas) {
    let puntuacion = 0;
    let factores = 0;

    if (metricasBasicas.tasa_completacion) {
      puntuacion += parseFloat(metricasBasicas.tasa_completacion);
      factores++;
    }

    if (metricasEspecificas.porcentaje_completitud) {
      puntuacion += parseFloat(metricasEspecificas.porcentaje_completitud);
      factores++;
    }

    if (metricasEspecificas.avance_promedio) {
      puntuacion += metricasEspecificas.avance_promedio;
      factores++;
    }

    if (metricasEspecificas.calificacion_promedio) {
      puntuacion += (metricasEspecificas.calificacion_promedio / 10) * 100;
      factores++;
    }

    if (metricasEspecificas.evaluacion_promedio) {
      puntuacion += (metricasEspecificas.evaluacion_promedio / 10) * 100;
      factores++;
    }

    const promedioFinal = factores > 0 ? (puntuacion / factores).toFixed(2) : 0;

    return {
      puntuacion: parseFloat(promedioFinal),
      nivel: this.clasificarNivel(promedioFinal),
      factores_evaluados: factores,
      interpretacion: this.interpretarCalificacion(promedioFinal)
    };
  }

  clasificarNivel(puntuacion) {
    if (puntuacion >= 90) return 'EXCELENTE';
    if (puntuacion >= 80) return 'MUY BUENO';
    if (puntuacion >= 70) return 'BUENO';
    if (puntuacion >= 60) return 'REGULAR';
    return 'NECESITA MEJORA';
  }

  interpretarCalificacion(puntuacion) {
    if (puntuacion >= 90) return 'Desempeño sobresaliente';
    if (puntuacion >= 80) return 'Desempeño muy satisfactorio';
    if (puntuacion >= 70) return 'Desempeño aceptable';
    if (puntuacion >= 60) return 'Desempeño regular, requiere atención';
    return 'Requiere intervención urgente';
  }
}

module.exports = EncuestaMetricsRepository;
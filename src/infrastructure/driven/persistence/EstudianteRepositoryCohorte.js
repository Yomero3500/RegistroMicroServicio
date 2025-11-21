// EstudianteRepositoryCohorte.js - ACTUALIZADO CON 6 REQUISITOS (Estancia 1 y 2)
const EstudianteModel = require('./models/registration/EstudianteModel');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

class EstudianteRepositoryCohorte {

  getModel() {
    const estudianteModel = EstudianteModel.init(sequelize);
    return {
      estudianteModel
    };
  }


getPalabrasClave() {
  return {
    // Palabras de progreso positivo (PESO: +2 puntos cada una)
    progreso_positivo: {
      alto: ['excelente', 'sobresaliente', 'excepcional', 'perfecto'],
      medio: ['completado', 'finalizado', 'terminado', 'aprobado', 'acreditado', 'exitoso'],
      bajo: ['bien', 'correcto', 'sin problema', 'entregado', 'cumplido']
    },
    
    // Palabras de progreso negativo (PESO: -2 puntos cada una)
    progreso_negativo: {
      alto: ['reprobado', 'rechazado', 'suspendido', 'cancelado'],
      medio: ['atrasado', 'pendiente', 'incompleto', 'adeudo'],
      bajo: ['problema', 'dificultad', 'retraso', 'falta']
    },
    
    // Requisito 1: 10 Cuatrimestres (CRÍTICO)
    cuatrimestres_completos: [
      '10 cuatrimestres', 'diez cuatrimestres', 'todos los cuatrimestres',
      'completé la carrera', 'terminé todos', '100% de materias',
      'cursé completo', 'finalicé el plan'
    ],
    
    // Requisito 2: Pagos al corriente (CRÍTICO)
    pagos_corrientes: {
      pregunta: ['pago', 'cuota', 'adeudo', 'mensualidad', 'colegiatura'],
      positiva: ['al corriente', 'pagado completo', 'sin adeudo', 'liquidado', 'cubierto'],
      negativa: ['debo', 'pendiente', 'atrasado', 'falta pagar', 'adeudo de']
    },
    
    // Requisito 3: Gastos de titulación (CRÍTICO)
    gastos_titulacion: {
      pregunta: ['titulación', 'titulacion', 'gasto', 'costo', 'derecho'],
      positiva: ['cubierto', 'pagado', 'liquidado', 'completo', 'realizado'],
      negativa: ['falta', 'pendiente', 'no he', 'aún no', 'todavía no']
    },
    
    // Requisito 4: E.FIRMA (CRÍTICO)
    efirma: {
      pregunta: ['e.firma', 'efirma', 'firma electrónica', 'firma electronica', 'fiel'],
      positiva: ['vigente', 'tengo', 'tramitado', 'actualizado', 'válido', 'obtuve'],
      negativa: ['no tengo', 'vencido', 'sin tramitar', 'falta', 'pendiente']
    },
    
    // Requisito 5: Estancia 1 (CRÍTICO)
    estancia1: {
      pregunta: ['estancia 1', 'estancia i', 'primera estancia', 'estancia uno'],
      positiva: ['completada', 'terminada', 'liberada', 'aprobada', 'cubierta', 'finalizada', 'acreditada'],
      negativa: ['falta', 'pendiente', 'incompleta', 'no he', 'sin liberar', 'sin terminar']
    },
    
    // Requisito 6: Estancia 2 (CRÍTICO)
    estancia2: {
      pregunta: ['estancia 2', 'estancia ii', 'segunda estancia', 'estancia dos'],
      positiva: ['completada', 'terminada', 'liberada', 'aprobada', 'cubierta', 'finalizada', 'acreditada'],
      negativa: ['falta', 'pendiente', 'incompleta', 'no he', 'sin liberar', 'sin terminar']
    },
    
    // Requisito 7: Inglés (CRÍTICO) - UNIFICADO
    ingles: {
      pregunta: ['inglés', 'ingles', 'english', 'idioma', 'language', 'certificación idioma'],
      positiva: ['acreditado', 'aprobado', 'certificado', 'vigente', 'válido', 'completado', 'obtuve', 'tengo'],
      negativa: ['no', 'pendiente', 'falta', 'sin acreditar', 'reprobado', 'aún no', 'todavía no']
    },
    
    // Requisito 8: Estadía (CRÍTICO) - RENUMERADO DE 8 A 7
    estadia: {
      pregunta: ['estadía', 'estadia', 'estadía profesional', 'proyecto final'],
      positiva: ['completada', 'terminada', 'liberada', 'aprobada', 'cubierta', 'finalizada', 'entregada', 'acreditada'],
      negativa: ['falta', 'pendiente', 'incompleta', 'no he', 'sin liberar', 'sin terminar', 'sin entregar']
    },
    
    // Detección de cuatrimestre actual
    cuatrimestre_patterns: {
      numero: /\b([1-9]|10)\b.*cuatrimestre|cuatrimestre.*\b([1-9]|10)\b/i,
      ordinal: /(primer|segund|tercer|cuart|quint|sext|séptim|octav|noven|décim)o?\s*cuatrimestre/i,
      actual: /\b(estoy en|curso|cursando|actual)\b.*\b([1-9]|10)\b/i
    },
    
    // Detección de estatus de estudiante
    estatus: {
      activo: ['inscrito', 'activo', 'cursando', 'estudiando', 'asistiendo'],
      egresado: ['egresado', 'graduado', 'titulado', 'finalizó', 'completó carrera'],
      baja: ['baja', 'abandonó', 'dejó', 'retiró', 'suspendió estudios', 'ya no estudio']
    },
    
    // Respuestas afirmativas/negativas generales
    afirmativas: ['sí', 'si', 'yes', 'correcto', 'exacto', 'afirmativo', 'claro'],
    negativas: ['no', 'ninguno', 'ninguna', 'nada', 'negativo', 'jamás', 'nunca']
  };
}
/**
   * Configuración de tipos de encuesta con sus criterios de evaluación
   */
  getTipoEncuestaConfig() {
    return {
      'documento': {
        peso_cumplimiento: 0.8,
        peso_progreso: 0.2,
        criterios: {
          documentos_completos: 3,
          firmas_correctas: 2,
          tiempos_entrega: 2
        }
      },
      'seguimiento': {
        peso_cumplimiento: 0.3,
        peso_progreso: 0.7,
        criterios: {
          avance_cuatrimestres: 4,
          materias_aprobadas: 3,
          promedio_calificaciones: 2
        }
      },
      'final': {
        peso_cumplimiento: 0.5,
        peso_progreso: 0.5,
        criterios: {
          experiencia_completa: 3,
          satisfaccion_general: 3,
          logro_objetivos: 3
        }
      },
      'empresa': {
        peso_cumplimiento: 0.6,
        peso_progreso: 0.4,
        criterios: {
          proyecto_completado: 3,
          duracion_correcta: 2,
          evaluacion_empresa: 2
        }
      }
    };
  }

  // ========================================
  // FUNCIONES AUXILIARES DE ANÁLISIS
  // ========================================

getPalabrasClave() {
  return {
    // Palabras de progreso positivo (PESO: +2 puntos cada una)
    progreso_positivo: {
      alto: ['excelente', 'sobresaliente', 'excepcional', 'perfecto'],
      medio: ['completado', 'finalizado', 'terminado', 'aprobado', 'acreditado', 'exitoso'],
      bajo: ['bien', 'correcto', 'sin problema', 'entregado', 'cumplido']
    },
    
    // Palabras de progreso negativo (PESO: -2 puntos cada una)
    progreso_negativo: {
      alto: ['reprobado', 'rechazado', 'suspendido', 'cancelado'],
      medio: ['atrasado', 'pendiente', 'incompleto', 'adeudo'],
      bajo: ['problema', 'dificultad', 'retraso', 'falta']
    },
    
    // Requisito 1: 10 Cuatrimestres (CRÍTICO)
    cuatrimestres_completos: [
      '10 cuatrimestres', 'diez cuatrimestres', 'todos los cuatrimestres',
      'completé la carrera', 'terminé todos', '100% de materias',
      'cursé completo', 'finalicé el plan'
    ],
    
    // Requisito 2: Pagos al corriente (CRÍTICO)
    pagos_corrientes: {
      pregunta: ['pago', 'cuota', 'adeudo', 'mensualidad', 'colegiatura'],
      positiva: ['al corriente', 'pagado completo', 'sin adeudo', 'liquidado', 'cubierto'],
      negativa: ['debo', 'pendiente', 'atrasado', 'falta pagar', 'adeudo de']
    },
    
    // Requisito 3: Gastos de titulación (CRÍTICO)
    gastos_titulacion: {
      pregunta: ['titulación', 'titulacion', 'gasto', 'costo', 'derecho'],
      positiva: ['cubierto', 'pagado', 'liquidado', 'completo', 'realizado'],
      negativa: ['falta', 'pendiente', 'no he', 'aún no', 'todavía no']
    },
    
    // Requisito 4: E.FIRMA (CRÍTICO)
    efirma: {
      pregunta: ['e.firma', 'efirma', 'firma electrónica', 'firma electronica', 'fiel'],
      positiva: ['vigente', 'tengo', 'tramitado', 'actualizado', 'válido', 'obtuve'],
      negativa: ['no tengo', 'vencido', 'sin tramitar', 'falta', 'pendiente']
    },
    
    // Requisito 5: Estancia 1 (CRÍTICO)
    estancia1: {
      pregunta: ['estancia 1', 'estancia i', 'primera estancia', 'estancia uno'],
      positiva: ['completada', 'terminada', 'liberada', 'aprobada', 'cubierta', 'finalizada', 'acreditada'],
      negativa: ['falta', 'pendiente', 'incompleta', 'no he', 'sin liberar', 'sin terminar']
    },
    
    // Requisito 6: Estancia 2 (CRÍTICO)
    estancia2: {
      pregunta: ['estancia 2', 'estancia ii', 'segunda estancia', 'estancia dos'],
      positiva: ['completada', 'terminada', 'liberada', 'aprobada', 'cubierta', 'finalizada', 'acreditada'],
      negativa: ['falta', 'pendiente', 'incompleta', 'no he', 'sin liberar', 'sin terminar']
    },
    
    // Requisito 7: Inglés (CRÍTICO) - UNIFICADO
    ingles: {
      pregunta: ['inglés', 'ingles', 'english', 'idioma', 'language', 'certificación idioma'],
      positiva: ['acreditado', 'aprobado', 'certificado', 'vigente', 'válido', 'completado', 'obtuve', 'tengo'],
      negativa: ['no', 'pendiente', 'falta', 'sin acreditar', 'reprobado', 'aún no', 'todavía no']
    },
    
    // Requisito 8: Estadía (CRÍTICO) - RENUMERADO DE 8 A 7
    estadia: {
      pregunta: ['estadía', 'estadia', 'estadía profesional', 'proyecto final'],
      positiva: ['completada', 'terminada', 'liberada', 'aprobada', 'cubierta', 'finalizada', 'entregada', 'acreditada'],
      negativa: ['falta', 'pendiente', 'incompleta', 'no he', 'sin liberar', 'sin terminar', 'sin entregar']
    },
    
    // Detección de cuatrimestre actual
    cuatrimestre_patterns: {
      numero: /\b([1-9]|10)\b.*cuatrimestre|cuatrimestre.*\b([1-9]|10)\b/i,
      ordinal: /(primer|segund|tercer|cuart|quint|sext|séptim|octav|noven|décim)o?\s*cuatrimestre/i,
      actual: /\b(estoy en|curso|cursando|actual)\b.*\b([1-9]|10)\b/i
    },
    
    // Detección de estatus de estudiante
    estatus: {
      activo: ['inscrito', 'activo', 'cursando', 'estudiando', 'asistiendo'],
      egresado: ['egresado', 'graduado', 'titulado', 'finalizó', 'completó carrera'],
      baja: ['baja', 'abandonó', 'dejó', 'retiró', 'suspendió estudios', 'ya no estudio']
    },
    
    // Respuestas afirmativas/negativas generales
    afirmativas: ['sí', 'si', 'yes', 'correcto', 'exacto', 'afirmativo', 'claro'],
    negativas: ['no', 'ninguno', 'ninguna', 'nada', 'negativo', 'jamás', 'nunca']
  };
}

  /**
   * Extrae cuatrimestre actual de una respuesta
   */
  extraerCuatrimestre(respuesta_texto) {
    const palabras = this.getPalabrasClave();
    const texto_lower = respuesta_texto.toLowerCase();

    // Intentar extraer número directo
    const matchNumero = texto_lower.match(palabras.cuatrimestre_patterns.numero);
    if (matchNumero) {
      return parseInt(matchNumero[1] || matchNumero[2]);
    }

    // Intentar con patrón "estoy en X"
    const matchActual = texto_lower.match(palabras.cuatrimestre_patterns.actual);
    if (matchActual) {
      return parseInt(matchActual[2]);
    }

    // Mapeo de ordinales
    const ordinales = {
      'primer': 1, 'segund': 2, 'tercer': 3, 'cuart': 4, 'quint': 5,
      'sext': 6, 'séptim': 7, 'septim': 7, 'octav': 8, 'noven': 9, 'décim': 10, 'decim': 10
    };

    for (const [palabra, numero] of Object.entries(ordinales)) {
      if (texto_lower.includes(palabra)) {
        return numero;
      }
    }

    return null;
  }

  // ========================================
  // MÉTRICAS PRINCIPALES (MEJORADAS)
  // ========================================
/**
   * MEJORADO: Distribución Regular/Irregular con sistema de puntuación multi-criterio
   * ACTUALIZADO: 6 requisitos (agregadas Estancia 1 y 2), >= 3 para regular
   */
/**
 * MEJORADO: Distribución Regular/Irregular con sistema de puntuación multi-criterio
 * ACTUALIZADO: 7 requisitos (eliminado Inglés Certificación), >= 4 para regular
 */
/**
 * ACTUALIZADO: Clasificación Regular/Irregular según criterios UPCH
 * 
 * CRITERIOS PARA SER REGULAR:
 * 1. NO haber reprobado materias (pregunta 5: "¿Has reprobado alguna materia?" = "No")
 * 2. NO tener materias pendientes (pregunta 9: "¿Tienes materias pendientes de cuatrimestres anteriores?" = "No")
 * 3. NO estar cursando materias recursadas (pregunta 7: "¿Estás cursando materias recursadas?" = "No")
 * 
 * O bien, si el estudiante declara su estatus directamente:
 * - Pregunta 2: "¿Cuál es tu estatus académico actual?" = "Regular"
 */
async getStudentsStatusDistribution(cohortId = null) {
  const query = `
    WITH estudiantes_seguimiento AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        c.id as cohorte_id,
        c.anio_ingreso,
        c.periodo_ingreso,
        CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as cohorte_nombre,
        c.fecha_inicio,
        c.fecha_fin_ideal,
        c.fecha_fin_maxima,
        
        -- Cuatrimestre actual
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'qué cuatrimestre.*encuentras|cuatrimestre.*actual'
          AND r.respuesta_texto REGEXP '^[0-9]+$'
          THEN CAST(r.respuesta_texto AS UNSIGNED)
          ELSE NULL
        END) as cuatrimestre_actual,
        
        -- Estatus autodeclarado (pregunta 2)
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'estatus académico.*actual|cuál.*estatus'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as estatus_autodeclarado,
        
        -- ¿Ha reprobado materias? (pregunta 5)
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'has reprobado|reprobado.*materia'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as ha_reprobado,
        
        -- Cantidad de materias reprobadas (pregunta 6)
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'cuántas.*reprobado|reprobado.*cuántas'
          AND r.respuesta_texto REGEXP '^[0-9]+$'
          THEN CAST(r.respuesta_texto AS UNSIGNED)
          ELSE 0
        END) as cantidad_reprobadas,
        
        -- ¿Está cursando recursadas? (pregunta 7)
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'cursando.*recursada|materias recursada'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as cursando_recursadas,
        
        -- ¿Tiene materias pendientes? (pregunta 9)
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'materias pendientes|pendientes.*cuatrimestres anteriores'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as tiene_pendientes,
        
        -- Promedio general (pregunta 4)
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'promedio general|promedio.*actual'
          AND r.respuesta_texto REGEXP '^[0-9]+(\\.[0-9]+)?$'
          THEN CAST(r.respuesta_texto AS DECIMAL(3,2))
          ELSE NULL
        END) as promedio_general,
        
        -- Satisfacción académica (pregunta 10)
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'satisfecho.*desempeño académico'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as satisfaccion_desempeno
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      INNER JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      INNER JOIN respuestas r ON pa.id_participacion = r.id_participacion
      INNER JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
        AND enc.titulo = 'Seguimiento Académico'  -- Solo encuesta de seguimiento
        ${cohortId ? "AND c.id = :cohortId" : ""}
      GROUP BY e.id, e.matricula, e.nombre, c.id, c.anio_ingreso, c.periodo_ingreso, 
               c.fecha_inicio, c.fecha_fin_ideal, c.fecha_fin_maxima
    ),
    
    clasificacion_estudiantes AS (
      SELECT 
        id,
        matricula,
        nombre,
        cohorte_id,
        anio_ingreso,
        periodo_ingreso,
        cohorte_nombre,
        fecha_inicio,
        fecha_fin_ideal,
        fecha_fin_maxima,
        cuatrimestre_actual,
        estatus_autodeclarado,
        ha_reprobado,
        cantidad_reprobadas,
        cursando_recursadas,
        tiene_pendientes,
        promedio_general,
        satisfaccion_desempeno,
        
        -- CLASIFICACIÓN FINAL
        -- REGULAR si cumple TODAS estas condiciones:
        -- 1. NO ha reprobado materias (ha_reprobado = 'no')
        -- 2. NO tiene materias pendientes (tiene_pendientes = 'no')
        -- 3. NO está cursando recursadas (cursando_recursadas = 'no')
        -- O si el estudiante se autodeclara como 'regular'
        CASE 
          WHEN (
            -- Opción 1: Validación estricta por respuestas
            (
              (ha_reprobado IS NULL OR ha_reprobado REGEXP '^no$|^ninguno$|^ninguna$')
              AND (tiene_pendientes IS NULL OR tiene_pendientes REGEXP '^no$|^ninguno$|^ninguna$')
              AND (cursando_recursadas IS NULL OR cursando_recursadas REGEXP '^no$|^ninguno$|^ninguna$')
            )
            -- Opción 2: Estudiante se autodeclara como regular
            OR estatus_autodeclarado REGEXP 'regular'
          ) THEN 'regular'
          ELSE 'irregular'
        END as clasificacion,
        
        -- Razones de irregularidad (para debugging)
        CONCAT_WS(', ',
          CASE WHEN ha_reprobado REGEXP '^si$|^sí$' THEN 'Reprobó materias' END,
          CASE WHEN tiene_pendientes REGEXP '^si$|^sí$' THEN 'Tiene pendientes' END,
          CASE WHEN cursando_recursadas REGEXP '^si$|^sí$' THEN 'Cursando recursadas' END
        ) as razones_irregularidad
        
      FROM estudiantes_seguimiento
    )
    
    SELECT 
      -- Conteo de estudiantes por clasificación
      SUM(CASE WHEN clasificacion = 'regular' THEN 1 ELSE 0 END) as regular,
      SUM(CASE WHEN clasificacion = 'irregular' THEN 1 ELSE 0 END) as irregular,
      
      -- Métricas adicionales
      AVG(promedio_general) as promedio_general_grupo,
      AVG(cuatrimestre_actual) as cuatrimestre_promedio,
      
      -- Desglose de irregularidad
      SUM(CASE WHEN ha_reprobado REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as con_materias_reprobadas,
      SUM(CASE WHEN tiene_pendientes REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as con_materias_pendientes,
      SUM(CASE WHEN cursando_recursadas REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as cursando_recursadas,
      
      -- Información del cohorte (si se filtró por uno específico)
      ${cohortId ? `
      MAX(cohorte_id) as cohorte_id,
      MAX(cohorte_nombre) as cohorte_nombre,
      MAX(anio_ingreso) as anio_ingreso,
      MAX(periodo_ingreso) as periodo_ingreso,
      MAX(fecha_inicio) as fecha_inicio,
      MAX(fecha_fin_ideal) as fecha_fin_ideal,
      MAX(fecha_fin_maxima) as fecha_fin_maxima
      ` : `
      NULL as cohorte_id,
      NULL as cohorte_nombre,
      NULL as anio_ingreso,
      NULL as periodo_ingreso,
      NULL as fecha_inicio,
      NULL as fecha_fin_ideal,
      NULL as fecha_fin_maxima
      `}
      
    FROM clasificacion_estudiantes
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: cohortId ? { cohortId } : {},
      type: QueryTypes.SELECT,
    });

    const data = results[0] || { 
      regular: 0, 
      irregular: 0,
      con_materias_reprobadas: 0,
      con_materias_pendientes: 0,
      cursando_recursadas: 0
    };
    
    console.log('📊 Distribución Regular/Irregular (Criterios UPCH - Seguimiento Académico):');
    console.log(`   Cohorte ID: ${cohortId || 'TODOS'}`);
    if (data.cohorte_nombre) {
      console.log(`   Cohorte: ${data.cohorte_nombre}`);
    }
    console.log(`   ✅ Regular: ${data.regular} estudiantes`);
    console.log(`   ❌ Irregular: ${data.irregular} estudiantes`);
    console.log(`\n   📉 Desglose de Irregularidad:`);
    console.log(`      • Con materias reprobadas: ${data.con_materias_reprobadas}`);
    console.log(`      • Con materias pendientes: ${data.con_materias_pendientes}`);
    console.log(`      • Cursando recursadas: ${data.cursando_recursadas}`);
    console.log(`\n   📈 Métricas Generales:`);
    console.log(`      • Promedio general del grupo: ${data.promedio_general_grupo ? parseFloat(data.promedio_general_grupo).toFixed(2) : 'N/A'}`);
    console.log(`      • Cuatrimestre promedio: ${data.cuatrimestre_promedio ? parseFloat(data.cuatrimestre_promedio).toFixed(1) : 'N/A'}`);
    
    // Construir respuesta
    const response = {
      regular: parseInt(data.regular) || 0,
      irregular: parseInt(data.irregular) || 0,
      desglose_irregularidad: {
        con_materias_reprobadas: parseInt(data.con_materias_reprobadas) || 0,
        con_materias_pendientes: parseInt(data.con_materias_pendientes) || 0,
        cursando_recursadas: parseInt(data.cursando_recursadas) || 0
      },
      metricas: {
        promedio_general_grupo: data.promedio_general_grupo ? parseFloat(data.promedio_general_grupo).toFixed(2) : null,
        cuatrimestre_promedio: data.cuatrimestre_promedio ? parseFloat(data.cuatrimestre_promedio).toFixed(1) : null
      }
    };

    // Agregar información del cohorte si existe
    if (cohortId && data.cohorte_id) {
      response.cohorte = {
        id: data.cohorte_id,
        nombre: data.cohorte_nombre,
        anio_ingreso: data.anio_ingreso,
        periodo_ingreso: data.periodo_ingreso
      };
    }

    return response;
  } catch (error) {
    console.error("Error en getStudentsStatusDistribution:", error);
    throw error;
  }
}

/**
   * MEJORADO: Timeline con métricas de calidad
   * (Sin cambios - no depende de requisitos)
   */
/**
 * ACTUALIZADO: Timeline de estudiantes por año usando Seguimiento Académico
 * Incluye clasificación Regular/Irregular y métricas académicas
 */
async getStudentsTimelineByYear() {
  const query = `
    WITH estudiantes_seguimiento AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        c.id as cohorte_id,
        c.anio_ingreso,
        c.periodo_ingreso,
        
        -- Cuatrimestre actual
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'qué cuatrimestre.*encuentras|cuatrimestre.*actual'
          AND r.respuesta_texto REGEXP '^[0-9]+$'
          THEN CAST(r.respuesta_texto AS UNSIGNED)
          ELSE NULL
        END) as cuatrimestre_actual,
        
        -- Estatus autodeclarado
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'estatus académico.*actual|cuál.*estatus'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as estatus_autodeclarado,
        
        -- ¿Ha reprobado materias?
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'has reprobado|reprobado.*materia'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as ha_reprobado,
        
        -- Cantidad de materias reprobadas
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'cuántas.*reprobado|reprobado.*cuántas'
          AND r.respuesta_texto REGEXP '^[0-9]+$'
          THEN CAST(r.respuesta_texto AS UNSIGNED)
          ELSE 0
        END) as cantidad_reprobadas,
        
        -- ¿Está cursando recursadas?
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'cursando.*recursada|materias recursada'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as cursando_recursadas,
        
        -- ¿Tiene materias pendientes?
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'materias pendientes|pendientes.*cuatrimestres anteriores'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as tiene_pendientes,
        
        -- Promedio general
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'promedio general|promedio.*actual'
          AND r.respuesta_texto REGEXP '^[0-9]+(\\.[0-9]+)?$'
          THEN CAST(r.respuesta_texto AS DECIMAL(3,2))
          ELSE NULL
        END) as promedio_general,
        
        -- Satisfacción académica
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'satisfecho.*desempeño académico'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as satisfaccion_desempeno,
        
        -- Participación completada
        MAX(CASE 
          WHEN pa.estatus = 'completada' THEN 1 
          ELSE 0 
        END) as tiene_participacion_completada
        
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN participaciones pa ON e.id = pa.id_estudiante
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta AND enc.titulo = 'Seguimiento Académico'
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE c.anio_ingreso >= YEAR(CURDATE()) - 6
      GROUP BY e.id, e.matricula, e.nombre, c.id, c.anio_ingreso, c.periodo_ingreso
    ),
    
    clasificacion_estudiantes AS (
      SELECT 
        id,
        matricula,
        nombre,
        cohorte_id,
        anio_ingreso,
        periodo_ingreso,
        cuatrimestre_actual,
        estatus_autodeclarado,
        ha_reprobado,
        cantidad_reprobadas,
        cursando_recursadas,
        tiene_pendientes,
        promedio_general,
        satisfaccion_desempeno,
        tiene_participacion_completada,
        
        -- ✅ CLASIFICACIÓN REGULAR/IRREGULAR
        CASE 
          WHEN (
            -- Opción 1: Validación estricta por respuestas
            (
              (ha_reprobado IS NULL OR ha_reprobado REGEXP '^no$|^ninguno$|^ninguna$')
              AND (tiene_pendientes IS NULL OR tiene_pendientes REGEXP '^no$|^ninguno$|^ninguna$')
              AND (cursando_recursadas IS NULL OR cursando_recursadas REGEXP '^no$|^ninguno$|^ninguna$')
            )
            -- Opción 2: Estudiante se autodeclara como regular
            OR estatus_autodeclarado REGEXP 'regular'
          ) THEN 'regular'
          ELSE 'irregular'
        END as clasificacion
        
      FROM estudiantes_seguimiento
    ),
    
    participaciones_por_estudiante AS (
      SELECT 
        e.id,
        c.anio_ingreso,
        COUNT(DISTINCT pa.id_participacion) as total_participaciones_estudiante,
        SUM(CASE WHEN pa.estatus = 'completada' THEN 1 ELSE 0 END) as participaciones_completadas
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN participaciones pa ON e.id = pa.id_estudiante
      WHERE c.anio_ingreso >= YEAR(CURDATE()) - 6
      GROUP BY e.id, c.anio_ingreso
    )
    
    SELECT 
      ce.anio_ingreso as year,
      
      -- 📊 Total de estudiantes activos
      COUNT(DISTINCT ce.id) as activos,
      
      -- 📈 Clasificación Regular/Irregular
      SUM(CASE WHEN ce.clasificacion = 'regular' THEN 1 ELSE 0 END) as regulares,
      SUM(CASE WHEN ce.clasificacion = 'irregular' THEN 1 ELSE 0 END) as irregulares,
      
      -- 📊 Porcentajes de regularidad
      ROUND(
        (SUM(CASE WHEN ce.clasificacion = 'regular' THEN 1 ELSE 0 END) * 100.0) / 
        NULLIF(COUNT(DISTINCT ce.id), 0), 1
      ) as porcentaje_regular,
      ROUND(
        (SUM(CASE WHEN ce.clasificacion = 'irregular' THEN 1 ELSE 0 END) * 100.0) / 
        NULLIF(COUNT(DISTINCT ce.id), 0), 1
      ) as porcentaje_irregular,
      
      -- 📉 Desglose de irregularidad
      SUM(CASE WHEN ce.ha_reprobado REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as con_materias_reprobadas,
      SUM(CASE WHEN ce.tiene_pendientes REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as con_materias_pendientes,
      SUM(CASE WHEN ce.cursando_recursadas REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as cursando_recursadas,
      
      -- 📚 Participaciones
      SUM(ppe.total_participaciones_estudiante) as total_participaciones,
      SUM(ppe.participaciones_completadas) as participaciones_completadas,
      ROUND(
        SUM(ppe.total_participaciones_estudiante) / 
        NULLIF(COUNT(DISTINCT ce.id), 0), 2
      ) as promedio_participaciones,
      
      -- ✅ Tasa de completitud de encuestas
      ROUND(
        (SUM(ppe.participaciones_completadas) * 100.0) / 
        NULLIF(SUM(ppe.total_participaciones_estudiante), 0), 2
      ) as tasa_completitud,
      
      -- 📊 Métricas académicas
      ROUND(AVG(ce.promedio_general), 2) as promedio_general_anio,
      ROUND(AVG(ce.cuatrimestre_actual), 1) as cuatrimestre_promedio,
      
      -- 📈 Estudiantes con datos completos
      SUM(ce.tiene_participacion_completada) as con_encuesta_completada,
      ROUND(
        (SUM(ce.tiene_participacion_completada) * 100.0) / 
        NULLIF(COUNT(DISTINCT ce.id), 0), 1
      ) as porcentaje_con_datos
      
    FROM clasificacion_estudiantes ce
    LEFT JOIN participaciones_por_estudiante ppe ON ce.id = ppe.id AND ce.anio_ingreso = ppe.anio_ingreso
    GROUP BY ce.anio_ingreso
    HAVING activos > 0
    ORDER BY ce.anio_ingreso ASC
  `;

  try {
    const results = await sequelize.query(query, { type: QueryTypes.SELECT });
    
    console.log('📅 Timeline de Estudiantes por Año (Criterios UPCH):');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    results.forEach(row => {
      console.log(`📆 Año ${row.year}:`);
      console.log(`   👥 Total Activos: ${row.activos}`);
      console.log(`   ✅ Regular: ${row.regulares} (${row.porcentaje_regular}%)`);
      console.log(`   ❌ Irregular: ${row.irregulares} (${row.porcentaje_irregular}%)`);
      console.log(`\n   📉 Desglose de Irregularidad:`);
      console.log(`      • Con materias reprobadas: ${row.con_materias_reprobadas}`);
      console.log(`      • Con materias pendientes: ${row.con_materias_pendientes}`);
      console.log(`      • Cursando recursadas: ${row.cursando_recursadas}`);
      console.log(`\n   📚 Participación en Encuestas:`);
      console.log(`      • Total participaciones: ${row.total_participaciones}`);
      console.log(`      • Participaciones completadas: ${row.participaciones_completadas}`);
      console.log(`      • Promedio por estudiante: ${row.promedio_participaciones}`);
      console.log(`      • Tasa de completitud: ${row.tasa_completitud}%`);
      console.log(`\n   📊 Métricas Académicas:`);
      console.log(`      • Promedio general: ${row.promedio_general_anio || 'N/A'}`);
      console.log(`      • Cuatrimestre promedio: ${row.cuatrimestre_promedio || 'N/A'}`);
      console.log(`      • Estudiantes con datos: ${row.con_encuesta_completada} (${row.porcentaje_con_datos}%)`);
      console.log('\n───────────────────────────────────────────────────────────\n');
    });
    
    return results;
  } catch (error) {
    console.error("Error en getStudentsTimelineByYear:", error);
    throw error;
  }
}

/**
 * ACTUALIZADO: Comparación por cohorte usando datos de Seguimiento Académico
 * Clasificación REGULAR/IRREGULAR basada en criterios UPCH (sin materias reprobadas, pendientes o recursadas)
 */
async getCohortComparisonBySemester(cohortId = null) {
  const query = `
    WITH estudiantes_seguimiento AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        c.id as cohorte_id,
        c.anio_ingreso,
        c.periodo_ingreso,
        CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as cohorte_nombre,
        
        -- Cuatrimestre actual
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'qué cuatrimestre.*encuentras|cuatrimestre.*actual'
          AND r.respuesta_texto REGEXP '^[0-9]+$'
          THEN CAST(r.respuesta_texto AS UNSIGNED)
          ELSE NULL
        END) as cuatrimestre_actual,
        
        -- Estatus autodeclarado
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'estatus académico.*actual|cuál.*estatus'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as estatus_autodeclarado,
        
        -- ¿Ha reprobado materias?
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'has reprobado|reprobado.*materia'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as ha_reprobado,
        
        -- Cantidad de materias reprobadas
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'cuántas.*reprobado|reprobado.*cuántas'
          AND r.respuesta_texto REGEXP '^[0-9]+$'
          THEN CAST(r.respuesta_texto AS UNSIGNED)
          ELSE 0
        END) as cantidad_reprobadas,
        
        -- ¿Está cursando recursadas?
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'cursando.*recursada|materias recursada'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as cursando_recursadas,
        
        -- ¿Tiene materias pendientes?
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'materias pendientes|pendientes.*cuatrimestres anteriores'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as tiene_pendientes,
        
        -- Promedio general
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'promedio general|promedio.*actual'
          AND r.respuesta_texto REGEXP '^[0-9]+(\\.[0-9]+)?$'
          THEN CAST(r.respuesta_texto AS DECIMAL(3,2))
          ELSE NULL
        END) as promedio_general,
        
        -- Satisfacción académica
        MAX(CASE 
          WHEN LOWER(p.title) REGEXP 'satisfecho.*desempeño académico'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as satisfaccion_desempeno
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      INNER JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      INNER JOIN respuestas r ON pa.id_participacion = r.id_participacion
      INNER JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
        AND enc.titulo = 'Seguimiento Académico'
        ${cohortId ? "AND c.id = :cohortId" : ""}
      GROUP BY e.id, e.matricula, e.nombre, c.id, c.anio_ingreso, c.periodo_ingreso
    ),
    
    clasificacion_estudiantes AS (
      SELECT 
        id,
        matricula,
        nombre,
        cohorte_id,
        anio_ingreso,
        periodo_ingreso,
        cohorte_nombre,
        cuatrimestre_actual,
        estatus_autodeclarado,
        ha_reprobado,
        cantidad_reprobadas,
        cursando_recursadas,
        tiene_pendientes,
        promedio_general,
        satisfaccion_desempeno,
        
        -- ✅ CLASIFICACIÓN REGULAR/IRREGULAR
        -- REGULAR si cumple TODAS estas condiciones:
        -- 1. NO ha reprobado materias (ha_reprobado = 'no')
        -- 2. NO tiene materias pendientes (tiene_pendientes = 'no')
        -- 3. NO está cursando recursadas (cursando_recursadas = 'no')
        -- O si el estudiante se autodeclara como 'regular'
        CASE 
          WHEN (
            -- Opción 1: Validación estricta por respuestas
            (
              (ha_reprobado IS NULL OR ha_reprobado REGEXP '^no$|^ninguno$|^ninguna$')
              AND (tiene_pendientes IS NULL OR tiene_pendientes REGEXP '^no$|^ninguno$|^ninguna$')
              AND (cursando_recursadas IS NULL OR cursando_recursadas REGEXP '^no$|^ninguno$|^ninguna$')
            )
            -- Opción 2: Estudiante se autodeclara como regular
            OR estatus_autodeclarado REGEXP 'regular'
          ) THEN 'regular'
          ELSE 'irregular'
        END as clasificacion
        
      FROM estudiantes_seguimiento
    )
    
    SELECT 
      cohorte_id,
      cohorte_nombre as cuatrimestre,
      anio_ingreso,
      
      -- ✅ Regulares por cohorte (según criterios UPCH)
      SUM(CASE WHEN clasificacion = 'regular' THEN 1 ELSE 0 END) as regulares,
      
      -- ✅ Irregulares por cohorte (según criterios UPCH)
      SUM(CASE WHEN clasificacion = 'irregular' THEN 1 ELSE 0 END) as irregulares,
      
      -- 📊 Métricas adicionales
      AVG(promedio_general) as calificacion_promedio,
      AVG(cuatrimestre_actual) as cuatrimestre_promedio,
      
      -- 📉 Desglose de irregularidad
      SUM(CASE WHEN ha_reprobado REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as con_materias_reprobadas,
      SUM(CASE WHEN tiene_pendientes REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as con_materias_pendientes,
      SUM(CASE WHEN cursando_recursadas REGEXP '^si$|^sí$' THEN 1 ELSE 0 END) as cursando_recursadas,
      
      -- 📈 Porcentajes
      ROUND(
        (SUM(CASE WHEN clasificacion = 'regular' THEN 1 ELSE 0 END) / COUNT(*) * 100), 1
      ) as porcentaje_regular,
      ROUND(
        (SUM(CASE WHEN clasificacion = 'irregular' THEN 1 ELSE 0 END) / COUNT(*) * 100), 1
      ) as porcentaje_irregular,
      
      -- 📊 Total de estudiantes
      COUNT(*) as total_estudiantes
      
    FROM clasificacion_estudiantes
    GROUP BY cohorte_id, cohorte_nombre, anio_ingreso
    ORDER BY anio_ingreso ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: cohortId ? { cohortId } : {},
      type: QueryTypes.SELECT,
    });
    
    console.log('📊 Comparación por Cohorte (Criterios UPCH - Seguimiento Académico):');
    results.forEach(row => {
      console.log(`\n   🎓 Cohorte ${row.cuatrimestre} (ID: ${row.cohorte_id}):`);
      console.log(`      Total: ${row.total_estudiantes} estudiantes`);
      console.log(`      ✅ Regular: ${row.regulares} (${row.porcentaje_regular}%)`);
      console.log(`      ❌ Irregular: ${row.irregulares} (${row.porcentaje_irregular}%)`);
      console.log(`\n      📉 Desglose de Irregularidad:`);
      console.log(`         • Con materias reprobadas: ${row.con_materias_reprobadas}`);
      console.log(`         • Con materias pendientes: ${row.con_materias_pendientes}`);
      console.log(`         • Cursando recursadas: ${row.cursando_recursadas}`);
      console.log(`\n      📈 Métricas:`);
      console.log(`         • Promedio general: ${row.calificacion_promedio ? parseFloat(row.calificacion_promedio).toFixed(2) : 'N/A'}`);
      console.log(`         • Cuatrimestre promedio: ${row.cuatrimestre_promedio ? parseFloat(row.cuatrimestre_promedio).toFixed(1) : 'N/A'}`);
    });
    
    return results;
  } catch (error) {
    console.error("Error en getCohortComparisonBySemester:", error);
    throw error;
  }
}

/**
 * MEJORADO: Métricas de graduación con validación estricta de requisitos
 * ACTUALIZADO: 7 requisitos (eliminado Inglés Certificación)
 */
async getGraduationRequirementsMetrics() {
  const query = `
    WITH requisitos_estudiantes AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        
        -- REQUISITO 1: 10 Cuatrimestres (VALIDACIÓN ESTRICTA)
        MAX(CASE 
          WHEN (
            (LOWER(r.respuesta_texto) REGEXP '10.*cuatrimestre|cuatrimestre.*10|diez cuatrimestre')
            OR (LOWER(r.respuesta_texto) REGEXP 'complet.*carrera|termin.*todos|100%')
            OR (r.respuesta_texto = '10' AND LOWER(p.title) REGEXP 'cuatrimestre')
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no.*completado'
          THEN 1 ELSE 0 
        END) as req_cuatrimestres,
        
        -- REQUISITO 2: Pagos al corriente (VALIDACIÓN ESTRICTA)
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'pago|cuota|adeudo|mensualidad'
            AND (
              LOWER(r.respuesta_texto) REGEXP 'al corriente|sin adeudo|pagado.*completo|liquidado|todo pagado'
              OR (LOWER(r.respuesta_texto) IN ('sí', 'si', 'yes') AND LOWER(p.title) REGEXP 'corriente|adeudo')
            )
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar'
          THEN 1 ELSE 0 
        END) as req_pagos,
        
        -- REQUISITO 3: Gastos titulación (VALIDACIÓN ESTRICTA)
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto.*titulación|costo.*titulo'
            AND (
              LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|realizado|completo'
              OR (LOWER(r.respuesta_texto) IN ('sí', 'si', 'yes') AND LOWER(p.title) REGEXP 'cubierto|pagado')
            )
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no.*pagado|aún no'
          THEN 1 ELSE 0 
        END) as req_titulacion,
        
        -- REQUISITO 4: E.FIRMA (VALIDACIÓN ESTRICTA)
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electrónica|fiel'
            AND (
              LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|obtuve|tramitado|actualizado|válido'
              OR (LOWER(r.respuesta_texto) IN ('sí', 'si', 'yes') AND LOWER(p.title) REGEXP 'vigente|tiene')
            )
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'no.*tengo|vencido|sin tramitar|caducado'
          THEN 1 ELSE 0 
        END) as req_efirma,
        
        -- REQUISITO 5: Estancia 1 (VALIDACIÓN ESTRICTA)
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 1|estancia i|primera estancia|estancia uno'
            AND (
              LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada'
              OR (LOWER(r.respuesta_texto) IN ('sí', 'si', 'yes') AND LOWER(p.title) REGEXP 'liberada|completada')
            )
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no.*liberada'
          THEN 1 ELSE 0 
        END) as req_estancia1,
        
        -- REQUISITO 6: Estancia 2 (VALIDACIÓN ESTRICTA)
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 2|estancia ii|segunda estancia|estancia dos'
            AND (
              LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada'
              OR (LOWER(r.respuesta_texto) IN ('sí', 'si', 'yes') AND LOWER(p.title) REGEXP 'liberada|completada')
            )
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no.*liberada'
          THEN 1 ELSE 0 
        END) as req_estancia2,
        
        -- REQUISITO 7: Inglés (VALIDACIÓN ESTRICTA) - UNIFICADO
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'inglés|ingles|english|idioma|language|certificación.*idioma'
            AND (
              LOWER(r.respuesta_texto) REGEXP 'acreditado|aprobado|certificado|vigente|válido|completado|obtuve|tengo'
              OR (LOWER(r.respuesta_texto) IN ('sí', 'si', 'yes') AND LOWER(p.title) REGEXP 'acreditado|vigente')
            )
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'no|pendiente|falta|sin acreditar|reprobado|aún no|todavía no'
          THEN 1 ELSE 0 
        END) as req_ingles,
        
        -- REQUISITO 8: Estadía (VALIDACIÓN ESTRICTA) - RENUMERADO A 7
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estadía|estadia|estadía profesional|proyecto final'
            AND (
              LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|entregada|acreditada'
              OR (LOWER(r.respuesta_texto) IN ('sí', 'si', 'yes') AND LOWER(p.title) REGEXP 'completada|liberada')
            )
          )
          AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no.*liberada|sin terminar'
          THEN 1 ELSE 0 
        END) as req_estadia,
        
        -- Cuatrimestre actual
        MAX(CAST(REGEXP_SUBSTR(r.respuesta_texto, '\\b([1-9]|10)\\b') AS UNSIGNED)) as cuatrimestre_actual,
        
        -- Promedio de satisfacción
        AVG(CASE 
          WHEN r.respuesta_texto REGEXP '^[0-9]+(\\.[0-9]+)?$'
          AND CAST(r.respuesta_texto AS DECIMAL(3,1)) BETWEEN 0 AND 10
          THEN CAST(r.respuesta_texto AS DECIMAL(3,1))
          ELSE NULL
        END) as satisfaccion
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.matricula = pa.id_estudiante
      INNER JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      INNER JOIN respuestas r ON pa.id_participacion = r.id_participacion
      INNER JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
      GROUP BY e.id, e.matricula, e.nombre
    )

    SELECT 
      COUNT(DISTINCT id) as estudiantes_activos,
      
      -- Completaron 10 cuatrimestres
      SUM(req_cuatrimestres) as estudiantes_con_cuatrimestres_completos,
      
      -- Egresados REALES: Cumplen los 7 requisitos
      SUM(CASE 
        WHEN (req_cuatrimestres = 1 AND req_pagos = 1 AND req_titulacion = 1 AND req_efirma = 1 AND req_estancia1 = 1 AND req_estancia2 = 1 AND req_ingles = 1 AND req_estadia = 1)
        THEN 1 ELSE 0 
      END) as estudiantes_egresados,
      
      -- Próximos a egresar: En cuatrimestre 8-9 con al menos 4 requisitos
      SUM(CASE 
        WHEN cuatrimestre_actual BETWEEN 8 AND 9
        AND (req_cuatrimestres + req_pagos + req_titulacion + req_efirma + req_estancia1 + req_estancia2 + req_ingles + req_estadia) >= 4
        THEN 1 ELSE 0 
      END) as estudiantes_proximo_egreso,
      
      -- Promedio de satisfacción
      ROUND(AVG(satisfaccion), 2) as promedio_grupos,
      
      -- Porcentaje de avance: (requisitos cumplidos / 7) * 100
      ROUND(
        AVG((req_cuatrimestres + req_pagos + req_titulacion + req_efirma + req_estancia1 + req_estancia2 + req_ingles + req_estadia) * 100.0 / 7),
        2
      ) as porcentaje_avance_promedio,
      
      -- Métricas detalladas por requisito
      ROUND((SUM(req_cuatrimestres) * 100.0) / COUNT(*), 2) as porcentaje_req_cuatrimestres,
      ROUND((SUM(req_pagos) * 100.0) / COUNT(*), 2) as porcentaje_req_pagos,
      ROUND((SUM(req_titulacion) * 100.0) / COUNT(*), 2) as porcentaje_req_titulacion,
      ROUND((SUM(req_efirma) * 100.0) / COUNT(*), 2) as porcentaje_req_efirma,
      ROUND((SUM(req_estancia1) * 100.0) / COUNT(*), 2) as porcentaje_req_estancia1,
      ROUND((SUM(req_estancia2) * 100.0) / COUNT(*), 2) as porcentaje_req_estancia2,
      ROUND((SUM(req_ingles) * 100.0) / COUNT(*), 2) as porcentaje_req_ingles,
      ROUND((SUM(req_estadia) * 100.0) / COUNT(*), 2) as porcentaje_req_estadia
      
    FROM requisitos_estudiantes
  `;

  try {
    const results = await sequelize.query(query, { type: QueryTypes.SELECT });
    const metrics = results[0] || {};
    
    console.log('🎓 Métricas de Graduación (7 requisitos):');
    console.log(`   Estudiantes activos: ${metrics.estudiantes_activos || 0}`);
    console.log(`   Con 10 cuatrimestres: ${metrics.estudiantes_con_cuatrimestres_completos || 0}`);
    console.log(`   Egresados (7/7 requisitos): ${metrics.estudiantes_egresados || 0}`);
    console.log(`   Próximos a egresar: ${metrics.estudiantes_proximo_egreso || 0}`);
    console.log(`   Cumplimiento por requisito:`);
    console.log(`     - Cuatrimestres: ${metrics.porcentaje_req_cuatrimestres || 0}%`);
    console.log(`     - Pagos: ${metrics.porcentaje_req_pagos || 0}%`);
    console.log(`     - Titulación: ${metrics.porcentaje_req_titulacion || 0}%`);
    console.log(`     - E.FIRMA: ${metrics.porcentaje_req_efirma || 0}%`);
    console.log(`     - Estancia 1: ${metrics.porcentaje_req_estancia1 || 0}%`);
    console.log(`     - Estancia 2: ${metrics.porcentaje_req_estancia2 || 0}%`);
    console.log(`     - Inglés: ${metrics.porcentaje_req_ingles || 0}%`);
    console.log(`     - Estadía: ${metrics.porcentaje_req_estadia || 0}%`);
    
    return {
      estudiantes_activos: metrics.estudiantes_activos || 0,
      estudiantes_con_cuatrimestres_completos: metrics.estudiantes_con_cuatrimestres_completos || 0,
      promedio_grupos: metrics.promedio_grupos || 0,
      estudiantes_egresados: metrics.estudiantes_egresados || 0,
      estudiantes_proximo_egreso: metrics.estudiantes_proximo_egreso || 0,
      porcentaje_avance_promedio: metrics.porcentaje_avance_promedio || 0,
      // Métricas detalladas adicionales
      detalles_requisitos: {
        cuatrimestres: metrics.porcentaje_req_cuatrimestres || 0,
        pagos: metrics.porcentaje_req_pagos || 0,
        titulacion: metrics.porcentaje_req_titulacion || 0,
        efirma: metrics.porcentaje_req_efirma || 0,
        estancia1: metrics.porcentaje_req_estancia1 || 0,
        estancia2: metrics.porcentaje_req_estancia2 || 0,
        ingles: metrics.porcentaje_req_ingles || 0,
        estadia: metrics.porcentaje_req_estadia || 0
      }
    };
  } catch (error) {
    console.error("Error en getGraduationRequirementsMetrics:", error);
    throw error;
  }
}
  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

  async getAllStudents() {
    const query = `
      SELECT 
        e.id,
        e.nombre,
        e.matricula,
        e.email,
        e.cohorte_id as cohorte,
        e.estatus as estatusAlumno,
        
        -- Cuatrimestre desde respuestas
        COALESCE(
          MAX(CAST(REGEXP_SUBSTR(r.respuesta_texto, '\\b([1-9]|10)\\b') AS UNSIGNED)),
          0
        ) as cuatrimestreActual,
        
        -- Grupo actual
        CONCAT(
          SUBSTRING(e.cohorte_id, 1, 3),
          '-',
          COALESCE(
            MAX(CAST(REGEXP_SUBSTR(r.respuesta_texto, '\\b([1-9]|10)\\b') AS UNSIGNED)),
            1
          ),
          'A'
        ) as grupoActual,
        
        -- Total de participaciones
        COUNT(DISTINCT pa.id_participacion) as inscripcionesActivas,
        
        -- Estado de participación
        CASE 
          WHEN MAX(pa.estatus) = 'completada' THEN 'Inscrito'
          WHEN MAX(pa.estatus) = 'pendiente' THEN 'Pendiente'
          ELSE 'Sin inscripción'
        END as estatusInscripcion,
        
        'Ingeniería en Sistemas' as carrera
        
      FROM estudiantes e
      LEFT JOIN participaciones pa ON e.matricula = pa.id_estudiante
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      GROUP BY e.id, e.nombre, e.matricula, e.email, e.cohorte_id, e.estatus
      ORDER BY e.nombre ASC
    `;

    try {
      return await sequelize.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener estudiantes:", error);
      throw error;
    }
  }

  async getStudentsByYear(cohortId) {
    const query = `
      SELECT 
        e.id,
        e.nombre,
        e.matricula,
        e.email,
        e.estatus as estatusAlumno,
        e.cohorte_id as cohorte,
        COALESCE(
          MAX(CAST(REGEXP_SUBSTR(r.respuesta_texto, '\\b([1-9]|10)\\b') AS UNSIGNED)),
          0
        ) as cuatrimestreActual,
        COUNT(DISTINCT CASE 
          WHEN pa.estatus = 'completada' 
          THEN pa.id_participacion 
        END) as inscripcionesActivas
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN participaciones pa ON e.matricula = pa.id_estudiante 
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      WHERE c.id = :cohortId
      GROUP BY e.id
      ORDER BY e.nombre ASC
    `;

    try {
      return await sequelize.query(query, {
        replacements: { cohortId },
        type: QueryTypes.SELECT,
      });
    } catch (error) {
      console.error("Error al obtener estudiantes por cohorte:", error);
      throw error;
    }
  }

  async getCohortStatistics(cohorteId) {
    const query = `
      SELECT 
        e.cohorte_id,
        c.anio_ingreso,
        c.periodo_ingreso,
        COUNT(DISTINCT e.id) as total_estudiantes,
        SUM(CASE WHEN e.estatus = 'Inscrito' THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN e.estatus = 'Egresado' THEN 1 ELSE 0 END) as egresados,
        SUM(CASE WHEN e.estatus LIKE 'Baja%' THEN 1 ELSE 0 END) as bajas,
        COUNT(DISTINCT pa.id_participacion) as total_respuestas_encuestas
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN participaciones pa ON e.matricula = pa.id_estudiante
      WHERE e.cohorte_id = :cohorteId
      GROUP BY e.cohorte_id, c.anio_ingreso, c.periodo_ingreso
    `;

    try {
      const results = await sequelize.query(query, {
        replacements: { cohorteId },
        type: QueryTypes.SELECT,
      });
      return results[0] || null;
    } catch (error) {
      console.error("Error al obtener estadísticas de cohorte:", error);
      throw error;
    }
  }

  async getAllCohorts() {
    const query = `
      SELECT DISTINCT 
        c.id,
        CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as nombre,
        c.anio_ingreso,
        c.periodo_ingreso,
        COUNT(e.id) as total_estudiantes
      FROM cohortes c
      LEFT JOIN estudiantes e ON c.id = e.cohorte_id
      GROUP BY c.id, c.anio_ingreso, c.periodo_ingreso
      ORDER BY c.anio_ingreso DESC, c.periodo_ingreso DESC
    `;

    try {
      return await sequelize.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error al obtener cohortes:", error);
      throw error;
    }
  }


/**
 * ACTUALIZADO: Clasificación basada EXCLUSIVAMENTE en encuestas
 * Obtiene egresados y titulados evaluando 7 requisitos desde 5 encuestas:
 * 1. Estancia 1
 * 2. Estancia 2
 * 3. Estadía Profesional
 * 4. Requisitos de Titulación
 * 5. Seguimiento Académico
 */
async getGraduatesAndTitledByCohort(cohortId = null) {
  const query = `
    WITH cohort_students AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        c.id as cohorte_id,
        CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as cohorte_nombre,
        c.anio_ingreso,
        c.periodo_ingreso
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      WHERE 1=1
      ${cohortId ? "AND c.id = :cohortId" : ""}
    ),
    
    student_survey_requirements AS (
      SELECT 
        cs.id,
        cs.matricula,
        cs.nombre,
        cs.cohorte_id,
        cs.cohorte_nombre,
        cs.anio_ingreso,
        
        -- ========================================
        -- ESTATUS DEL ESTUDIANTE (Encuesta: Seguimiento Académico)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Seguimiento Académico'
          AND LOWER(p.title) REGEXP 'estatus académico.*actual|cuál.*estatus'
          THEN LOWER(r.respuesta_texto)
          ELSE NULL
        END) as estatus_academico,
        
        -- ========================================
        -- REQUISITO 1: 10 Cuatrimestres (Encuesta: Requisitos de Titulación)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Requisitos de Titulación'
          AND LOWER(p.title) REGEXP 'completado los 10 cuatrimestres|10 cuatrimestres.*plan'
          AND LOWER(r.respuesta_texto) REGEXP '^si$|^sí$'
          THEN 1 
          ELSE 0 
        END) as tiene_10_cuatrimestres,
        
        -- ========================================
        -- REQUISITO 2: Pagos al Corriente (Encuesta: Requisitos de Titulación)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Requisitos de Titulación'
          AND LOWER(p.title) REGEXP 'pagos pendientes.*institución|adeudos.*institución'
          AND LOWER(r.respuesta_texto) REGEXP '^no$|estoy al corriente'
          THEN 1 
          ELSE 0 
        END) as tiene_pagos_corriente,
        
        -- ========================================
        -- REQUISITO 3: Gastos de Titulación (Encuesta: Requisitos de Titulación)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Requisitos de Titulación'
          AND LOWER(p.title) REGEXP 'cubierto.*gastos.*titulación|gastos.*titulación.*cubierto'
          AND LOWER(r.respuesta_texto) REGEXP '^si$|^sí$|ya están cubiertos'
          THEN 1 
          ELSE 0 
        END) as tiene_gastos_titulacion,
        
        -- ========================================
        -- REQUISITO 4: E.FIRMA Vigente (Encuesta: Requisitos de Titulación)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Requisitos de Titulación'
          AND LOWER(p.title) REGEXP 'e\\.firma.*vigente|firma electrónica.*vigente'
          AND LOWER(r.respuesta_texto) REGEXP '^si$|^sí$|vigente'
          THEN 1 
          ELSE 0 
        END) as tiene_efirma_vigente,
        
        -- ========================================
        -- REQUISITO 5: Estancia 1 Liberada (Encuesta: Estancia 1)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Estancia 1- encuesta de documentación'
          AND LOWER(p.title) REGEXP 'has liberado.*estancia 1|liberado tu estancia 1'
          AND LOWER(r.respuesta_texto) REGEXP '^si$|^sí$|liberada'
          THEN 1 
          ELSE 0 
        END) as tiene_estancia1_liberada,
        
        -- ========================================
        -- REQUISITO 6: Estancia 2 Liberada (Encuesta: Estancia 2)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Estancia 2 - encuesta de documentación'
          AND LOWER(p.title) REGEXP 'has liberado.*estancia 2|liberado tu estancia 2'
          AND LOWER(r.respuesta_texto) REGEXP '^si$|^sí$|liberada'
          THEN 1 
          ELSE 0 
        END) as tiene_estancia2_liberada,
        
        -- ========================================
        -- REQUISITO 7: Inglés Acreditado (Encuesta: Requisitos de Titulación)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Requisitos de Titulación'
          AND LOWER(p.title) REGEXP 'acreditado.*inglés|nivel.*inglés.*requerido'
          AND LOWER(r.respuesta_texto) REGEXP '^si$|^sí$|acreditado'
          THEN 1 
          ELSE 0 
        END) as tiene_ingles_acreditado,
        
        -- ========================================
        -- REQUISITO 8: Estadía Profesional Liberada (Encuesta: Estadía Profesional)
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Estadía Profesional - encuesta de documentación'
          AND LOWER(p.title) REGEXP 'has liberado.*estadía|liberado.*estadía profesional'
          AND LOWER(r.respuesta_texto) REGEXP '^si$|^sí$|liberada'
          THEN 1 
          ELSE 0 
        END) as tiene_estadia_liberada
        
      FROM cohort_students cs
      LEFT JOIN participaciones pa ON cs.id = pa.id_estudiante
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada' OR pa.estatus IS NULL
      GROUP BY cs.id, cs.matricula, cs.nombre, cs.cohorte_id, cs.cohorte_nombre, cs.anio_ingreso
    ),
    
    student_classification AS (
      SELECT 
        ssr.*,
        
        -- Determinar estatus del estudiante
        CASE 
          WHEN ssr.estatus_academico REGEXP 'egresado' THEN 'Egresado'
          WHEN ssr.estatus_academico REGEXP 'inscrito|regular' THEN 'Inscrito'
          WHEN ssr.estatus_academico REGEXP 'irregular' THEN 'Irregular'
          WHEN ssr.estatus_academico REGEXP 'baja.*temporal' THEN 'Baja Temporal'
          WHEN ssr.estatus_academico REGEXP 'baja' THEN 'Baja Definitiva'
          ELSE 'Desconocido'
        END as estatus_final,
        
        -- Calcular total de requisitos cumplidos (de los 8)
        (
          ssr.tiene_10_cuatrimestres +
          ssr.tiene_pagos_corriente +
          ssr.tiene_gastos_titulacion +
          ssr.tiene_efirma_vigente +
          ssr.tiene_estancia1_liberada +
          ssr.tiene_estancia2_liberada +
          ssr.tiene_ingles_acreditado +
          ssr.tiene_estadia_liberada
        ) as total_requisitos_cumplidos,
        
        -- Determinar si es TITULADO (Egresado + 6 requisitos específicos: 3-8)
        CASE 
          WHEN ssr.estatus_academico REGEXP 'egresado'
          AND ssr.tiene_gastos_titulacion = 1
          AND ssr.tiene_efirma_vigente = 1
          AND ssr.tiene_estancia1_liberada = 1
          AND ssr.tiene_estancia2_liberada = 1
          AND ssr.tiene_ingles_acreditado = 1
          AND ssr.tiene_estadia_liberada = 1
          THEN 1 
          ELSE 0 
        END as es_titulado
        
      FROM student_survey_requirements ssr
    )

    SELECT 
      sc.cohorte_id,
      sc.cohorte_nombre as anio_cohorte,
      sc.anio_ingreso,
      
      -- Total de estudiantes en el cohorte
      COUNT(DISTINCT sc.id) as total_ingresos,
      
      -- ========================================
      -- EGRESADOS (según encuesta de Seguimiento Académico)
      -- ========================================
      SUM(CASE WHEN sc.estatus_final = 'Egresado' THEN 1 ELSE 0 END) as egresados,
      ROUND(
        (SUM(CASE WHEN sc.estatus_final = 'Egresado' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_egresados,
      
      -- ========================================
      -- TITULADOS (Egresados con requisitos 3-8 completos)
      -- ========================================
      SUM(sc.es_titulado) as titulados,
      ROUND(
        (SUM(sc.es_titulado) / COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_titulados,
      
      -- ========================================
      -- SIN TÍTULO (Egresados sin completar requisitos 3-8)
      -- ========================================
      SUM(CASE 
        WHEN sc.estatus_final = 'Egresado' AND sc.es_titulado = 0
        THEN 1 ELSE 0 
      END) as sin_titulo,
      ROUND(
        (SUM(CASE 
          WHEN sc.estatus_final = 'Egresado' AND sc.es_titulado = 0
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_sin_titulo,
      
      -- ========================================
      -- SIN CONTINUAR (Bajas según encuesta)
      -- ========================================
      SUM(CASE 
        WHEN sc.estatus_final IN ('Baja Temporal', 'Baja Definitiva', 'Baja Académica')
        THEN 1 ELSE 0 
      END) as sin_continuar,
      ROUND(
        (SUM(CASE 
          WHEN sc.estatus_final IN ('Baja Temporal', 'Baja Definitiva', 'Baja Académica')
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_sin_continuar,
      
      -- ========================================
      -- INSCRITOS (según encuesta)
      -- ========================================
      SUM(CASE 
        WHEN sc.estatus_final = 'Inscrito'
        THEN 1 ELSE 0 
      END) as inscritos,
      ROUND(
        (SUM(CASE 
          WHEN sc.estatus_final = 'Inscrito'
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_inscritos,
      
      -- ========================================
      -- IRREGULARES (según encuesta)
      -- ========================================
      SUM(CASE 
        WHEN sc.estatus_final = 'Irregular'
        THEN 1 ELSE 0 
      END) as irregulares,
      ROUND(
        (SUM(CASE 
          WHEN sc.estatus_final = 'Irregular'
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_irregulares,
      
      -- ========================================
      -- MÉTRICAS ADICIONALES
      -- ========================================
      
      -- Promedio de requisitos cumplidos
      ROUND(AVG(sc.total_requisitos_cumplidos), 1) as promedio_requisitos_cumplidos,
      
      -- Estudiantes con todos los requisitos (8/8)
      SUM(CASE WHEN sc.total_requisitos_cumplidos = 8 THEN 1 ELSE 0 END) as con_todos_requisitos,
      
      -- Estudiantes sin responder encuestas
      SUM(CASE WHEN sc.estatus_final = 'Desconocido' THEN 1 ELSE 0 END) as sin_encuestas
      
    FROM student_classification sc
    GROUP BY sc.cohorte_id, sc.cohorte_nombre, sc.anio_ingreso
    ORDER BY sc.anio_ingreso ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: cohortId ? { cohortId } : {},
      type: QueryTypes.SELECT,
    });

    console.log('📊 Egresados y Titulados por Cohorte (basado en encuestas):');
    results.forEach(row => {
      console.log(`\n   🎓 Cohorte ${row.anio_cohorte} (ID: ${row.cohorte_id}):`);
      console.log(`     📌 Total Ingresos: ${row.total_ingresos}`);
      console.log(`     ✅ Egresados: ${row.egresados} (${row.pct_egresados}%)`);
      console.log(`     🏆 Titulados (6/7): ${row.titulados} (${row.pct_titulados}%)`);
      console.log(`     ⚠️  Sin Título: ${row.sin_titulo} (${row.pct_sin_titulo}%)`);
      console.log(`     ❌ Sin Continuar: ${row.sin_continuar} (${row.pct_sin_continuar}%)`);
      console.log(`     📝 Inscritos: ${row.inscritos} (${row.pct_inscritos}%)`);
      console.log(`     🔄 Irregulares: ${row.irregulares} (${row.pct_irregulares}%)`);
      console.log(`     📊 Promedio Requisitos: ${row.promedio_requisitos_cumplidos}/8`);
      console.log(`     ⭐ Con 8/8 Requisitos: ${row.con_todos_requisitos}`);
      console.log(`     ⚪ Sin Encuestas: ${row.sin_encuestas}`);
    });

    return results;
  } catch (error) {
    console.error("Error en getGraduatesAndTitledByCohort:", error);
    throw error;
  }
}

/**
 * ACTUALIZADO: 7 requisitos (eliminado Inglés Certificación)
 * Requisitos de Graduación por Cohorte
 */
async getGraduationRequirements(cohortId = null) {
  const query = `
    WITH student_requirements AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        e.estatus,
        c.id as cohorte_id,
        CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as cohorte_nombre,
        c.anio_ingreso,
        
        -- REQUISITO 1: Pagos al Corriente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'pago|cuota|adeudo|mensualidad|colegiatura'
            AND LOWER(r.respuesta_texto) REGEXP 'al corriente|pagado.*completo|sin adeudo|liquidado|cubierto|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_pagos,
        
        -- REQUISITO 2: Gastos de Titulación
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto|costo|derecho'
            AND LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|completo|realizado|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no he|aún no|todavía no|no'
          ) THEN 1 ELSE 0 
        END) as tiene_titulacion,
        
        -- REQUISITO 3: E.FIRMA Vigente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electr|fiel'
            AND LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|tramitado|actualizado|válido|obtuve|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no tengo|vencido|sin tramitar|falta|pendiente|no'
          ) THEN 1 ELSE 0 
        END) as tiene_efirma,
        
        -- REQUISITO 4: Inglés Acreditado - UNIFICADO
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'inglés|ingles|english|idioma|language|certificación.*idioma'
            AND LOWER(r.respuesta_texto) REGEXP 'acreditado|aprobado|vigente|válido|certificado|completado|obtuve|tengo|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no|pendiente|falta|aún no|todavía no|sin acreditar|reprobado'
          ) THEN 1 ELSE 0 
        END) as tiene_ingles,
        
        -- REQUISITO 5: Estancia 1
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 1|estancia i|primera estancia|estancia uno'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia1,
        
        -- REQUISITO 6: Estancia 2
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 2|estancia ii|segunda estancia|estancia dos'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia2,
        
        -- REQUISITO 7: Estadía Profesional
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estadía|estadia|estadía profesional|proyecto final'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|entregada|acreditada|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|sin terminar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_estadia
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
      ${cohortId ? "AND c.id = :cohortId" : ""}
      GROUP BY e.id, e.matricula, e.nombre, e.estatus, c.id, c.anio_ingreso, c.periodo_ingreso
    )

    SELECT 
      sr.cohorte_id,
      sr.cohorte_nombre as anio_ingreso,
      sr.anio_ingreso as anio_cohorte,
      COUNT(DISTINCT sr.id) as total_estudiantes,
      
      -- Pagos al Corriente
      SUM(CASE WHEN sr.tiene_pagos = 1 THEN 1 ELSE 0 END) as estudiantes_pagos,
      ROUND(
        (SUM(CASE WHEN sr.tiene_pagos = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_pagos,
      
      -- Gastos de Titulación
      SUM(CASE WHEN sr.tiene_titulacion = 1 THEN 1 ELSE 0 END) as estudiantes_titulacion,
      ROUND(
        (SUM(CASE WHEN sr.tiene_titulacion = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_titulacion,
      
      -- E.FIRMA Vigente
      SUM(CASE WHEN sr.tiene_efirma = 1 THEN 1 ELSE 0 END) as estudiantes_efirma,
      ROUND(
        (SUM(CASE WHEN sr.tiene_efirma = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_efirma,
      
      -- Inglés Acreditado
      SUM(CASE WHEN sr.tiene_ingles = 1 THEN 1 ELSE 0 END) as estudiantes_ingles,
      ROUND(
        (SUM(CASE WHEN sr.tiene_ingles = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_ingles,
      
      -- Estancia 1
      SUM(CASE WHEN sr.tiene_estancia1 = 1 THEN 1 ELSE 0 END) as estudiantes_estancia1,
      ROUND(
        (SUM(CASE WHEN sr.tiene_estancia1 = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_estancia1,
      
      -- Estancia 2
      SUM(CASE WHEN sr.tiene_estancia2 = 1 THEN 1 ELSE 0 END) as estudiantes_estancia2,
      ROUND(
        (SUM(CASE WHEN sr.tiene_estancia2 = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_estancia2,
      
      -- Estadía Profesional
      SUM(CASE WHEN sr.tiene_estadia = 1 THEN 1 ELSE 0 END) as estudiantes_estadia,
      ROUND(
        (SUM(CASE WHEN sr.tiene_estadia = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_estadia,
      
      -- Todos los requisitos cumplidos (7/7)
      SUM(CASE 
        WHEN sr.tiene_pagos = 1 
        AND sr.tiene_titulacion = 1 
        AND sr.tiene_efirma = 1 
        AND sr.tiene_ingles = 1
        AND sr.tiene_estancia1 = 1
        AND sr.tiene_estancia2 = 1
        AND sr.tiene_estadia = 1
        THEN 1 ELSE 0 
      END) as estudiantes_todos_requisitos,
      ROUND(
        (SUM(CASE 
          WHEN sr.tiene_pagos = 1 
          AND sr.tiene_titulacion = 1 
          AND sr.tiene_efirma = 1 
          AND sr.tiene_ingles = 1
          AND sr.tiene_estancia1 = 1
          AND sr.tiene_estancia2 = 1
          AND sr.tiene_estadia = 1
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_todos_requisitos
      
    FROM student_requirements sr
    GROUP BY sr.cohorte_id, sr.cohorte_nombre, sr.anio_ingreso
    ORDER BY sr.anio_ingreso ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: cohortId ? { cohortId } : {},
      type: QueryTypes.SELECT,
    });

    console.log('📋 Requisitos de Graduación por Cohorte (7 requisitos):');
    results.forEach(row => {
      console.log(`\n   Cohorte ${row.anio_ingreso} (ID: ${row.cohorte_id}):`);
      console.log(`     Total Estudiantes: ${row.total_estudiantes}`);
      console.log(`     Pagos al Corriente: ${row.estudiantes_pagos} (${row.pct_pagos}%)`);
      console.log(`     Gastos de Titulación: ${row.estudiantes_titulacion} (${row.pct_titulacion}%)`);
      console.log(`     E.FIRMA Vigente: ${row.estudiantes_efirma} (${row.pct_efirma}%)`);
      console.log(`     Inglés Acreditado: ${row.estudiantes_ingles} (${row.pct_ingles}%)`);
      console.log(`     Estancia 1: ${row.estudiantes_estancia1} (${row.pct_estancia1}%)`);
      console.log(`     Estancia 2: ${row.estudiantes_estancia2} (${row.pct_estancia2}%)`);
      console.log(`     Estadía: ${row.estudiantes_estadia} (${row.pct_estadia}%)`);
      console.log(`     Todos los Requisitos (7/7): ${row.estudiantes_todos_requisitos} (${row.pct_todos_requisitos}%)`);
    });

    // Transformar resultados para el frontend
    const formattedResults = results.map(row => ({
      cohorte_id: row.cohorte_id,
      anio_cohorte: row.anio_ingreso,
      total_estudiantes: row.total_estudiantes,
      pagos: {
        cantidad: row.estudiantes_pagos,
        porcentaje: parseFloat(row.pct_pagos),
      },
      titulacion: {
        cantidad: row.estudiantes_titulacion,
        porcentaje: parseFloat(row.pct_titulacion),
      },
      efirma: {
        cantidad: row.estudiantes_efirma,
        porcentaje: parseFloat(row.pct_efirma),
      },
      ingles: {
        cantidad: row.estudiantes_ingles,
        porcentaje: parseFloat(row.pct_ingles),
      },
      estancia1: {
        cantidad: row.estudiantes_estancia1,
        porcentaje: parseFloat(row.pct_estancia1),
      },
      estancia2: {
        cantidad: row.estudiantes_estancia2,
        porcentaje: parseFloat(row.pct_estancia2),
      },
      estadia: {
        cantidad: row.estudiantes_estadia,
        porcentaje: parseFloat(row.pct_estadia),
      },
      todos_requisitos: {
        cantidad: row.estudiantes_todos_requisitos,
        porcentaje: parseFloat(row.pct_todos_requisitos),
      }
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error en getGraduationRequirements:", error);
    throw error;
  }
}

/**
 * ACTUALIZADO: 7 requisitos (eliminado Inglés Certificación)
 * Estudiantes con Requisitos Incompletos
 */
async getStudentsWithIncompleteRequirements(cohortId = null) {
  const query = `
    WITH student_requirements AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        e.email,
        e.estatus,
        c.id as cohorte_id,
        CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as cohorte_nombre,
        c.anio_ingreso,
        
        -- REQUISITO 1: Pagos al Corriente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'pago|cuota|adeudo|mensualidad|colegiatura'
            AND LOWER(r.respuesta_texto) REGEXP 'al corriente|pagado.*completo|sin adeudo|liquidado|cubierto|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_pagos,
        
        -- REQUISITO 2: Gastos de Titulación
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto|costo|derecho'
            AND LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|completo|realizado|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no he|aún no|todavía no|no'
          ) THEN 1 ELSE 0 
        END) as tiene_titulacion,
        
        -- REQUISITO 3: E.FIRMA Vigente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electr|fiel'
            AND LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|tramitado|actualizado|válido|obtuve|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no tengo|vencido|sin tramitar|falta|pendiente|no'
          ) THEN 1 ELSE 0 
        END) as tiene_efirma,
        
        -- REQUISITO 4: Inglés Acreditado - UNIFICADO
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'inglés|ingles|english|idioma|language|certificación.*idioma'
            AND LOWER(r.respuesta_texto) REGEXP 'acreditado|aprobado|vigente|válido|certificado|completado|obtuve|tengo|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no|pendiente|falta|aún no|todavía no|sin acreditar|reprobado'
          ) THEN 1 ELSE 0 
        END) as tiene_ingles,
        
        -- REQUISITO 5: Estancia 1
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 1|estancia i|primera estancia|estancia uno'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia1,
        
        -- REQUISITO 6: Estancia 2
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 2|estancia ii|segunda estancia|estancia dos'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia2,
        
        -- REQUISITO 7: Estadía Profesional
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estadía|estadia|estadía profesional|proyecto final'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|entregada|acreditada|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|sin terminar|no'
          ) THEN 1 ELSE 0 
        END) as tiene_estadia
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
      ${cohortId ? "AND c.id = :cohortId" : ""}
      GROUP BY e.id, e.matricula, e.nombre, e.email, e.estatus, c.id, c.anio_ingreso, c.periodo_ingreso
    )

    SELECT 
      sr.id,
      sr.matricula,
      sr.nombre,
      sr.email,
      sr.estatus,
      sr.cohorte_id,
      sr.cohorte_nombre as anio_cohorte,
      sr.anio_ingreso,
      sr.tiene_pagos,
      sr.tiene_titulacion,
      sr.tiene_efirma,
      sr.tiene_ingles,
      sr.tiene_estancia1,
      sr.tiene_estancia2,
      sr.tiene_estadia,
      
      -- Array de requisitos faltantes
      CONCAT_WS(',',
        CASE WHEN sr.tiene_pagos = 0 THEN 'Pagos al Corriente' END,
        CASE WHEN sr.tiene_titulacion = 0 THEN 'Gastos de Titulación' END,
        CASE WHEN sr.tiene_efirma = 0 THEN 'E.FIRMA Vigente' END,
        CASE WHEN sr.tiene_ingles = 0 THEN 'Inglés Acreditado' END,
        CASE WHEN sr.tiene_estancia1 = 0 THEN 'Estancia 1' END,
        CASE WHEN sr.tiene_estancia2 = 0 THEN 'Estancia 2' END,
        CASE WHEN sr.tiene_estadia = 0 THEN 'Estadía Profesional' END
      ) as requisitos_faltantes,
      
      -- Contador de requisitos faltantes (de 7)
      (7 - (sr.tiene_pagos + sr.tiene_titulacion + sr.tiene_efirma + sr.tiene_ingles + sr.tiene_estancia1 + sr.tiene_estancia2 + sr.tiene_estadia)) as num_requisitos_faltantes
      
    FROM student_requirements sr
    WHERE NOT (
      sr.tiene_pagos = 1 
      AND sr.tiene_titulacion = 1 
      AND sr.tiene_efirma = 1 
      AND sr.tiene_ingles = 1
      AND sr.tiene_estancia1 = 1
      AND sr.tiene_estancia2 = 1
      AND sr.tiene_estadia = 1
    )
    ORDER BY num_requisitos_faltantes DESC, sr.anio_ingreso ASC, sr.matricula ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: cohortId ? { cohortId } : {},
      type: QueryTypes.SELECT,
    });

    console.log(`\n📋 Estudiantes con Requisitos Incompletos (7 requisitos): ${results.length}`);
    
    // Transformar resultados para el frontend
    const formattedResults = results.map(student => ({
      id: student.id,
      matricula: student.matricula,
      nombre: student.nombre,
      email: student.email,
      estatus: student.estatus,
      cohorte_id: student.cohorte_id,
      anio_cohorte: student.anio_cohorte,
      anio_ingreso: student.anio_ingreso,
      requisitos: {
        pagos: student.tiene_pagos === 1,
        titulacion: student.tiene_titulacion === 1,
        efirma: student.tiene_efirma === 1,
        ingles: student.tiene_ingles === 1,
        estancia1: student.tiene_estancia1 === 1,
        estancia2: student.tiene_estancia2 === 1,
        estadia: student.tiene_estadia === 1
      },
      requisitos_faltantes: student.requisitos_faltantes 
        ? student.requisitos_faltantes.split(',').filter(r => r) 
        : [],
      num_requisitos_faltantes: parseInt(student.num_requisitos_faltantes)
    }));

    return formattedResults;
  } catch (error) {
    console.error("Error en getStudentsWithIncompleteRequirements:", error);
    throw error;
  }
}

/**
 * Función principal actualizada para usar cohortId
 * ACTUALIZADO: 7 requisitos (eliminado Inglés Certificación)
 */
async getCohortCompleteData(cohortId = null) {
  try {
    console.log('📊 Iniciando análisis MEJORADO de encuestas (7 requisitos)...');
    console.log(`   Cohorte ID: ${cohortId || 'TODOS'}`);
    
    const [
      students,
      statusDistribution,
      tableData, 
      graduationRequirements, 
      graduationWithOutRequirements, 
      timeline,
      cohortComparison,
      graduationMetrics,
      cohorts
    ] = await Promise.all([
      cohortId ? this.getStudentsByYear(cohortId) : this.getAllStudents(),
      this.getStudentsStatusDistribution(cohortId),
      this.getGraduatesAndTitledByCohort(cohortId), 
      this.getGraduationRequirements(cohortId),
      this.getStudentsWithIncompleteRequirements(cohortId),
      this.getStudentsTimelineByYear(),
      this.getCohortComparisonBySemester(cohortId),
      this.getGraduationRequirementsMetrics(),
      this.getAllCohorts()
    ]);

    console.log('\n✅ RESUMEN DE ANÁLISIS (7 requisitos):');
    console.log('═══════════════════════════════════════');
    console.log(`📚 Total estudiantes: ${students.length}`);
    const totalClasificados = (statusDistribution.regular + statusDistribution.irregular);
    if (totalClasificados > 0) {
      console.log(`✔️  Regulares: ${statusDistribution.regular} (${((statusDistribution.regular/totalClasificados)*100).toFixed(1)}%)`);
      console.log(`⚠️  Irregulares: ${statusDistribution.irregular} (${((statusDistribution.irregular/totalClasificados)*100).toFixed(1)}%)`);
    } else {
      console.log(`✔️  Regulares: ${statusDistribution.regular}`);
      console.log(`⚠️  Irregulares: ${statusDistribution.irregular}`);
    }
    console.log(`🎓 Egresados (7/7 requisitos): ${graduationMetrics.estudiantes_egresados}`);
    console.log(`📈 Próximos a egresar: ${graduationMetrics.estudiantes_proximo_egreso}`);
    console.log('═══════════════════════════════════════\n');

    return {
      students,
      statusDistribution,
      tableData, 
      graduationRequirements, 
      graduationWithOutRequirements, 
      timeline,
      cohortComparison,
      graduationMetrics,
      cohorts
    };
  } catch (error) {
    console.error("❌ Error al obtener datos desde encuestas:", error);
    throw error;
  }
}
  // ========================================
  // MÉTODOS DE MODELO SEQUELIZE (sin cambios)
  // ========================================

  async getStudentByMatricula(matricula) {
    const { estudianteModel } = this.getModel();
    try {
      return await estudianteModel.findOne({ where: { matricula } });
    } catch (error) {
      console.error("Error al obtener estudiante por matrícula:", error);
      throw error;
    }
  }

  async getStudentById(id) {
    const { estudianteModel } = this.getModel();
    try {
      return await estudianteModel.findByPk(id);
    } catch (error) {
      console.error("Error al obtener estudiante por ID:", error);
      throw error;
    }
  }

  async updateStudentStatus(id, nuevoEstatus) {
    const { estudianteModel } = this.getModel();
    try {
      const [updatedRows] = await estudianteModel.update(
        { estatus: nuevoEstatus },
        { where: { id } }
      );
      return updatedRows > 0;
    } catch (error) {
      console.error("Error al actualizar estatus del estudiante:", error);
      throw error;
    }
  }

  async getStudentsByStatus(estatus) {
    const { estudianteModel } = this.getModel();
    try {
      return await estudianteModel.findAll({ where: { estatus } });
    } catch (error) {
      console.error("Error al obtener estudiantes por estatus:", error);
      throw error;
    }
  }
}

module.exports = EstudianteRepositoryCohorte;
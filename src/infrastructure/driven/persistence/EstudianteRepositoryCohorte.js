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
            OR estatus_autodeclarado REGEXP '^regular$'
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
 * Identifica estudiantes en riesgo de deserción o bajo rendimiento
 * Basado en encuesta "Seguimiento Académico"
 * @param {string|null} cohorteId - ID del cohorte (opcional)
 * @returns {Promise<Object>} Estudiantes en riesgo con sus factores y recomendaciones
 */
async getStudentsAtRisk(cohorteId = null) {
  try {
    const query = `
      WITH respuestas_seguimiento AS (
        SELECT 
          e.id as estudiante_id,
          e.matricula,
          e.nombre,
          e.email,
          c.id as cohorte_id,
          CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as cohorte_nombre,
          
          -- Datos académicos
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'qué cuatrimestre.*encuentras|cuatrimestre.*actual'
            AND r.respuesta_texto REGEXP '^[0-9]+$'
            THEN CAST(r.respuesta_texto AS UNSIGNED)
            ELSE NULL
          END) as cuatrimestre_actual,
          
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'promedio general|promedio.*actual'
            AND r.respuesta_texto REGEXP '^[0-9]+(\\.[0-9]+)?$'
            THEN CAST(r.respuesta_texto AS DECIMAL(3,2))
            ELSE NULL
          END) as promedio_general,
          
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'has reprobado|reprobado.*materia'
            THEN LOWER(r.respuesta_texto)
            ELSE NULL
          END) as ha_reprobado,
          
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'cuántas.*reprobado|reprobado.*cuántas'
            AND r.respuesta_texto REGEXP '^[0-9]+$'
            THEN CAST(r.respuesta_texto AS UNSIGNED)
            ELSE 0
          END) as num_reprobadas,
          
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'materias pendientes|pendientes.*cuatrimestres anteriores'
            THEN LOWER(r.respuesta_texto)
            ELSE NULL
          END) as tiene_pendientes,
          
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'cursando.*recursada|materias recursada'
            THEN LOWER(r.respuesta_texto)
            ELSE NULL
          END) as cursando_recursadas,
          
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'satisfecho.*desempeño'
            THEN LOWER(r.respuesta_texto)
            ELSE NULL
          END) as nivel_satisfaccion,
          
          MAX(CASE 
            WHEN LOWER(p.title) REGEXP 'calificas.*desempeño académico'
            THEN LOWER(r.respuesta_texto)
            ELSE NULL
          END) as autoevaluacion
          
        FROM estudiantes e
        INNER JOIN cohortes c ON e.cohorte_id = c.id
        INNER JOIN participaciones pa ON e.id = pa.id_estudiante
        INNER JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
        INNER JOIN respuestas r ON pa.id_participacion = r.id_participacion
        INNER JOIN preguntas p ON r.id_pregunta = p.id_pregunta
        WHERE 
          pa.estatus = 'completada'
          AND enc.titulo = 'Seguimiento Académico'
          ${cohorteId ? "AND c.id = :cohortId" : ""}
        GROUP BY e.id, e.matricula, e.nombre, e.email, c.id, c.anio_ingreso, c.periodo_ingreso
      ),
      
      calculo_riesgo AS (
        SELECT 
          *,
          -- Calcular puntos de riesgo (máximo: 12 puntos)
          (
            -- Promedio bajo (peso alto: 3 puntos)
            CASE WHEN promedio_general < 7.0 THEN 3 ELSE 0 END +
            
            -- Ha reprobado materias (peso medio: 2 puntos)
            CASE WHEN LOWER(ha_reprobado) REGEXP '^si$|^sí$|^s$' THEN 2 ELSE 0 END +
            
            -- Múltiples reprobaciones (peso medio: 2 puntos)
            CASE WHEN num_reprobadas >= 2 THEN 2 ELSE 0 END +
            
            -- Tiene materias pendientes (peso bajo: 1 punto)
            CASE WHEN LOWER(tiene_pendientes) REGEXP '^si$|^sí$|^s$' THEN 1 ELSE 0 END +
            
            -- Está cursando recursadas (peso bajo: 1 punto)
            CASE WHEN LOWER(cursando_recursadas) REGEXP '^si$|^sí$|^s$' THEN 1 ELSE 0 END +
            
            -- Baja satisfacción (peso medio: 2 puntos)
            CASE WHEN LOWER(nivel_satisfaccion) REGEXP 'insatisfecho|poco.*satisfecho' THEN 2 ELSE 0 END +
            
            -- Autoevaluación baja (peso bajo: 1 punto)
            CASE WHEN LOWER(autoevaluacion) REGEXP 'suficiente' THEN 1 ELSE 0 END
          ) as puntos_riesgo
        FROM respuestas_seguimiento
      ),
      
      clasificacion_riesgo AS (
        SELECT 
          *,
          -- Clasificar nivel de riesgo
          CASE 
            WHEN puntos_riesgo >= 6 THEN 'alto'
            WHEN puntos_riesgo >= 3 THEN 'medio'
            ELSE 'bajo'
          END as nivel_riesgo,
          
          -- Identificar factores de riesgo específicos (sin comas vacías)
          TRIM(BOTH ', ' FROM CONCAT_WS(', ',
            CASE WHEN promedio_general < 7.0 THEN 'Promedio bajo' ELSE NULL END,
            CASE WHEN LOWER(ha_reprobado) REGEXP '^si$|^sí$|^s$' THEN 'Materias reprobadas' ELSE NULL END,
            CASE WHEN num_reprobadas >= 2 THEN 'Múltiples reprobaciones' ELSE NULL END,
            CASE WHEN LOWER(tiene_pendientes) REGEXP '^si$|^sí$|^s$' THEN 'Materias pendientes' ELSE NULL END,
            CASE WHEN LOWER(cursando_recursadas) REGEXP '^si$|^sí$|^s$' THEN 'Cursando recursadas' ELSE NULL END,
            CASE WHEN LOWER(nivel_satisfaccion) REGEXP 'insatisfecho|poco.*satisfecho' THEN 'Baja satisfacción' ELSE NULL END,
            CASE WHEN LOWER(autoevaluacion) REGEXP 'suficiente' THEN 'Autoevaluación baja' ELSE NULL END
          )) as factores_riesgo
          
        FROM calculo_riesgo
      )
      
      SELECT 
        estudiante_id,
        matricula,
        nombre,
        email,
        cohorte_id,
        cohorte_nombre,
        cuatrimestre_actual,
        promedio_general,
        num_reprobadas,
        nivel_riesgo,
        puntos_riesgo,
        IFNULL(factores_riesgo, 'Sin factores identificados') as factores_riesgo
      FROM clasificacion_riesgo
      WHERE nivel_riesgo IN ('alto', 'medio')
      ORDER BY 
        CASE nivel_riesgo 
          WHEN 'alto' THEN 1 
          WHEN 'medio' THEN 2 
          ELSE 3 
        END,
        puntos_riesgo DESC,
        promedio_general ASC
    `;

    const results = await sequelize.query(query, {
      replacements: cohorteId ? { cohortId: cohorteId } : {},
      type: QueryTypes.SELECT,
    });

    // Resumen por nivel de riesgo
    const resumen = {
      alto_riesgo: results.filter(r => r.nivel_riesgo === 'alto').length,
      medio_riesgo: results.filter(r => r.nivel_riesgo === 'medio').length,
      total_en_riesgo: results.length
    };

    console.log('\n⚠️  ESTUDIANTES EN RIESGO:');
    console.log('═══════════════════════════════════════');
    console.log(`   Cohorte: ${cohorteId || 'TODOS'}`);
    console.log(`   🔴 Alto Riesgo: ${resumen.alto_riesgo} estudiantes`);
    console.log(`   🟡 Riesgo Medio: ${resumen.medio_riesgo} estudiantes`);
    console.log(`   📊 Total en Riesgo: ${resumen.total_en_riesgo} estudiantes`);
    console.log('═══════════════════════════════════════\n');

    const response = {
      success: true,
      cohorte_id: cohorteId,
      resumen,
      estudiantes_en_riesgo: results.map(estudiante => ({
        id: estudiante.estudiante_id,
        matricula: estudiante.matricula,
        nombre: estudiante.nombre,
        email: estudiante.email,
        cohorte_id: estudiante.cohorte_id,
        cohorte_nombre: estudiante.cohorte_nombre,
        cuatrimestre: estudiante.cuatrimestre_actual,
        promedio: estudiante.promedio_general ? parseFloat(estudiante.promedio_general) : null,
        materias_reprobadas: estudiante.num_reprobadas || 0,
        nivel_riesgo: estudiante.nivel_riesgo,
        puntos_riesgo: estudiante.puntos_riesgo,
        factores: estudiante.factores_riesgo && estudiante.factores_riesgo !== 'Sin factores identificados' 
          ? estudiante.factores_riesgo.split(', ').filter(f => f && f.trim() !== '') 
          : [],
        acciones_recomendadas: this.obtenerAccionesRecomendadas(
          estudiante.nivel_riesgo, 
          estudiante.puntos_riesgo
        )
      }))
    };

    return response;
    
  } catch (error) {
    console.error('❌ Error al obtener estudiantes en riesgo:', error);
    throw error;
  }
}

/**
 * Función auxiliar para generar recomendaciones según nivel de riesgo
 * @param {string} nivelRiesgo - 'alto', 'medio' o 'bajo'
 * @param {number} puntosRiesgo - Puntos de riesgo acumulados
 * @returns {Array<string>} Lista de acciones recomendadas
 */
obtenerAccionesRecomendadas(nivelRiesgo, puntosRiesgo) {
  const acciones = [];
  
  // Acciones para ALTO RIESGO (>= 6 puntos)
  if (nivelRiesgo === 'alto') {
    acciones.push('🚨 Asignar tutor académico inmediatamente');
    acciones.push('📞 Contactar al estudiante en las próximas 48 horas');
    acciones.push('🎯 Programar sesión de orientación vocacional urgente');
    acciones.push('📚 Evaluar necesidad de asesorías personalizadas');
    acciones.push('🔍 Investigar causas de bajo rendimiento (factores personales, económicos, etc.)');
  }
  
  // Acciones para MEDIO RIESGO (3-5 puntos)
  if (nivelRiesgo === 'medio' || nivelRiesgo === 'alto') {
    acciones.push('📧 Enviar recordatorio de recursos académicos disponibles');
    acciones.push('📊 Monitorear desempeño en el próximo cuatrimestre');
    acciones.push('👥 Incluir en grupos de estudio o tutorías grupales');
  }
  
  // Acciones específicas según puntos de riesgo
  if (puntosRiesgo >= 8) {
    acciones.push('⚠️  Considerar intervención del coordinador académico');
    acciones.push('📋 Evaluar posibilidad de plan de regularización integral');
  } else if (puntosRiesgo >= 4) {
    acciones.push('📝 Considerar plan de regularización académica');
  }
  
  // Siempre incluir seguimiento
  if (nivelRiesgo === 'alto' || nivelRiesgo === 'medio') {
    acciones.push('🗓️  Agendar revisión de progreso en 4 semanas');
  }
  
  return acciones;
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
            OR estatus_autodeclarado REGEXP '^regular$'
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
 * Obtiene egresados y titulados evaluando 8 requisitos desde 5 encuestas
 * 
 * NUEVO: Manejo de estatus mejorado con opciones:
 * - Regular, Irregular → Cuentan como "Inscrito"
 * - Egresado, Titulado, Sin título → Categorías independientes
 * - Baja temporal → Categoría independiente
 * - INACTIVO → Estudiantes sin responder encuestas de seguimiento ni requisitos
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
          THEN LOWER(TRIM(r.respuesta_texto))
          ELSE NULL
        END) as estatus_academico,
        
        -- ========================================
        -- INDICADOR: ¿Respondió Seguimiento Académico?
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Seguimiento Académico'
          AND pa.estatus = 'completada'
          THEN 1 
          ELSE 0 
        END) as respondio_seguimiento,
        
        -- ========================================
        -- INDICADOR: ¿Respondió Requisitos de Titulación?
        -- ========================================
        MAX(CASE 
          WHEN enc.titulo = 'Requisitos de Titulación'
          AND pa.estatus = 'completada'
          THEN 1 
          ELSE 0 
        END) as respondio_requisitos,
        
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
        
        -- ========================================
        -- CLASIFICACIÓN DE ESTATUS MEJORADA
        -- ========================================
        CASE 
          -- ⚠️ INACTIVO (NUEVA PRIORIDAD MÁXIMA)
          -- Si NO respondió ni Seguimiento Académico ni Requisitos de Titulación
          WHEN ssr.respondio_seguimiento = 0 AND ssr.respondio_requisitos = 0 
          THEN 'Inactivo'
          
          -- ✅ TITULADO (prioridad alta)
          WHEN ssr.estatus_academico REGEXP 'titulado' THEN 'Titulado'
          
          -- ✅ EGRESADO (no necesariamente titulado)
          WHEN ssr.estatus_academico REGEXP 'egresado' THEN 'Egresado'
          
          -- ✅ SIN TÍTULO (egresado pero declaró explícitamente que no tiene título)
          WHEN ssr.estatus_academico REGEXP 'sin.*título|sint.*titulo|sin_titulo' THEN 'Sin Título'
          
          -- ✅ INSCRITO (incluye Regular e Irregular)
          WHEN ssr.estatus_academico REGEXP 'regular|irregular|inscrito' THEN 'Inscrito'
          
          -- ✅ BAJA TEMPORAL
          WHEN ssr.estatus_academico REGEXP 'baja.*temporal|baja_temporal' THEN 'Baja Temporal'
          
          -- ✅ BAJA DEFINITIVA
          WHEN ssr.estatus_academico REGEXP 'baja' THEN 'Baja Definitiva'
          
          -- ⚠️ DESCONOCIDO (respondió encuestas pero sin estatus claro)
          ELSE 'Desconocido'
        END as estatus_final,
        
        -- ========================================
        -- SUB-CLASIFICACIÓN DE INSCRITOS
        -- ========================================
        CASE 
          WHEN ssr.estatus_academico REGEXP 'regular' THEN 'Regular'
          WHEN ssr.estatus_academico REGEXP 'irregular' THEN 'Irregular'
          WHEN ssr.estatus_academico REGEXP 'inscrito' THEN 'Inscrito (sin especificar)'
          ELSE NULL
        END as tipo_inscrito,
        
        -- ========================================
        -- CALCULAR REQUISITOS CUMPLIDOS (de los 8)
        -- ========================================
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
        
        -- ========================================
        -- VALIDACIÓN DE TITULADO
        -- Un estudiante es TITULADO si:
        -- 1. Se declaró como "Titulado" en encuesta, O
        -- 2. Es "Egresado" Y cumple los 6 requisitos de titulación (3-8)
        -- ========================================
        CASE 
          -- Opción 1: Se autodeclaró como Titulado
          WHEN ssr.estatus_academico REGEXP 'titulado' THEN 1
          
          -- Opción 2: Es Egresado con requisitos 3-8 completos
          WHEN ssr.estatus_academico REGEXP 'egresado'
          AND ssr.tiene_gastos_titulacion = 1
          AND ssr.tiene_efirma_vigente = 1
          AND ssr.tiene_estancia1_liberada = 1
          AND ssr.tiene_estancia2_liberada = 1
          AND ssr.tiene_ingles_acreditado = 1
          AND ssr.tiene_estadia_liberada = 1
          THEN 1
          
          ELSE 0 
        END as es_titulado_validado
        
      FROM student_survey_requirements ssr
    )

    SELECT 
      sc.cohorte_id,
      sc.cohorte_nombre as anio_cohorte,
      sc.anio_ingreso,
      
      -- ========================================
      -- TOTAL DE ESTUDIANTES
      -- ========================================
      COUNT(DISTINCT sc.id) as total_ingresos,
      
      -- ========================================
      -- TITULADOS (autodeclarados o egresados con requisitos)
      -- ========================================
      SUM(CASE WHEN sc.estatus_final = 'Titulado' OR sc.es_titulado_validado = 1 THEN 1 ELSE 0 END) as titulados,
      ROUND(
        (SUM(CASE WHEN sc.estatus_final = 'Titulado' OR sc.es_titulado_validado = 1 THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_titulados,
      
      -- ========================================
      -- EGRESADOS (incluye los que son titulados)
      -- ========================================
      SUM(CASE WHEN sc.estatus_final IN ('Egresado', 'Titulado') THEN 1 ELSE 0 END) as egresados,
      ROUND(
        (SUM(CASE WHEN sc.estatus_final IN ('Egresado', 'Titulado') THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_egresados,
      
      -- ========================================
      -- SIN TÍTULO (egresados que NO son titulados)
      -- ========================================
      SUM(CASE 
        WHEN sc.estatus_final = 'Sin Título' 
        OR (sc.estatus_final = 'Egresado' AND sc.es_titulado_validado = 0)
        THEN 1 ELSE 0 
      END) as sin_titulo,
      ROUND(
        (SUM(CASE 
          WHEN sc.estatus_final = 'Sin Título' 
          OR (sc.estatus_final = 'Egresado' AND sc.es_titulado_validado = 0)
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_sin_titulo,
      
      -- ========================================
      -- INSCRITOS (Regular + Irregular + Inscrito)
      -- ========================================
      SUM(CASE WHEN sc.estatus_final = 'Inscrito' THEN 1 ELSE 0 END) as inscritos,
      ROUND(
        (SUM(CASE WHEN sc.estatus_final = 'Inscrito' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_inscritos,
      
      -- ========================================
      -- INSCRITOS REGULARES (desglose)
      -- ========================================
      SUM(CASE WHEN sc.tipo_inscrito = 'Regular' THEN 1 ELSE 0 END) as inscritos_regulares,
      ROUND(
        (SUM(CASE WHEN sc.tipo_inscrito = 'Regular' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_inscritos_regulares,
      
      -- ========================================
      -- INSCRITOS IRREGULARES (desglose)
      -- ========================================
      SUM(CASE WHEN sc.tipo_inscrito = 'Irregular' THEN 1 ELSE 0 END) as inscritos_irregulares,
      ROUND(
        (SUM(CASE WHEN sc.tipo_inscrito = 'Irregular' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_inscritos_irregulares,
      
      -- ========================================
      -- BAJAS TEMPORALES
      -- ========================================
      SUM(CASE WHEN sc.estatus_final = 'Baja Temporal' THEN 1 ELSE 0 END) as baja_temporal,
      ROUND(
        (SUM(CASE WHEN sc.estatus_final = 'Baja Temporal' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_baja_temporal,
      
      -- ========================================
      -- SIN CONTINUAR (Baja Temporal + Baja Definitiva)
      -- ========================================
      SUM(CASE 
        WHEN sc.estatus_final IN ('Baja Temporal', 'Baja Definitiva')
        THEN 1 ELSE 0 
      END) as sin_continuar,
      ROUND(
        (SUM(CASE 
          WHEN sc.estatus_final IN ('Baja Temporal', 'Baja Definitiva')
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_sin_continuar,
      
      -- ========================================
      -- INACTIVOS (NUEVO) ✅
      -- Estudiantes sin responder encuestas críticas
      -- ========================================
      SUM(CASE WHEN sc.estatus_final = 'Inactivo' THEN 1 ELSE 0 END) as inactivos,
      ROUND(
        (SUM(CASE WHEN sc.estatus_final = 'Inactivo' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT sc.id) * 100), 1
      ) as pct_inactivos,
      
      -- ========================================
      -- MÉTRICAS ADICIONALES
      -- ========================================
      
      -- Promedio de requisitos cumplidos
      ROUND(AVG(sc.total_requisitos_cumplidos), 1) as promedio_requisitos_cumplidos,
      
      -- Estudiantes con todos los requisitos (8/8)
      SUM(CASE WHEN sc.total_requisitos_cumplidos = 8 THEN 1 ELSE 0 END) as con_todos_requisitos,
      
      -- Estudiantes sin responder encuestas (Desconocido)
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

    console.log('📊 Egresados y Titulados por Cohorte (ACTUALIZADO - basado en encuestas):');
    results.forEach(row => {
      console.log(`\n   🎓 Cohorte ${row.anio_cohorte} (ID: ${row.cohorte_id}):`);
      console.log(`     📌 Total Ingresos: ${row.total_ingresos}`);
      console.log(`\n   ✅ GRADUADOS:`);
      console.log(`      🏆 Titulados: ${row.titulados} (${row.pct_titulados}%)`);
      console.log(`      📜 Egresados (total): ${row.egresados} (${row.pct_egresados}%)`);
      console.log(`      ⚠️  Sin Título: ${row.sin_titulo} (${row.pct_sin_titulo}%)`);
      console.log(`\n   📝 ACTIVOS:`);
      console.log(`      👥 Inscritos (total): ${row.inscritos} (${row.pct_inscritos}%)`);
      console.log(`         ✔️  Regular: ${row.inscritos_regulares} (${row.pct_inscritos_regulares}%)`);
      console.log(`         ❌ Irregular: ${row.inscritos_irregulares} (${row.pct_inscritos_irregulares}%)`);
      console.log(`\n   ⏸️  BAJAS:`);
      console.log(`      🔄 Baja Temporal: ${row.baja_temporal} (${row.pct_baja_temporal}%)`);
      console.log(`      🚫 Sin Continuar (total): ${row.sin_continuar} (${row.pct_sin_continuar}%)`);
      console.log(`\n   ⚪ INACTIVOS:`);
      console.log(`      💤 Inactivos: ${row.inactivos} (${row.pct_inactivos}%)`);
      console.log(`\n   📊 MÉTRICAS:`);
      console.log(`      • Promedio Requisitos: ${row.promedio_requisitos_cumplidos}/8`);
      console.log(`      • Con 8/8 Requisitos: ${row.con_todos_requisitos}`);
      console.log(`      • Desconocidos: ${row.sin_encuestas}`);
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
/**



/**
 * VERSIÓN FINAL CORREGIDA
 * Cuando cohortId = null, devuelve UN SOLO OBJETO con datos agregados de TODOS los cohortes
 * Cuando cohortId = específico, devuelve array con ese cohorte
 */
async getGraduationRequirements(cohortId = null) {
  const query = `
    WITH todos_estudiantes AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        e.estatus,
        c.id as cohorte_id,
        CONCAT(c.anio_ingreso, '-', c.periodo_ingreso) as cohorte_nombre,
        c.anio_ingreso
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      WHERE 1=1
        ${cohortId ? "AND c.id = :cohortId" : ""}
    ),
    
    student_requirements AS (
      SELECT 
        te.id,
        te.matricula,
        te.nombre,
        te.estatus,
        te.cohorte_id,
        te.cohorte_nombre,
        te.anio_ingreso,
        
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'pago|cuota|adeudo|mensualidad|colegiatura'
            AND LOWER(r.respuesta_texto) REGEXP 'al corriente|pagado.*completo|sin adeudo|liquidado|cubierto|^sí$|^si$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar|^no$'
          ) THEN 1 ELSE 0 
        END) as tiene_pagos,
        
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto|costo|derecho'
            AND LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|completo|realizado|^sí$|^si$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no he|aún no|todavía no|^no$'
          ) THEN 1 ELSE 0 
        END) as tiene_titulacion,
        
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electr|fiel'
            AND LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|tramitado|actualizado|válido|obtuve|^sí$|^si$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no tengo|vencido|sin tramitar|falta|pendiente|^no$'
          ) THEN 1 ELSE 0 
        END) as tiene_efirma,
        
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'inglés|ingles|english|idioma|language|certificación.*idioma|acreditado.*nivel.*inglés'
            AND LOWER(r.respuesta_texto) REGEXP 'acreditado|aprobado|vigente|válido|certificado|completado|obtuve|tengo|^sí$|^si$'
            AND LOWER(r.respuesta_texto) NOT REGEXP '^no$|pendiente|falta|aún no|todavía no|sin acreditar|reprobado|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_ingles,
        
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 1|estancia i|primera estancia|estancia uno|liberado.*estancia 1'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|^sí$|^si$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|^no$|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia1,
        
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 2|estancia ii|segunda estancia|estancia dos|liberado.*estancia 2'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|^sí$|^si$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|^no$|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia2,
        
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estadía|estadia|estadía profesional|proyecto final|liberado.*estadía'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|entregada|acreditada|^sí$|^si$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|sin terminar|^no$|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_estadia
        
      FROM todos_estudiantes te
      LEFT JOIN participaciones pa ON te.id = pa.id_estudiante
        AND pa.estatus = 'completada'
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      GROUP BY te.id, te.matricula, te.nombre, te.estatus, te.cohorte_id, te.cohorte_nombre, te.anio_ingreso
    )

    SELECT 
      ${cohortId ? `
        sr.cohorte_id,
        sr.cohorte_nombre as anio_ingreso,
        sr.anio_ingreso as anio_cohorte,
      ` : `
        NULL as cohorte_id,
        'Todos' as anio_ingreso,
        NULL as anio_cohorte,
      `}
      COUNT(DISTINCT sr.id) as total_estudiantes,
      
      -- Pagos al Corriente
      SUM(CASE WHEN sr.tiene_pagos = 1 THEN 1 ELSE 0 END) as estudiantes_pagos,
      ROUND(
        (SUM(CASE WHEN sr.tiene_pagos = 1 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
      ) as pct_pagos,
      
      -- Gastos de Titulación
      SUM(CASE WHEN sr.tiene_titulacion = 1 THEN 1 ELSE 0 END) as estudiantes_titulacion,
      ROUND(
        (SUM(CASE WHEN sr.tiene_titulacion = 1 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
      ) as pct_titulacion,
      
      -- E.FIRMA Vigente
      SUM(CASE WHEN sr.tiene_efirma = 1 THEN 1 ELSE 0 END) as estudiantes_efirma,
      ROUND(
        (SUM(CASE WHEN sr.tiene_efirma = 1 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
      ) as pct_efirma,
      
      -- Inglés Acreditado
      SUM(CASE WHEN sr.tiene_ingles = 1 THEN 1 ELSE 0 END) as estudiantes_ingles,
      ROUND(
        (SUM(CASE WHEN sr.tiene_ingles = 1 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
      ) as pct_ingles,
      
      -- Estancia 1
      SUM(CASE WHEN sr.tiene_estancia1 = 1 THEN 1 ELSE 0 END) as estudiantes_estancia1,
      ROUND(
        (SUM(CASE WHEN sr.tiene_estancia1 = 1 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
      ) as pct_estancia1,
      
      -- Estancia 2
      SUM(CASE WHEN sr.tiene_estancia2 = 1 THEN 1 ELSE 0 END) as estudiantes_estancia2,
      ROUND(
        (SUM(CASE WHEN sr.tiene_estancia2 = 1 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
      ) as pct_estancia2,
      
      -- Estadía Profesional
      SUM(CASE WHEN sr.tiene_estadia = 1 THEN 1 ELSE 0 END) as estudiantes_estadia,
      ROUND(
        (SUM(CASE WHEN sr.tiene_estadia = 1 THEN 1 ELSE 0 END) / 
         NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
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
        END) / NULLIF(COUNT(DISTINCT sr.id), 0) * 100), 2
      ) as pct_todos_requisitos
      
    FROM student_requirements sr
    ${cohortId ? `
      GROUP BY sr.cohorte_id, sr.cohorte_nombre, sr.anio_ingreso
      ORDER BY sr.anio_ingreso ASC
    ` : `
      -- Sin GROUP BY: agrega TODOS los cohortes en una sola fila
    `}
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: cohortId ? { cohortId } : {},
      type: QueryTypes.SELECT,
    });

    if (cohortId) {
      console.log('📋 Requisitos de Graduación - COHORTE ESPECÍFICO:');
      results.forEach(row => {
        console.log(`   Cohorte ${row.anio_ingreso} (ID: ${row.cohorte_id}):`);
        console.log(`     Total: ${row.total_estudiantes}`);
        console.log(`     Estancia 1: ${row.estudiantes_estancia1} (${row.pct_estancia1}%)`);
        console.log(`     Estancia 2: ${row.estudiantes_estancia2} (${row.pct_estancia2}%)`);
        console.log(`     Estadía: ${row.estudiantes_estadia} (${row.pct_estadia}%)`);
      });
    } else {
      console.log('📋 Requisitos de Graduación - TODOS LOS COHORTES (AGREGADO):');
      const row = results[0];
      console.log(`   Total estudiantes: ${row.total_estudiantes}`);
      console.log(`   Pagos: ${row.estudiantes_pagos} (${row.pct_pagos}%)`);
      console.log(`   Titulación: ${row.estudiantes_titulacion} (${row.pct_titulacion}%)`);
      console.log(`   E.FIRMA: ${row.estudiantes_efirma} (${row.pct_efirma}%)`);
      console.log(`   Inglés: ${row.estudiantes_ingles} (${row.pct_ingles}%)`);
      console.log(`   Estancia 1: ${row.estudiantes_estancia1} (${row.pct_estancia1}%)`);
      console.log(`   Estancia 2: ${row.estudiantes_estancia2} (${row.pct_estancia2}%)`);
      console.log(`   Estadía: ${row.estudiantes_estadia} (${row.pct_estadia}%)`);
    }

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
 * ACTUALIZADO: Estudiantes con Requisitos Incompletos - TODOS los estudiantes
 * Incluye categoría "sin_datos" para estudiantes sin encuestas de requisitos
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
            AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar|^no$'
          ) THEN 1 ELSE 0 
        END) as tiene_pagos,
        
        -- REQUISITO 2: Gastos de Titulación
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto|costo|derecho'
            AND LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|completo|realizado|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no he|aún no|todavía no|^no$'
          ) THEN 1 ELSE 0 
        END) as tiene_titulacion,
        
        -- REQUISITO 3: E.FIRMA Vigente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electr|fiel'
            AND LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|tramitado|actualizado|válido|obtuve|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no tengo|vencido|sin tramitar|falta|pendiente|^no$'
          ) THEN 1 ELSE 0 
        END) as tiene_efirma,
        
        -- REQUISITO 4: Inglés Acreditado - UNIFICADO
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'inglés|ingles|english|idioma|language|certificación.*idioma|acreditado.*nivel.*inglés'
            AND LOWER(r.respuesta_texto) REGEXP 'acreditado|aprobado|vigente|válido|certificado|completado|obtuve|tengo|^si$|^sí$'
            AND LOWER(r.respuesta_texto) NOT REGEXP '^no$|pendiente|falta|aún no|todavía no|sin acreditar|reprobado|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_ingles,
        
        -- REQUISITO 5: Estancia 1
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 1|estancia i|primera estancia|estancia uno|liberado.*estancia 1'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|^si$|^sí$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|^no$|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia1,
        
        -- REQUISITO 6: Estancia 2
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estancia 2|estancia ii|segunda estancia|estancia dos|liberado.*estancia 2'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|acreditada|^si$|^sí$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|^no$|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_estancia2,
        
        -- REQUISITO 7: Estadía Profesional
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'estadía|estadia|estadía profesional|proyecto final|liberado.*estadía'
            AND LOWER(r.respuesta_texto) REGEXP 'completada|terminada|liberada|aprobada|cubierta|finalizada|entregada|acreditada|^si$|^sí$'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|incompleta|no he|sin liberar|sin terminar|^no$|proceso'
          ) THEN 1 ELSE 0 
        END) as tiene_estadia,
        
        -- Indicador de si tiene respuestas
        COUNT(r.id_respuesta) as total_respuestas
        
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      -- ✅ LEFT JOIN para incluir TODOS los estudiantes
      LEFT JOIN participaciones pa ON e.id = pa.id_estudiante
        AND pa.estatus = 'completada'
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
        AND (
          -- Encuesta de Seguimiento Académico
          enc.titulo REGEXP 'Seguimiento.*Académico|seguimiento.*academico'
          -- Encuesta de Estancia 1
          OR enc.titulo REGEXP 'Estancia.*1|estancia.*i|Primera.*Estancia'
          -- Encuesta de Estancia 2
          OR enc.titulo REGEXP 'Estancia.*2|estancia.*ii|Segunda.*Estancia'
          -- Encuesta de Estadía Profesional
          OR enc.titulo REGEXP 'Estadía.*Profesional|estadia.*profesional|Estadía'
          -- Encuesta de Requisitos de Titulación
          OR enc.titulo REGEXP 'Requisitos.*Titulación|requisitos.*titulacion|Requisitos.*Graduación'
        )
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE 1=1
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
      sr.total_respuestas,
      
      -- Clasificación: sin_datos, incompleto
      CASE 
        WHEN sr.total_respuestas = 0 THEN 'sin_datos'
        ELSE 'incompleto'
      END as categoria,
      
      -- Array de requisitos faltantes
      CASE 
        WHEN sr.total_respuestas = 0 THEN 'Sin datos de encuestas'
        ELSE CONCAT_WS(',',
          CASE WHEN sr.tiene_pagos = 0 THEN 'Pagos al Corriente' END,
          CASE WHEN sr.tiene_titulacion = 0 THEN 'Gastos de Titulación' END,
          CASE WHEN sr.tiene_efirma = 0 THEN 'E.FIRMA Vigente' END,
          CASE WHEN sr.tiene_ingles = 0 THEN 'Inglés Acreditado' END,
          CASE WHEN sr.tiene_estancia1 = 0 THEN 'Estancia 1' END,
          CASE WHEN sr.tiene_estancia2 = 0 THEN 'Estancia 2' END,
          CASE WHEN sr.tiene_estadia = 0 THEN 'Estadía Profesional' END
        )
      END as requisitos_faltantes,
      
      -- Contador de requisitos faltantes (de 7)
      CASE 
        WHEN sr.total_respuestas = 0 THEN 7  -- Sin datos = le faltan todos
        ELSE (7 - (sr.tiene_pagos + sr.tiene_titulacion + sr.tiene_efirma + 
                   sr.tiene_ingles + sr.tiene_estancia1 + sr.tiene_estancia2 + sr.tiene_estadia))
      END as num_requisitos_faltantes
      
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
    ORDER BY 
      CASE WHEN sr.total_respuestas = 0 THEN 1 ELSE 0 END,  -- Sin datos al final
      num_requisitos_faltantes DESC, 
      sr.anio_ingreso ASC, 
      sr.matricula ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: cohortId ? { cohortId } : {},
      type: QueryTypes.SELECT,
    });

    const sinDatos = results.filter(r => r.categoria === 'sin_datos').length;
    const incompletos = results.filter(r => r.categoria === 'incompleto').length;

    console.log(`\n📋 Estudiantes con Requisitos Incompletos (7 requisitos): ${results.length}`);
    console.log(`   • Con datos incompletos: ${incompletos}`);
    console.log(`   • Sin datos: ${sinDatos}`);
    
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
      categoria: student.categoria,  // 'sin_datos' o 'incompleto'
      requisitos: {
        pagos: student.tiene_pagos === 1,
        titulacion: student.tiene_titulacion === 1,
        efirma: student.tiene_efirma === 1,
        ingles: student.tiene_ingles === 1,
        estancia1: student.tiene_estancia1 === 1,
        estancia2: student.tiene_estancia2 === 1,
        estadia: student.tiene_estadia === 1
      },
      requisitos_faltantes: student.categoria === 'sin_datos' 
        ? ['Sin datos de encuestas']
        : (student.requisitos_faltantes 
            ? student.requisitos_faltantes.split(',').filter(r => r) 
            : []),
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
      risk,
      cohortComparison,
      cohorts
    ] = await Promise.all([
      cohortId ? this.getStudentsByYear(cohortId) : this.getAllStudents(),
      this.getStudentsStatusDistribution(cohortId),
      this.getGraduatesAndTitledByCohort(cohortId), 
      this.getGraduationRequirements(cohortId),
      this.getStudentsWithIncompleteRequirements(cohortId),
      this.getStudentsAtRisk(cohortId),
      this.getCohortComparisonBySemester(cohortId),
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
    console.log('═══════════════════════════════════════\n');

    return {
      students,
      statusDistribution,
      tableData, 
      graduationRequirements, 
      graduationWithOutRequirements, 
      risk,
      cohortComparison,
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
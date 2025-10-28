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

  /**
   * Sistema de palabras clave mejorado con ponderación
   */
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

  /**
   * Calcula puntuación de una respuesta individual
   * @returns {number} Puntuación de -10 a +10
   */
  calcularPuntuacionRespuesta(respuesta_texto, titulo_pregunta, tipo_encuesta) {
    const palabras = this.getPalabrasClave();
    const texto_lower = respuesta_texto.toLowerCase();
    const pregunta_lower = titulo_pregunta.toLowerCase();
    let puntuacion = 0;

    // 1. Análisis de palabras positivas (ponderadas)
    if (palabras.progreso_positivo.alto.some(p => texto_lower.includes(p))) {
      puntuacion += 3;
    } else if (palabras.progreso_positivo.medio.some(p => texto_lower.includes(p))) {
      puntuacion += 2;
    } else if (palabras.progreso_positivo.bajo.some(p => texto_lower.includes(p))) {
      puntuacion += 1;
    }

    // 2. Análisis de palabras negativas (ponderadas)
    if (palabras.progreso_negativo.alto.some(p => texto_lower.includes(p))) {
      puntuacion -= 3;
    } else if (palabras.progreso_negativo.medio.some(p => texto_lower.includes(p))) {
      puntuacion -= 2;
    } else if (palabras.progreso_negativo.bajo.some(p => texto_lower.includes(p))) {
      puntuacion -= 1;
    }

    // 3. Análisis específico por tipo de pregunta
    
    // Pregunta sobre pagos
    if (palabras.pagos_corrientes.pregunta.some(p => pregunta_lower.includes(p))) {
      if (palabras.pagos_corrientes.positiva.some(p => texto_lower.includes(p))) {
        puntuacion += 4; // CRÍTICO
      } else if (palabras.pagos_corrientes.negativa.some(p => texto_lower.includes(p))) {
        puntuacion -= 4; // CRÍTICO
      }
    }

    // Pregunta sobre titulación
    if (palabras.gastos_titulacion.pregunta.some(p => pregunta_lower.includes(p))) {
      if (palabras.gastos_titulacion.positiva.some(p => texto_lower.includes(p))) {
        puntuacion += 4; // CRÍTICO
      } else if (palabras.gastos_titulacion.negativa.some(p => texto_lower.includes(p))) {
        puntuacion -= 4; // CRÍTICO
      }
    }

    // Pregunta sobre E.FIRMA
    if (palabras.efirma.pregunta.some(p => pregunta_lower.includes(p))) {
      if (palabras.efirma.positiva.some(p => texto_lower.includes(p))) {
        puntuacion += 4; // CRÍTICO
      } else if (palabras.efirma.negativa.some(p => texto_lower.includes(p))) {
        puntuacion -= 4; // CRÍTICO
      }
    }

    // 4. Análisis de respuestas afirmativas/negativas simples
    if (palabras.afirmativas.some(p => texto_lower === p)) {
      puntuacion += 2;
    } else if (palabras.negativas.some(p => texto_lower === p)) {
      puntuacion -= 2;
    }

    // 5. Análisis de calificaciones numéricas
    const numMatch = respuesta_texto.match(/\b([0-9]|10)\b/);
    if (numMatch && pregunta_lower.match(/califica|satisf|evalua|puntua/)) {
      const num = parseInt(numMatch[1]);
      if (num >= 9) puntuacion += 3;
      else if (num >= 7) puntuacion += 2;
      else if (num >= 6) puntuacion += 1;
      else if (num >= 5) puntuacion -= 1;
      else puntuacion -= 2;
    }

    return Math.max(-10, Math.min(10, puntuacion));
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
   */
async getStudentsStatusDistribution(year = null) {
  const query = `
    WITH analisis_estudiantes AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        c.anio_ingreso as cohorte_year,
        enc.tipo as tipo_encuesta,
        
        -- Puntuación por respuestas positivas (múltiples niveles)
        SUM(CASE 
          WHEN LOWER(r.respuesta_texto) REGEXP 'excelente|sobresaliente|excepcional|perfecto' THEN 3
          WHEN LOWER(r.respuesta_texto) REGEXP 'completado|finalizado|terminado|aprobado|acreditado|exitoso' THEN 2
          WHEN LOWER(r.respuesta_texto) REGEXP 'bien|correcto|sin problema|entregado|cumplido' THEN 1
          ELSE 0
        END) as puntos_positivos,
        
        -- Puntuación por respuestas negativas (múltiples niveles)
        SUM(CASE 
          WHEN LOWER(r.respuesta_texto) REGEXP 'reprobado|rechazado|suspendido|cancelado' THEN 3
          WHEN LOWER(r.respuesta_texto) REGEXP 'atrasado|pendiente|incompleto|adeudo' THEN 2
          WHEN LOWER(r.respuesta_texto) REGEXP 'problema|dificultad|retraso|falta' THEN 1
          ELSE 0
        END) as puntos_negativos,
        
        -- REQUISITO 1: 10 Cuatrimestres
        MAX(CASE 
          WHEN (
            LOWER(r.respuesta_texto) REGEXP '10.*cuatrimestre|diez cuatrimestre|todos.*cuatrimestre'
            OR LOWER(r.respuesta_texto) REGEXP 'completé.*carrera|terminé todos|100%.*materia'
            OR r.respuesta_texto REGEXP '\\b10\\b' AND LOWER(p.title) REGEXP 'cuatrimestre|semestre'
          ) THEN 1 ELSE 0 
        END) as requisito_cuatrimestres,
        
        -- REQUISITO 2: Pagos al corriente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'pago|cuota|adeudo|mensualidad|colegiatura'
            AND LOWER(r.respuesta_texto) REGEXP 'al corriente|pagado.*completo|sin adeudo|liquidado|cubierto|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar|no'
          ) THEN 1 ELSE 0 
        END) as requisito_pagos,
        
        -- REQUISITO 3: Gastos de titulación
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto|costo|derecho'
            AND LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|completo|realizado|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no he|aún no|todavía no|no'
          ) THEN 1 ELSE 0 
        END) as requisito_titulacion,
        
        -- REQUISITO 4: E.FIRMA
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electr|fiel'
            AND LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|tramitado|actualizado|válido|obtuve|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no tengo|vencido|sin tramitar|falta|pendiente|no'
          ) THEN 1 ELSE 0 
        END) as requisito_efirma,
        
        -- Calificaciones numéricas (promedio)
        AVG(CASE 
          WHEN r.respuesta_texto REGEXP '^[0-9]+(\\.[0-9]+)?$'
          AND CAST(r.respuesta_texto AS DECIMAL(3,1)) BETWEEN 0 AND 10
          THEN CAST(r.respuesta_texto AS DECIMAL(3,1))
          ELSE NULL
        END) as promedio_calificaciones,
        
        -- Total de respuestas del estudiante
        COUNT(r.id_respuesta) as total_respuestas
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      INNER JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      INNER JOIN respuestas r ON pa.id_participacion = r.id_participacion
      INNER JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
      ${year ? "AND c.anio_ingreso = :year" : ""}
      GROUP BY e.id, e.matricula, e.nombre, c.anio_ingreso, enc.tipo
    ),
    
    evaluacion_por_estudiante AS (
      SELECT 
        id,
        matricula,
        nombre,
        cohorte_year,
        SUM(puntos_positivos) as total_puntos_positivos,
        SUM(puntos_negativos) as total_puntos_negativos,
        (SUM(puntos_positivos) - SUM(puntos_negativos)) as balance_puntos,
        MAX(requisito_cuatrimestres) as req_cuatrimestres,
        MAX(requisito_pagos) as req_pagos,
        MAX(requisito_titulacion) as req_titulacion,
        MAX(requisito_efirma) as req_efirma,
        (MAX(requisito_cuatrimestres) + MAX(requisito_pagos) + MAX(requisito_titulacion) + MAX(requisito_efirma)) as total_requisitos,
        AVG(promedio_calificaciones) as promedio_calificaciones,
        
        -- Clasificación REGULAR si cumple:
        -- 1. Balance positivo de puntos (más positivos que negativos)
        -- 2. Al menos 2 de 4 requisitos cumplidos
        CASE 
          WHEN (
            (SUM(puntos_positivos) - SUM(puntos_negativos)) > 0
            AND (MAX(requisito_cuatrimestres) + MAX(requisito_pagos) + MAX(requisito_titulacion) + MAX(requisito_efirma)) >= 2
          ) THEN 'regular'
          ELSE 'irregular'
        END as clasificacion
        
      FROM analisis_estudiantes
      GROUP BY id, matricula, nombre, cohorte_year
    )
    
    SELECT 
      SUM(CASE WHEN clasificacion = 'regular' THEN 1 ELSE 0 END) as regular,
      SUM(CASE WHEN clasificacion = 'irregular' THEN 1 ELSE 0 END) as irregular,
      
      -- Métricas adicionales para debugging
      AVG(balance_puntos) as promedio_balance,
      AVG(total_requisitos) as promedio_requisitos
      
    FROM evaluacion_por_estudiante
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: year ? { year } : {},
      type: QueryTypes.SELECT,
    });

    const data = results[0] || { regular: 0, irregular: 0 };
    
    console.log('📊 Distribución Regular/Irregular:');
    console.log(`   Regular: ${data.regular} estudiantes`);
    console.log(`   Irregular: ${data.irregular} estudiantes`);
    console.log(`   Balance promedio: ${data.promedio_balance ? parseFloat(data.promedio_balance).toFixed(2) : '0.00'}`);
    console.log(`   Requisitos promedio: ${data.promedio_requisitos ? parseFloat(data.promedio_requisitos).toFixed(2) : '0.00'}/4`);
    
    return {
      regular: parseInt(data.regular) || 0,
      irregular: parseInt(data.irregular) || 0
    };
  } catch (error) {
    console.error("Error en getStudentsStatusDistribution:", error);
    throw error;
  }
}

  /**
   * MEJORADO: Timeline con métricas de calidad
   */
  async getStudentsTimelineByYear() {
    const query = `
      SELECT 
        c.anio_ingreso as year,
        COUNT(DISTINCT e.id) as activos,
        COUNT(DISTINCT pa.id_participacion) as total_participaciones,
        ROUND(COUNT(DISTINCT pa.id_participacion) / NULLIF(COUNT(DISTINCT e.id), 0), 2) as promedio_participaciones,
        
        -- Tasa de respuesta (participaciones completadas vs totales)
        ROUND(
          (SUM(CASE WHEN pa.estatus = 'completada' THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(pa.id_participacion), 0),
          2
        ) as tasa_completitud
        
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN participaciones pa ON e.matricula = pa.id_estudiante
      WHERE c.anio_ingreso >= YEAR(CURDATE()) - 6
      GROUP BY c.anio_ingreso
      HAVING activos > 0
      ORDER BY c.anio_ingreso ASC
    `;

    try {
      return await sequelize.query(query, { type: QueryTypes.SELECT });
    } catch (error) {
      console.error("Error en getStudentsTimelineByYear:", error);
      throw error;
    }
  }

  /**
   * MEJORADO: Comparación por cuatrimestre con análisis detallado
   */
async getCohortComparisonBySemester(year = null) {
  const query = `
    WITH analisis_estudiantes AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        c.anio_ingreso as cohorte_year,
        enc.tipo as tipo_encuesta,
        
        -- Puntuación por respuestas positivas (múltiples niveles)
        SUM(CASE 
          WHEN LOWER(r.respuesta_texto) REGEXP 'excelente|sobresaliente|excepcional|perfecto' THEN 3
          WHEN LOWER(r.respuesta_texto) REGEXP 'completado|finalizado|terminado|aprobado|acreditado|exitoso' THEN 2
          WHEN LOWER(r.respuesta_texto) REGEXP 'bien|correcto|sin problema|entregado|cumplido' THEN 1
          ELSE 0
        END) as puntos_positivos,
        
        -- Puntuación por respuestas negativas (múltiples niveles)
        SUM(CASE 
          WHEN LOWER(r.respuesta_texto) REGEXP 'reprobado|rechazado|suspendido|cancelado' THEN 3
          WHEN LOWER(r.respuesta_texto) REGEXP 'atrasado|pendiente|incompleto|adeudo' THEN 2
          WHEN LOWER(r.respuesta_texto) REGEXP 'problema|dificultad|retraso|falta' THEN 1
          ELSE 0
        END) as puntos_negativos,
        
        -- REQUISITO 1: 10 Cuatrimestres
        MAX(CASE 
          WHEN (
            LOWER(r.respuesta_texto) REGEXP '10.*cuatrimestre|diez cuatrimestre|todos.*cuatrimestre'
            OR LOWER(r.respuesta_texto) REGEXP 'completé.*carrera|terminé todos|100%.*materia'
            OR r.respuesta_texto REGEXP '\\b10\\b' AND LOWER(p.title) REGEXP 'cuatrimestre|semestre'
          ) THEN 1 ELSE 0 
        END) as requisito_cuatrimestres,
        
        -- REQUISITO 2: Pagos al corriente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'pago|cuota|adeudo|mensualidad|colegiatura'
            AND LOWER(r.respuesta_texto) REGEXP 'al corriente|pagado.*completo|sin adeudo|liquidado|cubierto|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar|no'
          ) THEN 1 ELSE 0 
        END) as requisito_pagos,
        
        -- REQUISITO 3: Gastos de titulación
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto|costo|derecho'
            AND LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|completo|realizado|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no he|aún no|todavía no|no'
          ) THEN 1 ELSE 0 
        END) as requisito_titulacion,
        
        -- REQUISITO 4: E.FIRMA
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electr|fiel'
            AND LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|tramitado|actualizado|válido|obtuve|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no tengo|vencido|sin tramitar|falta|pendiente|no'
          ) THEN 1 ELSE 0 
        END) as requisito_efirma,
        
        -- Calificaciones numéricas (promedio)
        AVG(CASE 
          WHEN r.respuesta_texto REGEXP '^[0-9]+(\\.[0-9]+)?$'
          AND CAST(r.respuesta_texto AS DECIMAL(3,1)) BETWEEN 0 AND 10
          THEN CAST(r.respuesta_texto AS DECIMAL(3,1))
          ELSE NULL
        END) as promedio_calificaciones,
        
        -- Total de respuestas del estudiante
        COUNT(r.id_respuesta) as total_respuestas
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      INNER JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      INNER JOIN respuestas r ON pa.id_participacion = r.id_participacion
      INNER JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
      ${year ? "AND c.anio_ingreso = :year" : ""}
      GROUP BY e.id, e.matricula, e.nombre, c.anio_ingreso, enc.tipo
    ),
    
    evaluacion_por_estudiante AS (
      SELECT 
        id,
        matricula,
        nombre,
        cohorte_year,
        SUM(puntos_positivos) as total_puntos_positivos,
        SUM(puntos_negativos) as total_puntos_negativos,
        (SUM(puntos_positivos) - SUM(puntos_negativos)) as balance_puntos,
        MAX(requisito_cuatrimestres) as req_cuatrimestres,
        MAX(requisito_pagos) as req_pagos,
        MAX(requisito_titulacion) as req_titulacion,
        MAX(requisito_efirma) as req_efirma,
        (MAX(requisito_cuatrimestres) + MAX(requisito_pagos) + MAX(requisito_titulacion) + MAX(requisito_efirma)) as total_requisitos,
        AVG(promedio_calificaciones) as promedio_calificaciones,
        
        -- Clasificación REGULAR si cumple:
        -- 1. Balance positivo de puntos (más positivos que negativos)
        -- 2. Al menos 2 de 4 requisitos cumplidos
        CASE 
          WHEN (
            (SUM(puntos_positivos) - SUM(puntos_negativos)) > 0
            AND (MAX(requisito_cuatrimestres) + MAX(requisito_pagos) + MAX(requisito_titulacion) + MAX(requisito_efirma)) >= 2
          ) THEN 'regular'
          ELSE 'irregular'
        END as clasificacion
        
      FROM analisis_estudiantes
      GROUP BY id, matricula, nombre, cohorte_year
    )
    
    SELECT 
      cohorte_year as cuatrimestre,
      
      -- Regulares por cohorte
      SUM(CASE WHEN clasificacion = 'regular' THEN 1 ELSE 0 END) as regulares,
      
      -- Irregulares por cohorte
      SUM(CASE WHEN clasificacion = 'irregular' THEN 1 ELSE 0 END) as irregulares,
      
      -- Métricas adicionales
      AVG(balance_puntos) as puntuacion_promedio,
      AVG(promedio_calificaciones) as calificacion_promedio
      
    FROM evaluacion_por_estudiante
    GROUP BY cohorte_year
    ORDER BY cohorte_year ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: year ? { year } : {},
      type: QueryTypes.SELECT,
    });
    
    console.log('📊 Comparación por Cohorte (basado en encuestas):');
    results.forEach(row => {
      console.log(`   Cohorte ${row.cuatrimestre}: ${row.regulares} regulares, ${row.irregulares} irregulares`);
    });
    
    return results;
  } catch (error) {
    console.error("Error en getCohortComparisonBySemester:", error);
    throw error;
  }
}
  /**
   * MEJORADO: Métricas de graduación con validación estricta de requisitos
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
        
        -- Egresados REALES: Cumplen los 4 requisitos
        SUM(CASE 
          WHEN (req_cuatrimestres = 1 AND req_pagos = 1 AND req_titulacion = 1 AND req_efirma = 1)
          THEN 1 ELSE 0 
        END) as estudiantes_egresados,
        
        -- Próximos a egresar: En cuatrimestre 8-9 con al menos 2 requisitos
        SUM(CASE 
          WHEN cuatrimestre_actual BETWEEN 8 AND 9
          AND (req_cuatrimestres + req_pagos + req_titulacion + req_efirma) >= 2
          THEN 1 ELSE 0 
        END) as estudiantes_proximo_egreso,
        
        -- Promedio de satisfacción
        ROUND(AVG(satisfaccion), 2) as promedio_grupos,
        
        -- Porcentaje de avance: (requisitos cumplidos / 4) * 100
        ROUND(
          AVG((req_cuatrimestres + req_pagos + req_titulacion + req_efirma) * 25),
          2
        ) as porcentaje_avance_promedio,
        
        -- Métricas detalladas por requisito
        ROUND((SUM(req_cuatrimestres) * 100.0) / COUNT(*), 2) as porcentaje_req_cuatrimestres,
        ROUND((SUM(req_pagos) * 100.0) / COUNT(*), 2) as porcentaje_req_pagos,
        ROUND((SUM(req_titulacion) * 100.0) / COUNT(*), 2) as porcentaje_req_titulacion,
        ROUND((SUM(req_efirma) * 100.0) / COUNT(*), 2) as porcentaje_req_efirma
        
      FROM requisitos_estudiantes
    `;

    try {
      const results = await sequelize.query(query, { type: QueryTypes.SELECT });
      const metrics = results[0] || {};
      
      console.log('🎓 Métricas de Graduación:');
      console.log(`   Estudiantes activos: ${metrics.estudiantes_activos || 0}`);
      console.log(`   Con 10 cuatrimestres: ${metrics.estudiantes_con_cuatrimestres_completos || 0}`);
      console.log(`   Egresados (4/4 requisitos): ${metrics.estudiantes_egresados || 0}`);
      console.log(`   Próximos a egresar: ${metrics.estudiantes_proximo_egreso || 0}`);
      console.log(`   Cumplimiento por requisito:`);
      console.log(`     - Cuatrimestres: ${metrics.porcentaje_req_cuatrimestres || 0}%`);
      console.log(`     - Pagos: ${metrics.porcentaje_req_pagos || 0}%`);
      console.log(`     - Titulación: ${metrics.porcentaje_req_titulacion || 0}%`);
      console.log(`     - E.FIRMA: ${metrics.porcentaje_req_efirma || 0}%`);
      
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
          efirma: metrics.porcentaje_req_efirma || 0
        }
      };
    } catch (error) {
      console.error("Error en getGraduationRequirementsMetrics:", error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES (NO MODIFICADOS)
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

  async getStudentsByYear(year) {
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
      WHERE c.anio_ingreso = :year
      GROUP BY e.id
      ORDER BY e.nombre ASC
    `;

    try {
      return await sequelize.query(query, {
        replacements: { year },
        type: QueryTypes.SELECT,
      });
    } catch (error) {
      console.error("Error al obtener estudiantes por año:", error);
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

  async getGraduatesAndTitledByCohort(year = null) {
  const query = `
    WITH cohort_students AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        e.estatus,
        c.id as cohorte_id,
        c.anio_ingreso,
        c.periodo_ingreso,
        c.fecha_inicio,
        c.fecha_fin_ideal,
        c.fecha_fin_maxima
      FROM estudiantes e
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      WHERE 1=1
      ${year ? "AND c.anio_ingreso = :year" : ""}
    ),
    
    student_survey_data AS (
      SELECT 
        cs.id,
        cs.matricula,
        cs.nombre,
        cs.estatus,
        cs.cohorte_id,
        cs.anio_ingreso,
        
        -- Verificar si tiene requisitos de titulación completados
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'titulación|titulacion|gasto|costo|derecho'
            AND LOWER(r.respuesta_texto) REGEXP 'cubierto|pagado|liquidado|completo|realizado|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'falta|pendiente|no he|aún no|todavía no|no'
          ) THEN 1 ELSE 0 
        END) as tiene_requisito_titulacion,
        
        -- Verificar si tiene E.FIRMA
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'e\\.firma|efirma|firma.*electr|fiel'
            AND LOWER(r.respuesta_texto) REGEXP 'vigente|tengo|tramitado|actualizado|válido|obtuve|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no tengo|vencido|sin tramitar|falta|pendiente|no'
          ) THEN 1 ELSE 0 
        END) as tiene_efirma,
        
        -- Verificar si completó 10 cuatrimestres
        MAX(CASE 
          WHEN (
            LOWER(r.respuesta_texto) REGEXP '10.*cuatrimestre|diez cuatrimestre|todos.*cuatrimestre'
            OR LOWER(r.respuesta_texto) REGEXP 'completé.*carrera|terminé todos|100%.*materia'
            OR r.respuesta_texto REGEXP '\\b10\\b' AND LOWER(p.title) REGEXP 'cuatrimestre|semestre'
          ) THEN 1 ELSE 0 
        END) as completo_10_cuatrimestres,
        
        -- Verificar pagos al corriente
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'pago|cuota|adeudo|mensualidad|colegiatura'
            AND LOWER(r.respuesta_texto) REGEXP 'al corriente|pagado.*completo|sin adeudo|liquidado|cubierto|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'debo|pendiente|atrasado|falta.*pagar|no'
          ) THEN 1 ELSE 0 
        END) as pagos_al_corriente
        
      FROM cohort_students cs
      LEFT JOIN participaciones pa ON cs.id = pa.id_estudiante
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada' OR pa.estatus IS NULL
      GROUP BY cs.id, cs.matricula, cs.nombre, cs.estatus, cs.cohorte_id, cs.anio_ingreso
    )
    
    SELECT 
      ssd.anio_ingreso as anio_cohorte,
      COUNT(DISTINCT ssd.id) as total_ingresos,
      
      -- Egresados: estudiantes con estatus = 'Egresado'
      SUM(CASE WHEN ssd.estatus = 'Egresado' THEN 1 ELSE 0 END) as egresados,
      ROUND(
        (SUM(CASE WHEN ssd.estatus = 'Egresado' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT ssd.id) * 100), 1
      ) as pct_egresados,
      
      -- Titulados: Egresados que completaron requisitos de titulación
      SUM(CASE 
        WHEN ssd.estatus = 'Egresado' 
        AND ssd.tiene_requisito_titulacion = 1
        AND ssd.tiene_efirma = 1
        THEN 1 ELSE 0 
      END) as titulados,
      ROUND(
        (SUM(CASE 
          WHEN ssd.estatus = 'Egresado' 
          AND ssd.tiene_requisito_titulacion = 1
          AND ssd.tiene_efirma = 1
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT ssd.id) * 100), 1
      ) as pct_titulados,
      
      -- Sin Título: Egresados sin completar requisitos
      SUM(CASE 
        WHEN ssd.estatus = 'Egresado' 
        AND (ssd.tiene_requisito_titulacion = 0 OR ssd.tiene_efirma = 0)
        THEN 1 ELSE 0 
      END) as sin_titulo,
      ROUND(
        (SUM(CASE 
          WHEN ssd.estatus = 'Egresado' 
          AND (ssd.tiene_requisito_titulacion = 0 OR ssd.tiene_efirma = 0)
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT ssd.id) * 100), 1
      ) as pct_sin_titulo,
      
      -- Sin Continuar: estudiantes con estatus = 'Baja Temporal' o 'Baja Definitiva'
      SUM(CASE 
        WHEN ssd.estatus IN ('Baja Temporal', 'Baja Definitiva', 'Baja Académica') 
        THEN 1 ELSE 0 
      END) as sin_continuar,
      ROUND(
        (SUM(CASE 
          WHEN ssd.estatus IN ('Baja Temporal', 'Baja Definitiva', 'Baja Académica') 
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT ssd.id) * 100), 1
      ) as pct_sin_continuar,
      
      -- Inscritos: estudiantes con estatus = 'Inscrito'
      SUM(CASE WHEN ssd.estatus = 'Inscrito' THEN 1 ELSE 0 END) as inscritos,
      ROUND(
        (SUM(CASE WHEN ssd.estatus = 'Inscrito' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT ssd.id) * 100), 1
      ) as pct_inscritos,
      
      -- Inactivos: estudiantes con estatus = 'Inactivo'
      SUM(CASE WHEN ssd.estatus = 'Inactivo' THEN 1 ELSE 0 END) as inactivos,
      ROUND(
        (SUM(CASE WHEN ssd.estatus = 'Inactivo' THEN 1 ELSE 0 END) / 
         COUNT(DISTINCT ssd.id) * 100), 1
      ) as pct_inactivos
      
    FROM student_survey_data ssd
    GROUP BY ssd.anio_ingreso
    ORDER BY ssd.anio_ingreso ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: year ? { year } : {},
      type: QueryTypes.SELECT,
    });

    console.log('📊 Estudiantes Egresados y Titulados por Cohorte:');
    results.forEach(row => {
      console.log(`\n   Cohorte ${row.anio_cohorte}:`);
      console.log(`     Total Ingresos: ${row.total_ingresos}`);
      console.log(`     Egresados: ${row.egresados} (${row.pct_egresados}%)`);
      console.log(`     Titulados: ${row.titulados} (${row.pct_titulados}%)`);
      console.log(`     Sin Título: ${row.sin_titulo} (${row.pct_sin_titulo}%)`);
      console.log(`     Sin Continuar: ${row.sin_continuar} (${row.pct_sin_continuar}%)`);
      console.log(`     Inscritos: ${row.inscritos} (${row.pct_inscritos}%)`);
      console.log(`     Inactivos: ${row.inactivos} (${row.pct_inactivos}%)`);
    });

    return results;
  } catch (error) {
    console.error("Error en getGraduatesAndTitledByCohort:", error);
    throw error;
  }
}

  async getCohortCompleteData(year = null) {
    try {
      console.log('📊 Iniciando análisis MEJORADO de encuestas...');
      console.log(`   Año seleccionado: ${year || 'TODOS'}`);
      
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
        year ? this.getStudentsByYear(year) : this.getAllStudents(),
        this.getStudentsStatusDistribution(year),
        this.getGraduatesAndTitledByCohort(year), 
        this.getGraduationRequirements(year),
        this.getStudentsWithIncompleteRequirements(year),
        this.getStudentsTimelineByYear(),
        this.getCohortComparisonBySemester(year),
        this.getGraduationRequirementsMetrics(),
        this.getAllCohorts()
      ]);

      console.log('\n✅ RESUMEN DE ANÁLISIS:');
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
      console.log(`🎓 Egresados (4/4 requisitos): ${graduationMetrics.estudiantes_egresados}`);
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

async getGraduationRequirements(year = null) {
  const query = `
    WITH student_requirements AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        e.estatus,
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
        
        -- REQUISITO 4: Inglés Acreditado
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'inglés|ingles|english|idioma|language'
            AND LOWER(r.respuesta_texto) REGEXP 'acreditado|aprobado|vigente|válido|certificado|completado|obtuve|tengo|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no|pendiente|falta|aún no|todavía no|sin acreditar|reprobado'
          ) THEN 1 ELSE 0 
        END) as tiene_ingles
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
      ${year ? "AND c.anio_ingreso = :year" : ""}
      GROUP BY e.id, e.matricula, e.nombre, e.estatus, c.anio_ingreso
    )
    
    SELECT 
      sr.anio_ingreso,
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
      
      -- Todos los requisitos cumplidos
      SUM(CASE 
        WHEN sr.tiene_pagos = 1 
        AND sr.tiene_titulacion = 1 
        AND sr.tiene_efirma = 1 
        AND sr.tiene_ingles = 1
        THEN 1 ELSE 0 
      END) as estudiantes_todos_requisitos,
      ROUND(
        (SUM(CASE 
          WHEN sr.tiene_pagos = 1 
          AND sr.tiene_titulacion = 1 
          AND sr.tiene_efirma = 1 
          AND sr.tiene_ingles = 1
          THEN 1 ELSE 0 
        END) / COUNT(DISTINCT sr.id) * 100), 1
      ) as pct_todos_requisitos
      
    FROM student_requirements sr
    GROUP BY sr.anio_ingreso
    ORDER BY sr.anio_ingreso ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: year ? { year } : {},
      type: QueryTypes.SELECT,
    });

    console.log('📋 Requisitos de Graduación por Cohorte:');
    results.forEach(row => {
      console.log(`\n   Cohorte ${row.anio_ingreso}:`);
      console.log(`     Total Estudiantes: ${row.total_estudiantes}`);
      console.log(`     Pagos al Corriente: ${row.estudiantes_pagos} (${row.pct_pagos}%)`);
      console.log(`     Gastos de Titulación: ${row.estudiantes_titulacion} (${row.pct_titulacion}%)`);
      console.log(`     E.FIRMA Vigente: ${row.estudiantes_efirma} (${row.pct_efirma}%)`);
      console.log(`     Inglés Acreditado: ${row.estudiantes_ingles} (${row.pct_ingles}%)`);
      console.log(`     Todos los Requisitos: ${row.estudiantes_todos_requisitos} (${row.pct_todos_requisitos}%)`);
    });

    // Transformar resultados para el frontend
    const formattedResults = results.map(row => ({
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
      todos_requisitos: {
        cantidad: row.estudiantes_todos_requisitos,
        porcentaje: parseFloat(row.pct_todos_requisitos),
      }
    }));

    // Si no especifica año, agregar fila con totales consolidados
    if (!year && formattedResults.length > 0) {
      const totalConsolidado = {
        anio_cohorte: 'TOTAL',
        total_estudiantes: formattedResults.reduce((sum, r) => sum + r.total_estudiantes, 0),
        pagos: {
          cantidad: formattedResults.reduce((sum, r) => sum + parseInt(r.pagos.cantidad), 0),
          porcentaje: 0,
        },
        titulacion: {
          cantidad: formattedResults.reduce((sum, r) => sum + parseInt(r.titulacion.cantidad), 0),
          porcentaje: 0,
        },
        efirma: {
          cantidad: formattedResults.reduce((sum, r) => sum + parseInt(r.efirma.cantidad), 0),
          porcentaje: 0,
        },
        ingles: {
          cantidad: formattedResults.reduce((sum, r) => sum + parseInt(r.ingles.cantidad), 0),
          porcentaje: 0,
        },
        todos_requisitos: {
          cantidad: formattedResults.reduce((sum, r) => sum + parseInt(r.todos_requisitos.cantidad), 0),
          porcentaje: 0,
        }
      };

      // Calcular porcentajes totales
      if (totalConsolidado.total_estudiantes > 0) {
        totalConsolidado.pagos.porcentaje = parseFloat(
          ((totalConsolidado.pagos.cantidad / totalConsolidado.total_estudiantes) * 100).toFixed(1)
        );
        totalConsolidado.titulacion.porcentaje = parseFloat(
          ((totalConsolidado.titulacion.cantidad / totalConsolidado.total_estudiantes) * 100).toFixed(1)
        );
        totalConsolidado.efirma.porcentaje = parseFloat(
          ((totalConsolidado.efirma.cantidad / totalConsolidado.total_estudiantes) * 100).toFixed(1)
        );
        totalConsolidado.ingles.porcentaje = parseFloat(
          ((totalConsolidado.ingles.cantidad / totalConsolidado.total_estudiantes) * 100).toFixed(1)
        );
        totalConsolidado.todos_requisitos.porcentaje = parseFloat(
          ((totalConsolidado.todos_requisitos.cantidad / totalConsolidado.total_estudiantes) * 100).toFixed(1)
        );
      }

      formattedResults.push(totalConsolidado);
    }

    return formattedResults;
  } catch (error) {
    console.error("Error en getGraduationRequirements:", error);
    throw error;
  }
}


  // Métodos de modelo Sequelize (sin cambios)
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

  async getStudentsWithIncompleteRequirements(year = null) {
  const query = `
    WITH student_requirements AS (
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        e.email,
        e.estatus,
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
        
        -- REQUISITO 4: Inglés Acreditado
        MAX(CASE 
          WHEN (
            LOWER(p.title) REGEXP 'inglés|ingles|english|idioma|language'
            AND LOWER(r.respuesta_texto) REGEXP 'acreditado|aprobado|vigente|válido|certificado|completado|obtuve|tengo|sí|si'
            AND LOWER(r.respuesta_texto) NOT REGEXP 'no|pendiente|falta|aún no|todavía no|sin acreditar|reprobado'
          ) THEN 1 ELSE 0 
        END) as tiene_ingles
        
      FROM estudiantes e
      INNER JOIN participaciones pa ON e.id = pa.id_estudiante
      INNER JOIN cohortes c ON e.cohorte_id = c.id
      LEFT JOIN encuestas enc ON pa.id_encuesta = enc.id_encuesta
      LEFT JOIN respuestas r ON pa.id_participacion = r.id_participacion
      LEFT JOIN preguntas p ON r.id_pregunta = p.id_pregunta
      WHERE pa.estatus = 'completada'
      ${year ? "AND c.anio_ingreso = :year" : ""}
      GROUP BY e.id, e.matricula, e.nombre, e.email, e.estatus, c.anio_ingreso
    )
    
    SELECT 
      sr.id,
      sr.matricula,
      sr.nombre,
      sr.email,
      sr.estatus,
      sr.anio_ingreso,
      sr.tiene_pagos,
      sr.tiene_titulacion,
      sr.tiene_efirma,
      sr.tiene_ingles,
      
      -- Array de requisitos faltantes
      CONCAT_WS(',',
        CASE WHEN sr.tiene_pagos = 0 THEN 'Pagos al Corriente' END,
        CASE WHEN sr.tiene_titulacion = 0 THEN 'Gastos de Titulación' END,
        CASE WHEN sr.tiene_efirma = 0 THEN 'E.FIRMA Vigente' END,
        CASE WHEN sr.tiene_ingles = 0 THEN 'Inglés Acreditado' END
      ) as requisitos_faltantes,
      
      -- Contador de requisitos faltantes
      (4 - (sr.tiene_pagos + sr.tiene_titulacion + sr.tiene_efirma + sr.tiene_ingles)) as num_requisitos_faltantes
      
    FROM student_requirements sr
    WHERE NOT (
      sr.tiene_pagos = 1 
      AND sr.tiene_titulacion = 1 
      AND sr.tiene_efirma = 1 
      AND sr.tiene_ingles = 1
    )
    ORDER BY num_requisitos_faltantes DESC, sr.anio_ingreso ASC, sr.matricula ASC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: year ? { year } : {},
      type: QueryTypes.SELECT,
    });

    console.log(`\n📋 Estudiantes con Requisitos Incompletos: ${results.length}`);
    
    // Transformar resultados para el frontend
    const formattedResults = results.map(student => ({
      id: student.id,
      matricula: student.matricula,
      nombre: student.nombre,
      email: student.email,
      estatus: student.estatus,
      anio_cohorte: student.anio_ingreso,
      requisitos: {
        pagos: student.tiene_pagos === 1,
        titulacion: student.tiene_titulacion === 1,
        efirma: student.tiene_efirma === 1,
        ingles: student.tiene_ingles === 1
      },
      requisitos_faltantes: student.requisitos_faltantes 
        ? student.requisitos_faltantes.split(',').filter(r => r) 
        : [],
      num_requisitos_faltantes: parseInt(student.num_requisitos_faltantes)
    }));

    // Log detallado por cohorte
    const porCohorte = formattedResults.reduce((acc, student) => {
      if (!acc[student.anio_cohorte]) {
        acc[student.anio_cohorte] = [];
      }
      acc[student.anio_cohorte].push(student);
      return acc;
    }, {});

    Object.keys(porCohorte).sort().forEach(cohorte => {
      const estudiantes = porCohorte[cohorte];
      console.log(`\n   Cohorte ${cohorte}: ${estudiantes.length} estudiantes incompletos`);
      
      // Resumen de requisitos faltantes
      const resumen = {
        pagos: estudiantes.filter(e => !e.requisitos.pagos).length,
        titulacion: estudiantes.filter(e => !e.requisitos.titulacion).length,
        efirma: estudiantes.filter(e => !e.requisitos.efirma).length,
        ingles: estudiantes.filter(e => !e.requisitos.ingles).length
      };
      
      console.log(`     - Sin Pagos al Corriente: ${resumen.pagos}`);
      console.log(`     - Sin Gastos de Titulación: ${resumen.titulacion}`);
      console.log(`     - Sin E.FIRMA Vigente: ${resumen.efirma}`);
      console.log(`     - Sin Inglés Acreditado: ${resumen.ingles}`);
    });

    return formattedResults;
  } catch (error) {
    console.error("Error en getStudentsWithIncompleteRequirements:", error);
    throw error;
  }
}
}

module.exports = EstudianteRepositoryCohorte;
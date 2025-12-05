/**
 * GetPrediccionRiesgoUseCase - Calcula predicción de riesgo académico
 * 
 * Factores de riesgo considerados:
 * - Promedio general (peso 35%)
 * - Materias reprobadas (peso 25%)
 * - Calificaciones bajas (peso 20%)
 * - Cuatrimestre actual (peso 10%)
 * - Materias extraordinarias (peso 10%)
 */

class GetPrediccionRiesgoUseCase {
  constructor(studentRepository) {
    this.studentRepository = studentRepository
  }

  /**
   * Calcula el nivel de riesgo de un estudiante
   * @param {Array} registros - Registros académicos del estudiante
   * @returns {Object} - { nivel, puntaje, factores }
   */
  calcularRiesgoEstudiante(registros) {
    let puntajeRiesgo = 0
    const factores = []

    // Filtrar solo registros con calificaciones
    const registrosConCalif = registros.filter(r => r.final !== null && r.final > 0)
    
    if (registrosConCalif.length === 0) {
      return {
        nivel: 'bajo',
        puntaje: 0,
        factores: ['Sin registros de calificaciones'],
        promedio: 0,
        materiasReprobadas: 0,
        materiasExtraordinarias: 0
      }
    }

    // 1. CALCULAR PROMEDIO GENERAL (35% del riesgo)
    const sumCalificaciones = registrosConCalif.reduce((sum, r) => sum + parseFloat(r.final), 0)
    const promedio = sumCalificaciones / registrosConCalif.length

    if (promedio < 6) {
      puntajeRiesgo += 35
      factores.push(`Promedio muy bajo: ${promedio.toFixed(1)}`)
    } else if (promedio < 7) {
      puntajeRiesgo += 25
      factores.push(`Promedio bajo: ${promedio.toFixed(1)}`)
    } else if (promedio < 8) {
      puntajeRiesgo += 15
      factores.push(`Promedio regular: ${promedio.toFixed(1)}`)
    }

    // 2. MATERIAS REPROBADAS (25% del riesgo)
    const materiasReprobadas = registrosConCalif.filter(r => 
      parseFloat(r.final) < 6 && r.estatus_materia === 'Reprobado'
    ).length

    if (materiasReprobadas >= 3) {
      puntajeRiesgo += 25
      factores.push(`${materiasReprobadas} materias reprobadas`)
    } else if (materiasReprobadas >= 2) {
      puntajeRiesgo += 18
      factores.push(`${materiasReprobadas} materias reprobadas`)
    } else if (materiasReprobadas >= 1) {
      puntajeRiesgo += 10
      factores.push(`${materiasReprobadas} materia reprobada`)
    }

    // 3. CALIFICACIONES BAJAS (20% del riesgo)
    const calificacionesBajas = registrosConCalif.filter(r => {
      const calif = parseFloat(r.final)
      return calif >= 6 && calif < 7
    }).length

    if (calificacionesBajas >= 3) {
      puntajeRiesgo += 20
      factores.push(`${calificacionesBajas} calificaciones en riesgo (6-7)`)
    } else if (calificacionesBajas >= 2) {
      puntajeRiesgo += 12
      factores.push(`${calificacionesBajas} calificaciones en riesgo`)
    } else if (calificacionesBajas >= 1) {
      puntajeRiesgo += 6
    }

    // 4. CUATRIMESTRE AVANZADO CON BAJO RENDIMIENTO (10% del riesgo)
    const cuatrimestre = parseInt(registros[0]?.cuatrimestre_actual) || 0
    if (cuatrimestre >= 7 && promedio < 7.5) {
      puntajeRiesgo += 10
      factores.push(`Cuatrimestre ${cuatrimestre}° con bajo promedio`)
    } else if (cuatrimestre >= 5 && promedio < 7) {
      puntajeRiesgo += 6
    }

    // 5. MATERIAS EXTRAORDINARIAS (10% del riesgo)
    const materiasExtraordinarias = registros.filter(r => 
      r.extra && r.extra !== 'N/A' && parseFloat(r.extra) > 0
    ).length

    if (materiasExtraordinarias >= 2) {
      puntajeRiesgo += 10
      factores.push(`${materiasExtraordinarias} materias en extraordinario`)
    } else if (materiasExtraordinarias >= 1) {
      puntajeRiesgo += 5
      factores.push(`${materiasExtraordinarias} materia en extraordinario`)
    }

    // DETERMINAR NIVEL DE RIESGO
    let nivel
    if (puntajeRiesgo >= 60) {
      nivel = 'alto'
    } else if (puntajeRiesgo >= 30) {
      nivel = 'medio'
    } else {
      nivel = 'bajo'
    }

    // Si no hay factores significativos, considerar bajo riesgo
    if (factores.length === 0) {
      factores.push('Sin factores de riesgo significativos')
    }

    return {
      nivel,
      puntaje: Math.min(100, puntajeRiesgo),
      factores,
      promedio: parseFloat(promedio.toFixed(2)),
      materiasReprobadas,
      materiasExtraordinarias,
      totalMaterias: registrosConCalif.length
    }
  }

  /**
   * Ejecuta el análisis de riesgo para todos los estudiantes o por cohorte
   * @param {Object} filtros - { cohorte, carrera, nivelRiesgo }
   */
  async execute(filtros = {}) {
    try {
      console.log('🔍 Ejecutando análisis de predicción de riesgo...')
      console.log('Filtros recibidos:', filtros)

      // Obtener todos los registros de estudiantes
      const registros = await this.studentRepository.findAll()
      console.log(`📊 Total de registros encontrados: ${registros.length}`)

      if (registros.length === 0) {
        return {
          estadisticas: {
            totalAlumnos: 0,
            alumnosEnRiesgo: 0,
            porcentajeRiesgo: 0,
            distribucion: { bajo: 0, medio: 0, alto: 0 }
          },
          alumnos: [],
          cohortes: [],
          mensaje: 'No hay datos disponibles para análisis'
        }
      }

      // Agrupar registros por estudiante (matrícula)
      const estudiantesPorMatricula = {}
      registros.forEach(registro => {
        const matricula = registro.matricula
        if (!estudiantesPorMatricula[matricula]) {
          estudiantesPorMatricula[matricula] = []
        }
        estudiantesPorMatricula[matricula].push(registro)
      })

      console.log(`👥 Total de estudiantes únicos: ${Object.keys(estudiantesPorMatricula).length}`)

      // Calcular riesgo para cada estudiante
      const alumnosConRiesgo = []
      
      for (const [matricula, registrosEstudiante] of Object.entries(estudiantesPorMatricula)) {
        const primerRegistro = registrosEstudiante[0]
        
        // Aplicar filtros si se especifican
        if (filtros.cohorte && primerRegistro.cohorte !== filtros.cohorte) continue
        if (filtros.carrera && primerRegistro.carrera !== filtros.carrera) continue
        if (filtros.estatusAlumno && primerRegistro.estatus_alumno !== filtros.estatusAlumno) continue

        const analisisRiesgo = this.calcularRiesgoEstudiante(registrosEstudiante)

        // Aplicar filtro de nivel de riesgo
        if (filtros.nivelRiesgo && analisisRiesgo.nivel !== filtros.nivelRiesgo) continue

        alumnosConRiesgo.push({
          id: primerRegistro.id,
          matricula: matricula,
          nombre: primerRegistro.nombre,
          carrera: primerRegistro.carrera,
          cohorte: primerRegistro.cohorte || 'Sin cohorte',
          grupo: primerRegistro.grupo_actual || 'Sin grupo',
          cuatrimestre: primerRegistro.cuatrimestre_actual || 0,
          estatusAlumno: primerRegistro.estatus_alumno,
          nivelRiesgo: analisisRiesgo.nivel,
          puntajeRiesgo: analisisRiesgo.puntaje,
          factoresRiesgo: analisisRiesgo.factores,
          promedio: analisisRiesgo.promedio,
          materiasReprobadas: analisisRiesgo.materiasReprobadas,
          materiasExtraordinarias: analisisRiesgo.materiasExtraordinarias,
          totalMaterias: analisisRiesgo.totalMaterias
        })
      }

      console.log(`✅ Análisis completado para ${alumnosConRiesgo.length} estudiantes`)

      // Calcular estadísticas generales
      const totalAlumnos = alumnosConRiesgo.length
      const alumnosRiesgoAlto = alumnosConRiesgo.filter(a => a.nivelRiesgo === 'alto').length
      const alumnosRiesgoMedio = alumnosConRiesgo.filter(a => a.nivelRiesgo === 'medio').length
      const alumnosRiesgoBajo = alumnosConRiesgo.filter(a => a.nivelRiesgo === 'bajo').length
      const alumnosEnRiesgo = alumnosRiesgoAlto + alumnosRiesgoMedio

      // Agrupar por cohorte
      const cohortes = {}
      alumnosConRiesgo.forEach(alumno => {
        const cohorte = alumno.cohorte
        if (!cohortes[cohorte]) {
          cohortes[cohorte] = {
            cohorte,
            alumnos: []
          }
        }
        cohortes[cohorte].alumnos.push(alumno)
      })

      // Calcular estadísticas por cohorte
      const cohortesArray = Object.values(cohortes).map(c => {
        const total = c.alumnos.length
        const enRiesgo = c.alumnos.filter(a => a.nivelRiesgo === 'alto' || a.nivelRiesgo === 'medio').length
        const porcentaje = total > 0 ? (enRiesgo / total * 100) : 0
        
        return {
          cohorte: c.cohorte,
          totalAlumnos: total,
          alumnosEnRiesgo: enRiesgo,
          porcentajeRiesgo: parseFloat(porcentaje.toFixed(1)),
          distribucion: {
            alto: c.alumnos.filter(a => a.nivelRiesgo === 'alto').length,
            medio: c.alumnos.filter(a => a.nivelRiesgo === 'medio').length,
            bajo: c.alumnos.filter(a => a.nivelRiesgo === 'bajo').length
          }
        }
      })

      return {
        estadisticas: {
          totalAlumnos,
          alumnosEnRiesgo,
          porcentajeRiesgo: totalAlumnos > 0 ? parseFloat((alumnosEnRiesgo / totalAlumnos * 100).toFixed(1)) : 0,
          distribucion: {
            alto: alumnosRiesgoAlto,
            medio: alumnosRiesgoMedio,
            bajo: alumnosRiesgoBajo
          }
        },
        alumnos: alumnosConRiesgo,
        cohortes: cohortesArray,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('💥 Error en GetPrediccionRiesgoUseCase:', error)
      throw new Error(`Error al calcular predicción de riesgo: ${error.message}`)
    }
  }
}

module.exports = GetPrediccionRiesgoUseCase

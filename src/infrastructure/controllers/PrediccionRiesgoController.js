const GetPrediccionRiesgoUseCase = require('../../application/usecases/GetPrediccionRiesgoUseCase')

class PrediccionRiesgoController {
  constructor(studentRepository) {
    this.getPrediccionRiesgoUseCase = new GetPrediccionRiesgoUseCase(studentRepository)
  }

  /**
   * GET /api/prediccion-riesgo/dashboard
   * Obtiene el dashboard completo de predicción de riesgo
   */
  async getDashboard(req, res) {
    try {
      console.log('🔍 PrediccionRiesgoController: Obteniendo dashboard de predicción de riesgo')
      console.log('Query params:', req.query)

      const filtros = {
        cohorte: req.query.cohorte || null,
        carrera: req.query.carrera || null,
        nivelRiesgo: req.query.nivelRiesgo || null,
        estatusAlumno: req.query.estatusAlumno || 'Inscrito' // Por defecto solo activos
      }

      const resultado = await this.getPrediccionRiesgoUseCase.execute(filtros)

      console.log('✅ Dashboard de predicción de riesgo generado exitosamente')
      console.log(`Total alumnos: ${resultado.estadisticas.totalAlumnos}`)
      console.log(`En riesgo: ${resultado.estadisticas.alumnosEnRiesgo}`)

      res.status(200).json({
        success: true,
        data: resultado,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('💥 PrediccionRiesgoController: Error obteniendo dashboard:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener el dashboard de predicción de riesgo',
        message: error.message
      })
    }
  }

  /**
   * GET /api/prediccion-riesgo/alumnos
   * Obtiene lista detallada de alumnos con su nivel de riesgo
   */
  async getAlumnosEnRiesgo(req, res) {
    try {
      console.log('🔍 PrediccionRiesgoController: Obteniendo alumnos en riesgo')
      console.log('Query params:', req.query)

      const filtros = {
        cohorte: req.query.cohorte || null,
        carrera: req.query.carrera || null,
        nivelRiesgo: req.query.nivelRiesgo || null,
        estatusAlumno: req.query.estatusAlumno || 'Inscrito'
      }

      const resultado = await this.getPrediccionRiesgoUseCase.execute(filtros)

      // Ordenar por puntaje de riesgo (mayor a menor)
      const alumnosOrdenados = resultado.alumnos.sort((a, b) => b.puntajeRiesgo - a.puntajeRiesgo)

      console.log(`✅ Encontrados ${alumnosOrdenados.length} alumnos`)

      res.status(200).json({
        success: true,
        data: alumnosOrdenados,
        estadisticas: resultado.estadisticas,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('💥 PrediccionRiesgoController: Error obteniendo alumnos:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener alumnos en riesgo',
        message: error.message
      })
    }
  }

  /**
   * GET /api/prediccion-riesgo/cohortes
   * Obtiene estadísticas agrupadas por cohorte
   */
  async getCohortesConRiesgo(req, res) {
    try {
      console.log('🔍 PrediccionRiesgoController: Obteniendo cohortes con análisis de riesgo')

      const filtros = {
        carrera: req.query.carrera || null,
        estatusAlumno: req.query.estatusAlumno || 'Inscrito'
      }

      const resultado = await this.getPrediccionRiesgoUseCase.execute(filtros)

      // Ordenar cohortes por porcentaje de riesgo (mayor a menor)
      const cohortesOrdenadas = resultado.cohortes.sort((a, b) => b.porcentajeRiesgo - a.porcentajeRiesgo)

      console.log(`✅ Encontradas ${cohortesOrdenadas.length} cohortes`)

      res.status(200).json({
        success: true,
        data: cohortesOrdenadas,
        estadisticas: resultado.estadisticas,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('💥 PrediccionRiesgoController: Error obteniendo cohortes:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener cohortes con análisis de riesgo',
        message: error.message
      })
    }
  }

  /**
   * GET /api/prediccion-riesgo/alumno/:matricula
   * Obtiene el análisis de riesgo detallado de un alumno específico
   */
  async getAlumnoDetalle(req, res) {
    try {
      const { matricula } = req.params
      console.log(`🔍 PrediccionRiesgoController: Obteniendo detalle de riesgo para matrícula ${matricula}`)

      const resultado = await this.getPrediccionRiesgoUseCase.execute({})
      
      const alumno = resultado.alumnos.find(a => a.matricula === matricula)

      if (!alumno) {
        return res.status(404).json({
          success: false,
          error: 'Alumno no encontrado',
          message: `No se encontró ningún alumno con la matrícula ${matricula}`
        })
      }

      console.log(`✅ Detalle de riesgo obtenido para ${alumno.nombre}`)

      res.status(200).json({
        success: true,
        data: alumno,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('💥 PrediccionRiesgoController: Error obteniendo detalle:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener detalle de alumno',
        message: error.message
      })
    }
  }

  /**
   * GET /api/prediccion-riesgo/estadisticas
   * Obtiene solo las estadísticas generales (sin lista de alumnos)
   */
  async getEstadisticasGenerales(req, res) {
    try {
      console.log('🔍 PrediccionRiesgoController: Obteniendo estadísticas generales')

      const resultado = await this.getPrediccionRiesgoUseCase.execute({ estatusAlumno: 'Inscrito' })

      res.status(200).json({
        success: true,
        data: resultado.estadisticas,
        totalCohortes: resultado.cohortes.length,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('💥 PrediccionRiesgoController: Error obteniendo estadísticas:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener estadísticas generales',
        message: error.message
      })
    }
  }
}

module.exports = PrediccionRiesgoController

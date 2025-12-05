const express = require('express')
const router = express.Router()

// Importar el repositorio y el controlador
const MySQLStudentRepo = require('../driven/persistence/MySQLStudentRepo')
const PrediccionRiesgoController = require('../controllers/PrediccionRiesgoController')

// Crear instancias
const studentRepository = new MySQLStudentRepo()
const controller = new PrediccionRiesgoController(studentRepository)

/**
 * @route   GET /api/prediccion-riesgo/dashboard
 * @desc    Obtiene el dashboard completo con estadísticas, cohortes y alumnos
 * @query   cohorte, carrera, nivelRiesgo, estatusAlumno
 * @access  Public
 */
router.get('/dashboard', (req, res) => controller.getDashboard(req, res))

/**
 * @route   GET /api/prediccion-riesgo/alumnos
 * @desc    Obtiene lista detallada de alumnos con su nivel de riesgo
 * @query   cohorte, carrera, nivelRiesgo, estatusAlumno
 * @access  Public
 */
router.get('/alumnos', (req, res) => controller.getAlumnosEnRiesgo(req, res))

/**
 * @route   GET /api/prediccion-riesgo/cohortes
 * @desc    Obtiene estadísticas agrupadas por cohorte
 * @query   carrera, estatusAlumno
 * @access  Public
 */
router.get('/cohortes', (req, res) => controller.getCohortesConRiesgo(req, res))

/**
 * @route   GET /api/prediccion-riesgo/alumno/:matricula
 * @desc    Obtiene el análisis de riesgo detallado de un alumno específico
 * @param   matricula - Matrícula del alumno
 * @access  Public
 */
router.get('/alumno/:matricula', (req, res) => controller.getAlumnoDetalle(req, res))

/**
 * @route   GET /api/prediccion-riesgo/estadisticas
 * @desc    Obtiene solo las estadísticas generales (sin lista de alumnos)
 * @access  Public
 */
router.get('/estadisticas', (req, res) => controller.getEstadisticasGenerales(req, res))

module.exports = router

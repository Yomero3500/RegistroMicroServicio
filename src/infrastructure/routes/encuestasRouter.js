const express = require('express');
const SurveyController = require('../driving/api/SurveyController');


// Importar casos de uso y repositorio
const SurveyRepository = require('../driven/persistence/SurveyRepository');
const StudentRepositoryCohorte = require('../driven/persistence/EstudianteRepositoryCohorte')
const EncuestaMetricasDinamicasRepository = require('../driven/persistence/EncuestaMetricsRepository')
// EncuestasRouter.js
const DeleteSurveyUseCase = require('../../application/usecases/DeleteSurveyUseCase');
const CreateSurveyUseCase = require('../../application/usecases/CreateSurveyUseCase');
const GetCompleteStatsUseCase = require('../../application/usecases/GetCompleteStatsUseCase');
const GetBasicStatsUseCase = require('../../application/usecases/GetBasicStatsUseCase');
const ListAllSurveysUseCase = require('../../application/usecases/GetAllSurveysUseCase');
const GetCohortCompleteDataUseCase = require('../../application/usecases/GetCohortCompleteDataUseCase')
const SendStudentEmailUseCase = require('../../application/usecases/SendStudentEmailUseCase')
const GetDashboardCompletoUseCase = require('../../application/usecases/GetDashboardCompletoUseCase')
const GetSurveysByTypeUseCase = require('../../application/usecases/GetSurveysByTypeUseCase')
const GetSurveysExcludingTypesUseCase = require('../../application/usecases/GetSurveysExcludingTypesUseCase') 
const surveyRouter = express.Router();

// Inicializar dependencias
const surveyRepository = new SurveyRepository();
const studentRepositoryCohorte = new StudentRepositoryCohorte()
const encuestaMetricasDinamicasRepository = new EncuestaMetricasDinamicasRepository()

const createSurveyUseCase = new CreateSurveyUseCase(surveyRepository);
const deleteSurveyUseCase = new DeleteSurveyUseCase(surveyRepository);
const listAllSurveysUseCase = new ListAllSurveysUseCase(surveyRepository);
const getCompleteStatsUseCase = new GetCompleteStatsUseCase(surveyRepository);
const getBasicStatsUseCase = new GetBasicStatsUseCase(surveyRepository);
const getCohortCompleteDataUseCase = new GetCohortCompleteDataUseCase(studentRepositoryCohorte)
const sendStudentEmailUseCase = new SendStudentEmailUseCase(surveyRepository)
const encuestaMetricasDinamicasUseCase = new GetDashboardCompletoUseCase(encuestaMetricasDinamicasRepository)
const getSurveysByTypeUseCase = new GetSurveysByTypeUseCase(surveyRepository)
const getSurveysExcludingTypesUseCase = new GetSurveysExcludingTypesUseCase(surveyRepository)

const surveyController = new SurveyController(
    createSurveyUseCase,
    deleteSurveyUseCase,
    listAllSurveysUseCase,
    getCompleteStatsUseCase,
    getBasicStatsUseCase,
    getCohortCompleteDataUseCase,
    sendStudentEmailUseCase,
    encuestaMetricasDinamicasUseCase,
    getSurveysByTypeUseCase,
    getSurveysExcludingTypesUseCase
);

// Rutas
// POST /api/surveys
surveyRouter.post('/', (req, res) => {
    surveyController.createSurvey(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error en crear encuesta:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// GET /api/surveys
surveyRouter.get('/', (req, res) => {
    surveyController.getAllSurveys(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error en listar encuestas:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

surveyRouter.get('/by-type', (req, res) => {
    surveyController.getSurveysByType(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error al obtener encuestas por tipo:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// ✅ GET /api/surveys/excluding-types
surveyRouter.get('/excluding-types', (req, res) => {
    surveyController.getSurveysExcludingTypes(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error al obtener encuestas excluyendo tipos:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// DELETE /api/surveys/:id
surveyRouter.delete('/:id', (req, res) => {
    surveyController.deleteSurvey(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error en eliminar encuesta:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// GET /api/surveys/:id/complete-stats
surveyRouter.get('/:id/stats/complete', (req, res) => {
    surveyController.getCompleteStats(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error en obtener estadísticas completas:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// GET /api/surveys/:id/basic-stats
surveyRouter.get('/:id/stats/basic', (req, res) => {
    surveyController.getBasicStats(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error en obtener estadísticas básicas:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

surveyRouter.get('/cohorts/complete', (req, res) => {
  surveyController.getCohortCompleteData(req, res)
    .then(() => null)
    .catch((error) => {
      console.error('❌ Error en la ruta /cohorts/complete:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    });
});

  surveyRouter.get('/:id/dashboard',(req, res) => {  surveyController.getDashboardCompleto(req, res)
    .then(() => null)
    .catch((error) => {
      console.error('❌ Error en la ruta /dashboard/tipo:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    });}
  );


surveyRouter.post('/email/send', (req, res) => {
  surveyController.sendStudentEmailUse(req, res)
    .then(() => null)
    .catch((error) => {
      console.error('Error en la ruta /email/send:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al enviar el correo',
      });
    });
});





module.exports = surveyRouter;

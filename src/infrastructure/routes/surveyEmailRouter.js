const express = require('express');
const SurveyEmailController = require('../driving/api/SurveyEmailController');

// Importar repositorios y servicios
const EstudianteRepository = require('../driven/persistence/EstudianteRepository');
const SurveyRepository = require('../driven/persistence/SurveyRepository');
const SurveyTokenRepository = require('../driven/persistence/SurveyTokenRepository');
const EmailService = require('../driven/persistence/EmailRepository');
const SendSurveyEmailUseCase = require('../../application/usecases/SendSurveyEmailUseCase');

const surveyEmailRouter = express.Router();

// Inicializar dependencias
const estudianteRepository = new EstudianteRepository();
const surveyRepository = new SurveyRepository();
const surveyTokenRepository = new SurveyTokenRepository();
const emailService = new EmailService();

const sendSurveyEmailUseCase = new SendSurveyEmailUseCase(
  estudianteRepository,
  surveyRepository,
  surveyTokenRepository,
  emailService
);

const surveyEmailController = new SurveyEmailController(
  sendSurveyEmailUseCase
);

// ============================================
// RUTAS PROTEGIDAS (ADMIN)
// ============================================

// POST /api/surveys/send-email
surveyEmailRouter.post('/send-email', (req, res) => {
  surveyEmailController.sendToStudent(req, res)
    .then(() => null)
    .catch(error => {
      console.error('Error al enviar encuesta por email:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    });
});

// GET /api/surveys/:surveyId/email-stats
surveyEmailRouter.get('/:surveyId/email-stats', (req, res) => {
  surveyEmailController.getStats(req, res)
    .then(() => null)
    .catch(error => {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    });
});

module.exports = surveyEmailRouter;
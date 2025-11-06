const express = require('express');
const PublicSurveyController = require('../driving/api/PublicSurveyController');

// Importar repositorios
const SurveyTokenRepository = require('../driven/persistence/SurveyTokenRepository');
const SurveyRepository = require('../driven/persistence/SurveyRepository');
const ParticipationRepository = require('../driven/persistence/ParticipacionRepository')
const AnswerRepository = require('../driven/persistence/AnswerRepository')

// Importar casos de uso
const GetSurveyByTokenUseCase = require('../../application/usecases/GetSurveyByTokenUseCase');
const SubmitSurveyResponseUseCase = require('../../application/usecases/SubmitSurveyResponseUseCase');

const publicSurveyRouter = express.Router();

// Inicializar dependencias
const surveyTokenRepository = new SurveyTokenRepository();
const surveyRepository = new SurveyRepository();
const participationRepository = new ParticipationRepository()
const answerRepository = new AnswerRepository()

const getSurveyByTokenUseCase = new GetSurveyByTokenUseCase(
  surveyTokenRepository,
  surveyRepository
);

const submitSurveyResponseUseCase = new SubmitSurveyResponseUseCase(
  surveyTokenRepository,
  participationRepository, 
  answerRepository
);

const publicSurveyController = new PublicSurveyController(
  getSurveyByTokenUseCase,
  submitSurveyResponseUseCase
);

// ============================================
// RUTAS PÚBLICAS (ESTUDIANTES)
// ============================================

// GET /api/public/survey/:token
publicSurveyRouter.get('/survey/:token', (req, res) => {
  publicSurveyController.getSurveyByToken(req, res)
    .then(() => null)
    .catch(error => {
      console.error('Error al obtener encuesta pública:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    });
});

// POST /api/public/survey/submit
publicSurveyRouter.post('/survey/submit', (req, res) => {
  publicSurveyController.submitSurveyResponse(req, res)
    .then(() => null)
    .catch(error => {
      console.error('Error al guardar respuestas:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    });
});

module.exports = publicSurveyRouter;
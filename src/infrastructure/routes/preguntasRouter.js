const express = require('express');
const QuestionController = require('../driving/api/QuestionController');

// Importar repositorio y casos de uso
const QuestionRepository = require('../driven/persistence/QuestionRepository');
const CreateQuestionUseCase = require('../../application/usecases/CreateQuestionUseCase');
const ListAllQuestionsUseCase = require('../../application/usecases/ListAllQuestionsUseCase');

const questionRouter = express.Router();

// Inicializar dependencias
const questionRepository = new QuestionRepository();
const createQuestionUseCase = new CreateQuestionUseCase(questionRepository);
const listAllQuestionsUseCase = new ListAllQuestionsUseCase(questionRepository);

const questionController = new QuestionController(
    createQuestionUseCase,
    listAllQuestionsUseCase
);

// Rutas
// POST /api/questions
questionRouter.post('/', (req, res) => {
    questionController.create(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error al crear pregunta:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// GET /api/questions
questionRouter.get('/', (req, res) => {
    questionController.listAll(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('Error al listar preguntas:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

module.exports = questionRouter;

const express = require('express');
const AnswerController = require('../driving/api/AnswerController');

// Importar repositorio y casos de uso
const AnswerRepository = require('../driven/persistence/AnswerRepository');
const CreateAnswerUseCase = require('../../application/usecases/CreateAnswerUseCase');
const ListAllAnswersUseCase = require('../../application/usecases/ListAllAnswersUseCase');
const UpdateAnswerUseCase = require('../../application/usecases/UpdateAnswerUseCase');
const DeleteAnswerUseCase = require('../../application/usecases/DeleteAnswerUseCase');

const answerRouter = express.Router();

// Inicializar dependencias
const answerRepository = new AnswerRepository();

const createAnswerUseCase = new CreateAnswerUseCase(answerRepository);
const listAllAnswersUseCase = new ListAllAnswersUseCase(answerRepository);
const updateAnswerUseCase = new UpdateAnswerUseCase(answerRepository);
const deleteAnswerUseCase = new DeleteAnswerUseCase(answerRepository);

const answerController = new AnswerController(
    createAnswerUseCase,
    listAllAnswersUseCase,
    updateAnswerUseCase,
    deleteAnswerUseCase
);

// Rutas

// POST /api/answers
answerRouter.post('/', (req, res) => {
    answerController.create(req, res)
        .then(() => null)
        .catch(error => {
            console.error('Error al crear respuesta:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// GET /api/answers
answerRouter.get('/', (req, res) => {
    answerController.listAll(req, res)
        .then(() => null)
        .catch(error => {
            console.error('Error al listar respuestas:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// PUT /api/answers/:id
answerRouter.put('/:id', (req, res) => {
    answerController.update(req, res)
        .then(() => null)
        .catch(error => {
            console.error('Error al actualizar respuesta:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

// DELETE /api/answers/:id
answerRouter.delete('/:id', (req, res) => {
    answerController.delete(req, res)
        .then(() => null)
        .catch(error => {
            console.error('Error al eliminar respuesta:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        });
});

module.exports = answerRouter;

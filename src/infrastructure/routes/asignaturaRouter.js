const express = require('express');
const CreateAsignaturaController = require('../controllers/CreateAsignaturaController');
const GetAsignaturasByIdsController = require('../controllers/GetAsignaturasByIdsController');
const GetAsignaturasByIdsUseCase = require('../../application/usecases/GetAsignaturasByIdsUseCase');
const AsignaturaRepository = require('../driven/persistence/AsignaturaRepository');

const asignaturaRouter = express.Router();

// Inicializar dependencias
const asignaturaRepository = new AsignaturaRepository();
const getAsignaturasByIdsUseCase = new GetAsignaturasByIdsUseCase(asignaturaRepository);
const createAsignaturaController = new CreateAsignaturaController();
const getAsignaturasByIdsController = new GetAsignaturasByIdsController(getAsignaturasByIdsUseCase);

// POST /api/asignaturas
asignaturaRouter.post('/', (req, res) => {
    createAsignaturaController.execute(req, res)
    .then(() => null)
    .catch((error) => {
        console.error('Error en la ruta de crear asignatura:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    });
});

// POST /api/asignaturas/buscar-por-ids
asignaturaRouter.post('/buscar-por-ids', (req, res) => {
    getAsignaturasByIdsController.execute(req, res)
    .then(() => null)
    .catch((error) => {
        console.error('Error en la ruta de buscar asignaturas por IDs:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    });
});

module.exports = asignaturaRouter;

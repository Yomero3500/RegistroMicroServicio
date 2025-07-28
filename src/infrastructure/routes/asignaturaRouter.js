const express = require('express');
const CreateAsignaturaController = require('../controllers/CreateAsignaturaController');

const asignaturaRouter = express.Router();
const createAsignaturaController = new CreateAsignaturaController();

// POST /api/asignaturas
asignaturaRouter.post('/', (req, res) => {
    createAsignaturaController.execute(req, res)
    .then(() => null)
    .catch((error) => {
        console.error('Error en la ruta de crear asignatura:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    });
});

module.exports = asignaturaRouter;

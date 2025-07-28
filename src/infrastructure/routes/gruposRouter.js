const express = require('express');
const GruposController = require('../controllers/GruposController');

const gruposRouter = express.Router();
const gruposController = new GruposController();

// POST /api/grupos - Crear múltiples grupos
gruposRouter.post('/', (req, res) => {
    gruposController.createGrupos(req, res)
    .then(() => null)
    .catch((error) => {
        console.error('Error en la ruta de crear grupos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    });
});

// PATCH /api/grupos/:id - Actualizar un grupo específico
gruposRouter.patch('/:id', (req, res) => {
    gruposController.updateGrupo(req, res)
    .then(() => null)
    .catch((error) => {
        console.error('Error en la ruta de actualizar grupo:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    });
});

module.exports = gruposRouter;

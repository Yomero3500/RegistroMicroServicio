const express = require('express');
const ListMateriasController = require('../controllers/ListMateriasController');

const materiasRouter = express.Router();
const listMateriasController = new ListMateriasController();

// GET /materias/listar
materiasRouter.get('/listar', (req, res) => {
    listMateriasController.execute(req, res)
    .then(() => null)
    .catch((error) => {
        console.error('Error en la ruta de listar materias:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    });
});

module.exports = materiasRouter;

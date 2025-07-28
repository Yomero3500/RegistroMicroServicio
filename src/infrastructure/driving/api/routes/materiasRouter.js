const express = require('express');
const MateriasController = require('../MateriasController');

const router = express.Router();
const materiasController = new MateriasController();

router.get('/listar', (req, res, next) => materiasController.listarMaterias(req, res, next));
router.post('/buscar', (req, res, next) => materiasController.getMateriaById(req, res, next));
router.post('/buscar-multiple', (req, res, next) => materiasController.findMultipleMaterias(req, res, next));

module.exports = router;

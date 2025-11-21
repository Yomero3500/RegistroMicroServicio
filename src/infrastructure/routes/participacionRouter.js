// src/infrastructure/config/participacionRouter.js

const express = require('express');
const ParticipacionController = require('../driving/api/ParticipacionController');

// Importar repositorio
const ParticipacionRepository = require('../driven/persistence/ParticipacionRepository');

// Importar caso de uso
const CreateParticipacionUseCase = require('../../application/usecases/CreateParticipacionUseCase');

const participacionRouter = express.Router();

// Inicializar dependencias
const participacionRepository = new ParticipacionRepository();

const createParticipacionUseCase = new CreateParticipacionUseCase(participacionRepository);

const participacionController = new ParticipacionController(
    createParticipacionUseCase
);

// ============================================
// RUTAS DE PARTICIPACIONES
// ============================================

// POST /api/participaciones
// Crear nueva participación o múltiples participaciones
participacionRouter.post('/', (req, res) => {
    participacionController.create(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al crear participación:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al crear participación' 
            });
        });
});

module.exports = participacionRouter;
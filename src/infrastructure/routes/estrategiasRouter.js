// src/infrastructure/config/estrategiaCohorteRouter.js

const express = require('express');
const EstrategiaCohorteController = require('../driving/api/EstrategiaCohorteController');

// Importar repositorio
const EstrategiaCohorteRepository = require('../driven/persistence/EstrategiaCohorteRepository');

// Importar casos de uso
const CreateEstrategiaCohorteUseCase = require('../../application/usecases/CreateEstrategiaCohorteUseCase');
const GetEstrategiasCohorteUseCase = require('../../application/usecases/GetEstrategiasCohorteUseCase');
const GetEstrategiaByIdUseCase = require('../../application/usecases/GetEstrategiaByIdUseCase');
const GetEstrategiasByCohorteUseCase = require('../../application/usecases/GetEstrategiasByCohorteUseCase');
const UpdateEstrategiaCohorteUseCase = require('../../application/usecases/UpdateEstrategiaCohorteUseCase');
const DeleteEstrategiaCohorteUseCase = require('../../application/usecases/DeleteEstrategiaCohorteUseCase');
const GetCohortesUseCase = require('../../application/usecases/GetCohortesUseCase');

const estrategiaCohorteRouter = express.Router();

// Inicializar dependencias
const estrategiaCohorteRepository = new EstrategiaCohorteRepository();

const createEstrategiaUseCase = new CreateEstrategiaCohorteUseCase(estrategiaCohorteRepository);
const getEstrategiasUseCase = new GetEstrategiasCohorteUseCase(estrategiaCohorteRepository);
const getEstrategiaByIdUseCase = new GetEstrategiaByIdUseCase(estrategiaCohorteRepository);
const getEstrategiasByCohorteUseCase = new GetEstrategiasByCohorteUseCase(estrategiaCohorteRepository);
const updateEstrategiaUseCase = new UpdateEstrategiaCohorteUseCase(estrategiaCohorteRepository);
const deleteEstrategiaUseCase = new DeleteEstrategiaCohorteUseCase(estrategiaCohorteRepository);
const getCohortesUseCase = new GetCohortesUseCase(estrategiaCohorteRepository);

const estrategiaCohorteController = new EstrategiaCohorteController(
    createEstrategiaUseCase,
    getEstrategiasUseCase,
    getEstrategiaByIdUseCase,
    getEstrategiasByCohorteUseCase,
    updateEstrategiaUseCase,
    deleteEstrategiaUseCase,
    getCohortesUseCase
);

// ============================================
// RUTAS DE COHORTES
// ============================================

// GET /api/estrategias/cohortes/lista
// Obtener todos los cohortes disponibles
estrategiaCohorteRouter.get('/cohortes/lista', (req, res) => {
    estrategiaCohorteController.getCohortes(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al obtener cohortes:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al obtener cohortes' 
            });
        });
});

// ============================================
// RUTAS DE ESTRATEGIAS
// ============================================

// POST /api/estrategias
// Crear nueva estrategia
estrategiaCohorteRouter.post('/', (req, res) => {
    estrategiaCohorteController.createEstrategia(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al crear estrategia:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al crear estrategia' 
            });
        });
});

// GET /api/estrategias
// Obtener todas las estrategias (con filtros opcionales: ?cohorte_id=xxx&estatus=pendiente&activa=true)
estrategiaCohorteRouter.get('/', (req, res) => {
    estrategiaCohorteController.getEstrategias(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al obtener estrategias:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al obtener estrategias' 
            });
        });
});

// GET /api/estrategias/cohorte/:cohorteId
// Obtener estrategias de un cohorte específico
estrategiaCohorteRouter.get('/cohorte/:cohorteId', (req, res) => {
    estrategiaCohorteController.getEstrategiasByCohorte(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al obtener estrategias del cohorte:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al obtener estrategias del cohorte' 
            });
        });
});

// GET /api/estrategias/:id
// Obtener estrategia por ID
estrategiaCohorteRouter.get('/:id', (req, res) => {
    estrategiaCohorteController.getEstrategiaById(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al obtener estrategia:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al obtener estrategia' 
            });
        });
});

// PUT /api/estrategias/:id
// Actualizar estrategia completa
estrategiaCohorteRouter.put('/:id', (req, res) => {
    estrategiaCohorteController.updateEstrategia(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al actualizar estrategia:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al actualizar estrategia' 
            });
        });
});

// PATCH /api/estrategias/:id/estado
// Cambiar solo el estado de la estrategia
estrategiaCohorteRouter.patch('/:id/estado', (req, res) => {
    estrategiaCohorteController.cambiarEstado(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al cambiar estado:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al cambiar estado' 
            });
        });
});

// PATCH /api/estrategias/:id/toggle
// Activar/Desactivar estrategia
estrategiaCohorteRouter.patch('/:id/toggle', (req, res) => {
    estrategiaCohorteController.toggleActiva(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al cambiar estado activo:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al cambiar estado activo' 
            });
        });
});

// DELETE /api/estrategias/:id
// Eliminar estrategia
estrategiaCohorteRouter.delete('/:id', (req, res) => {
    estrategiaCohorteController.deleteEstrategia(req, res)
        .then(() => null)
        .catch((error) => {
            console.error('❌ Error al eliminar estrategia:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error interno del servidor al eliminar estrategia' 
            });
        });
});

module.exports = estrategiaCohorteRouter;
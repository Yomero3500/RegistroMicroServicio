const express = require('express');
const multer = require('multer');
const InscripcionController = require('../InscripcionController');

const router = express.Router();
const upload = multer();
const inscripcionController = new InscripcionController();

// GET /api/inscripciones -> lista desde tabla 'inscripciones'
router.get('/', async (req, res, next) => {
    try {
        await inscripcionController.getInscripciones(req, res, next);
    } catch (error) {
        next(error);
    }
});

router.post('/', 
    upload.single('csv'),
    (req, res, next) => inscripcionController.createBulkInscripcion(req, res, next)
);

module.exports = router;

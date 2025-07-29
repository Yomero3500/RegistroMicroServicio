const express = require('express');
const multer = require('multer');
const InscripcionController = require('../InscripcionController');

const router = express.Router();
const upload = multer();
const inscripcionController = new InscripcionController();

router.post('/', 
    upload.single('csv'),
    (req, res, next) => inscripcionController.createBulkInscripcion(req, res, next)
);

module.exports = router;

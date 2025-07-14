const express = require('express');
const router = express.Router();

module.exports = (studentController, upload) => {
  // Importar estudiantes desde CSV
  router.post('/students/import', 
    upload.single('file'), 
    studentController.importStudents.bind(studentController)
  );

  // Obtener todos los estudiantes
  router.get('/students', 
    studentController.getAllStudents?.bind(studentController) || 
    ((req, res) => res.status(501).json({ message: 'Endpoint no implementado' }))
  );

  // Obtener estudiante por matrícula
  router.get('/students/matricula/:matricula', 
    studentController.getStudentByMatricula?.bind(studentController) || 
    ((req, res) => res.status(501).json({ message: 'Endpoint no implementado' }))
  );

  // Obtener estudiante por ID
  router.get('/students/:id', 
    studentController.getStudentById?.bind(studentController) || 
    ((req, res) => res.status(501).json({ message: 'Endpoint no implementado' }))
  );

  return router;
};
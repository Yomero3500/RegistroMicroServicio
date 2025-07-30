const express = require('express');
const router = express.Router();

module.exports = (studentController, upload) => {
  // Importar estudiantes desde CSV - /alumnos/cargar-csv
  router.post('/cargar-csv', 
    upload.single('archivo'), 
    studentController.importStudents.bind(studentController)
  );

  // Obtener todos los estudiantes - /alumnos/listar
  router.get('/listar', 
    studentController.getAllStudents.bind(studentController)
  );

  // Obtener información básica de estudiantes (matrícula, nombre, ID tutor) - /alumnos/basica
  router.get('/basica', 
    studentController.getStudentsBasicInfo.bind(studentController)
  );

  // Obtener información básica de estudiantes desde modelo Estudiante - /alumnos/estudiantes-basica
  router.get('/estudiantes-basica', 
    studentController.getEstudiantesBasicInfo.bind(studentController)
  );

  // Obtener estudiante por matrícula desde modelo Estudiante - /alumnos/estudiante/:matricula
  router.get('/estudiante/:matricula', 
    studentController.getEstudianteByMatricula.bind(studentController)
  );

  // Crear nuevo estudiante - /alumnos/crear
  router.post('/crear', 
    studentController.createStudent.bind(studentController)
  );

  // Actualizar estudiante - /alumnos/:id
  router.put('/:id', 
    studentController.updateStudent.bind(studentController)
  );

  // Eliminar estudiante - /alumnos/:id
  router.delete('/:id', 
    studentController.deleteStudent.bind(studentController)
  );

  // Obtener estudiante por matrícula - /alumnos/matricula/:matricula
  router.get('/matricula/:matricula', 
    studentController.getStudentByMatricula.bind(studentController)
  );

  // Obtener estudiante por ID - /alumnos/:id
  router.get('/:id', 
    studentController.getStudentById.bind(studentController)
  );

  // Mantener endpoints anteriores para compatibilidad
  router.post('/students/import', 
    upload.single('file'), 
    studentController.importStudents.bind(studentController)
  );

  router.get('/students', 
    studentController.getAllStudents.bind(studentController)
  );

  return router;
};
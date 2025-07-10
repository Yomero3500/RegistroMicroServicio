const express = require('express');
const router = express.Router();

module.exports = (studentController, upload) => {
  router.post('/students/import', 
    upload.single('file'), 
    studentController.importStudents.bind(studentController)
  );

  return router;
};
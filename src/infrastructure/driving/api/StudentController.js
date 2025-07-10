class StudentController {
  constructor(importStudentsUseCase) {
    this.importStudentsUseCase = importStudentsUseCase;
  }

  async importStudents(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
      }

      const result = await this.importStudentsUseCase.execute(req.file.path);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StudentController;
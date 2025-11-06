
class QuestionController {
  constructor(createQuestionUseCase, listAllQuestionsUseCase) {
    this.createQuestionUseCase = createQuestionUseCase;
    this.listAllQuestionsUseCase = listAllQuestionsUseCase;
  }
  // 📌 Crear pregunta
  async create(req, res, next) {
    try {
      const { id_encuesta, title, type, options, required } = req.body;

      if (!id_encuesta || isNaN(Number(id_encuesta))) {
        return res.status(400).json({ success: false, message: 'El id_encuesta es obligatorio y debe ser un número válido.' });
      }

      if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'El título es obligatorio y debe ser un string válido.' });
      }

      if ((type === 'multiple' || type === 'select') && (!options || options.length === 0)) {
        return res.status(400).json({ success: false, message: 'Las preguntas tipo "multiple" o "select" deben tener al menos una opción.' });
      }

      const question = await this.createQuestionUseCase.run(id_encuesta, title, type, options, required);

      return res.status(201).json({ success: true, message: 'Pregunta creada exitosamente', data: question });
    } catch (error) {
      console.error('💥 QuestionController: Error al crear pregunta:', error.message);
      return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor al crear la pregunta' });
    }
  }

  // 📋 Listar todas las preguntas
  async listAll(req, res, next) {
    try {
      const questions = await this.listAllQuestionsUseCase.run();
      return res.status(200).json({ success: true, message: 'Preguntas obtenidas correctamente', total: questions.length, data: questions });
    } catch (error) {
      console.error('💥 QuestionController: Error al obtener preguntas:', error.message);
      return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor al obtener las preguntas' });
    }
  }
}

module.exports = QuestionController;

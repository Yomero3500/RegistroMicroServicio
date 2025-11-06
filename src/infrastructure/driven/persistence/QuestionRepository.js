const ModelInitializer = require('./models'); // Ajusta la ruta según tu estructura
const Question = require('../../../domain/entities/Question'); // Tu clase de entidad

class QuestionRepository {
  getModel() {
    const models = ModelInitializer.getModels();
    return models.Question;
  }

  // Crear pregunta
  async save(id_encuesta, title, type = 'text', options = [], required = false) {
    const QuestionModel = this.getModel();
    
    const question = await QuestionModel.create({
      id_encuesta,
      title,
      type,
      options: JSON.stringify(options),
      required
    });

    return new Question(
      question.id_pregunta,
      question.id_encuesta,
      question.title,
      question.type,
      options,
      question.required
    );
  }

  async listAll() {
    const QuestionModel = this.getModel();
    
    const questions = await QuestionModel.findAll({ 
      order: [['id_pregunta', 'ASC']] 
    });

    return questions.map(q => new Question(
      q.id_pregunta,
      q.id_encuesta,
      q.title,
      q.type,
      q.options ? JSON.parse(q.options) : [],
      q.required
    ));
  }

  async getBySurveyId(id_encuesta) {
    const QuestionModel = this.getModel();
    
    const questions = await QuestionModel.findAll({
      where: { id_encuesta },
      order: [['id_pregunta', 'ASC']]
    });

    return questions.map(q => new Question(
      q.id_pregunta,
      q.id_encuesta,
      q.title,
      q.type,
      q.options ? JSON.parse(q.options) : [],
      q.required
    ));
  }

  async getById(id) {
    const QuestionModel = this.getModel();
    
    const question = await QuestionModel.findByPk(id);
    if (!question) return null;

    return new Question(
      question.id_pregunta,
      question.id_encuesta,
      question.title,
      question.type,
      question.options ? JSON.parse(question.options) : [],
      question.required
    );
  }

  async update(id_pregunta, id_encuesta, title, type, options, required) {
    const QuestionModel = this.getModel();
    
    const updateData = {};
    if (id_encuesta !== undefined) updateData.id_encuesta = id_encuesta;
    if (title !== undefined) updateData.title = title;
    if (type !== undefined) updateData.type = type;
    if (options !== undefined) updateData.options = JSON.stringify(options);
    if (required !== undefined) updateData.required = required;

    const [updatedRows] = await QuestionModel.update(
      updateData, 
      { where: { id_pregunta } }
    );

    if (updatedRows === 0) {
      throw new Error(`No se encontró la pregunta con id ${id_pregunta} para actualizar.`);
    }

    const updatedQuestion = await QuestionModel.findByPk(id_pregunta);
    if (!updatedQuestion) {
      throw new Error(`Error inesperado al obtener la pregunta actualizada con id ${id_pregunta}.`);
    }

    return new Question(
      updatedQuestion.id_pregunta,
      updatedQuestion.id_encuesta,
      updatedQuestion.title,
      updatedQuestion.type,
      updatedQuestion.options ? JSON.parse(updatedQuestion.options) : [],
      updatedQuestion.required
    );
  }

  async delete(id_pregunta) {
    const QuestionModel = this.getModel();
    
    const deletedRows = await QuestionModel.destroy({ 
      where: { id_pregunta } 
    });
    
    return deletedRows > 0;
  }
}

module.exports = QuestionRepository;
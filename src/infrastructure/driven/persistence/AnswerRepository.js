const AnswerModel = require('./models/registration/RespuestaModel');
const Answer = require('../../../domain/entities/Answer');
const { sequelize } = require('../../config/database');

class AnswerRepository {

  getModel() {
    const answerModel = AnswerModel.init(sequelize);
    return answerModel; 
  }

  /**
   * Guardar una nueva respuesta
   * 
   * @param {number} id_pregunta - ID de la pregunta
   * @param {number} id_participacion - ID de la participación
   * @param {string} respuesta_texto - Texto de la respuesta
   * @returns {Promise<Answer>} Respuesta guardada
   */
  async save(id_pregunta, id_participacion, respuesta_texto) {
    try {
      // Validaciones
      if (!id_pregunta || typeof id_pregunta !== 'number') {
        throw new Error('id_pregunta es requerido y debe ser un número');
      }

      if (!id_participacion || typeof id_participacion !== 'number') {
        throw new Error('id_participacion es requerido y debe ser un número');
      }

      if (!respuesta_texto || String(respuesta_texto).trim() === '') {
        throw new Error('respuesta_texto no puede estar vacío');
      }

      console.log(`🔍 AnswerRepository: Guardando respuesta para pregunta ${id_pregunta}, participación ${id_participacion}`);

      const answerModel = this.getModel();
      const answer = await answerModel.create({
        id_pregunta,
        id_participacion,
        respuesta_texto: String(respuesta_texto).trim()
      });

      console.log(`✅ AnswerRepository: Respuesta guardada con ID: ${answer.id_respuesta}`);

      return new Answer(
        answer.id_respuesta,
        answer.id_pregunta,
        answer.id_participacion,
        answer.respuesta_texto
      );
    } catch (error) {
      console.error('❌ AnswerRepository: Error al guardar respuesta:', error);
      throw error;
    }
  }

  async listAll() {
    const answerModel = this.getModel();
    
    const answers = await answerModel.findAll({ 
      order: [['id_respuesta', 'ASC']] 
    });
    
    return answers.map(a => new Answer(
      a.id_respuesta,
      a.id_pregunta,
      a.id_participacion,
      a.respuesta_texto
    ));
  }

  async getById(id_respuesta) {
    const answerModel = this.getModel();

    const answer = await answerModel.findByPk(id_respuesta);
    if (!answer) return null;
    
    return new Answer(
      answer.id_respuesta,
      answer.id_pregunta,
      answer.id_participacion,
      answer.respuesta_texto
    );
  }

  async getByParticipation(id_participacion) {
    const answerModel = this.getModel();
    
    const answers = await answerModel.findAll({
      where: { id_participacion },
      order: [['id_respuesta', 'ASC']]
    });
    
    return answers.map(a => new Answer(
      a.id_respuesta,
      a.id_pregunta,
      a.id_participacion,
      a.respuesta_texto
    ));
  }

  async update(id_respuesta, respuesta_texto) {
    const answerModel = this.getModel();
    const updateData = {};
    
    if (respuesta_texto !== undefined) {
      updateData.respuesta_texto = respuesta_texto;
    }

    const [updatedRows] = await answerModel.update(updateData, { 
      where: { id_respuesta } 
    });

    if (updatedRows === 0) {
      throw new Error(`No se encontró la respuesta con id ${id_respuesta} para actualizar.`);
    }

    const updatedAnswer = await answerModel.findByPk(id_respuesta);
    
    return new Answer(
      updatedAnswer.id_respuesta,
      updatedAnswer.id_pregunta,
      updatedAnswer.id_participacion,
      updatedAnswer.respuesta_texto
    );
  }

  async delete(id_respuesta) {
    const answerModel = this.getModel();
    const deletedRows = await answerModel.destroy({ 
      where: { id_respuesta } 
    });
    return deletedRows > 0;
  }

  /**
   * Eliminar todas las respuestas de una participación
   * 
   * @param {number} id_participacion - ID de la participación
   * @returns {Promise<number>} Número de respuestas eliminadas
   */
  async deleteByParticipation(id_participacion) {
    const answerModel = this.getModel();
    const deletedRows = await answerModel.destroy({ 
      where: { id_participacion } 
    });
    
    console.log(`✅ AnswerRepository: ${deletedRows} respuestas eliminadas de participación ${id_participacion}`);
    return deletedRows;
  }
}

module.exports = AnswerRepository;
const { sequelize } = require('../../config/database');
const { Op } = require('sequelize');
const tokenEncuestaModel = require('./models/registration/TokenEncuestaModel');
const SurveyModel = require('./models/registration/EncuestaModel');
const StudentModel = require('./models/registration/EstudianteModel');

class SurveyTokenRepository {
  constructor() {
    this.model = tokenEncuestaModel.init(sequelize);
  }

  async create(tokenData) {
    try {
      const token = await this.model.create(tokenData);
      return this._toPlainObject(token);
    } catch (error) {
      throw new Error(`Error al crear token: ${error.message}`);
    }
  }

  async findValidToken({ surveyId, studentId }) {
    try {
      const token = await this.model.findOne({
        where: {
          id_encuesta: surveyId,
          id_estudiante: studentId,
          usado: false,
          fecha_expiracion: {
            [Op.gt]: new Date()
          }
        }
      });

      return token ? this._toPlainObject(token) : null;
    } catch (error) {
      throw new Error(`Error al buscar token válido: ${error.message}`);
    }
  }

  async findByToken(tokenValue) {
    try {
      console.log(`🔍 Buscando token en BD: ${tokenValue.substring(0, 10)}...`);
      
      const token = await this.model.findOne({
        where: { token: tokenValue }
      });

      if (token) {
        console.log(`Token encontrado en BD`);
        return this._toPlainObject(token);
      } else {
        console.log(`Token NO encontrado en BD`);
        return null;
      }
    } catch (error) {
      console.error('Error en findByToken:', error);
      throw new Error(`Error al buscar token: ${error.message}`);
    }
  }

  async markAsUsed(tokenValue, ipAddress = null) {
    try {
      const token = await this.model.findOne({
        where: { token: tokenValue }
      });

      if (!token) {
        throw new Error('Token no encontrado');
      }

      await token.update({
        usado: true,
        fecha_uso: new Date(),
        ip_uso: ipAddress
      });

      return this._toPlainObject(token);
    } catch (error) {
      throw new Error(`Error al marcar token como usado: ${error.message}`);
    }
  }

  async findBySurveyId(surveyId) {
    try {
      const tokens = await this.model.findAll({
        where: { id_encuesta: surveyId }
      });

      return tokens.map(token => this._toPlainObject(token));
    } catch (error) {
      throw new Error(`Error al buscar tokens de encuesta: ${error.message}`);
    }
  }

  async getStats(surveyId) {
    try {
      const tokens = await this.findBySurveyId(surveyId);
      const now = new Date();

      const stats = {
        total: tokens.length,
        completed: tokens.filter(t => t.usado).length,
        pending: tokens.filter(t => !t.usado && new Date(t.fecha_expiracion) > now).length,
        expired: tokens.filter(t => !t.usado && new Date(t.fecha_expiracion) <= now).length
      };

      stats.completionRate = stats.total > 0 
        ? ((stats.completed / stats.total) * 100).toFixed(2)
        : 0;

      return stats;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  _toPlainObject(sequelizeInstance) {
    if (!sequelizeInstance) return null;
    return sequelizeInstance.get({ plain: true });
  }
}

module.exports = SurveyTokenRepository;
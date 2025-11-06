const ParticipacionModel = require('./models/registration/ParticipacionModel');
const { sequelize } = require('../../config/database');

class ParticipacionRepository {
  constructor() {
    this.Participacion = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      console.log('🔄 ParticipacionRepository: Inicializando modelo Participacion...');
      
      this.Participacion = ParticipacionModel.init(sequelize);
      
      if (!this.Participacion) {
        throw new Error('Error al inicializar el modelo Participacion.');
      }
      
      console.log('✅ ParticipacionRepository: Modelo Participacion inicializado correctamente');
      this.initialized = true;
    }
  }

  /**
   * Crear una nueva participación
   * 
   * @param {Object} participacionData - Datos de la participación
   * @returns {Promise<Object>} Participación creada
   */
  async create(participacionData) {
    try {
      await this.initialize();
      
      console.log('🔍 ParticipacionRepository: Creando participación...');
      
      const participacion = await this.Participacion.create(participacionData);
      
      console.log(`✅ ParticipacionRepository: Participación creada con ID: ${participacion.id_participacion}`);
      
      return participacion.get({ plain: true });
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al crear participación:', error);
      throw new Error(`Error al crear participación: ${error.message}`);
    }
  }

  /**
   * Obtener una participación por ID
   * 
   * @param {number} id - ID de la participación
   * @returns {Promise<Object|null>} Participación encontrada
   */
  async findById(id) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Buscando participación con ID: ${id}`);
      
      const participacion = await this.Participacion.findByPk(id);
      
      if (participacion) {
        console.log(`✅ ParticipacionRepository: Participación encontrada`);
        return participacion.get({ plain: true });
      } else {
        console.log(`❌ ParticipacionRepository: No se encontró participación con ID: ${id}`);
        return null;
      }
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al buscar participación por ID:', error);
      throw new Error(`Error al buscar participación por ID: ${error.message}`);
    }
  }

  /**
   * Verificar si un estudiante ya participó en una encuesta
   * 
   * @param {number} idEstudiante - ID del estudiante
   * @param {number} idEncuesta - ID de la encuesta
   * @returns {Promise<Object|null>} Participación si existe
   */
  async findByStudentAndSurvey(idEstudiante, idEncuesta) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Buscando participación de estudiante ${idEstudiante} en encuesta ${idEncuesta}`);
      
      const participacion = await this.Participacion.findOne({
        where: {
          id_estudiante: idEstudiante,
          id_encuesta: idEncuesta
        }
      });
      
      if (participacion) {
        console.log(`✅ ParticipacionRepository: Participación encontrada`);
        return participacion.get({ plain: true });
      } else {
        console.log(`❌ ParticipacionRepository: No se encontró participación`);
        return null;
      }
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al buscar participación:', error);
      throw new Error(`Error al buscar participación: ${error.message}`);
    }
  }

  /**
   * Obtener todas las participaciones de un estudiante
   * 
   * @param {number} idEstudiante - ID del estudiante
   * @returns {Promise<Array>} Lista de participaciones
   */
  async findByStudent(idEstudiante) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Buscando participaciones del estudiante ${idEstudiante}`);
      
      const participaciones = await this.Participacion.findAll({
        where: { id_estudiante: idEstudiante },
        order: [['fecha_respuesta', 'DESC']]
      });
      
      console.log(`✅ ParticipacionRepository: ${participaciones.length} participaciones encontradas`);
      
      return participaciones.map(p => p.get({ plain: true }));
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al buscar participaciones del estudiante:', error);
      throw new Error(`Error al buscar participaciones del estudiante: ${error.message}`);
    }
  }

  /**
   * Obtener todas las participaciones de una encuesta
   * 
   * @param {number} idEncuesta - ID de la encuesta
   * @returns {Promise<Array>} Lista de participaciones
   */
  async findBySurvey(idEncuesta) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Buscando participaciones de la encuesta ${idEncuesta}`);
      
      const participaciones = await this.Participacion.findAll({
        where: { id_encuesta: idEncuesta },
        order: [['fecha_respuesta', 'DESC']]
      });
      
      console.log(`✅ ParticipacionRepository: ${participaciones.length} participaciones encontradas`);
      
      return participaciones.map(p => p.get({ plain: true }));
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al buscar participaciones de la encuesta:', error);
      throw new Error(`Error al buscar participaciones de la encuesta: ${error.message}`);
    }
  }

  /**
   * Actualizar el estatus de una participación
   * 
   * @param {number} id - ID de la participación
   * @param {string} estatus - Nuevo estatus
   * @returns {Promise<Object>} Participación actualizada
   */
  async updateStatus(id, estatus) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Actualizando estatus de participación ${id} a: ${estatus}`);
      
      const participacion = await this.Participacion.findByPk(id);
      
      if (!participacion) {
        throw new Error(`Participación con ID ${id} no encontrada`);
      }
      
      await participacion.update({ estatus });
      
      console.log(`✅ ParticipacionRepository: Estatus actualizado correctamente`);
      
      return participacion.get({ plain: true });
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al actualizar estatus:', error);
      throw new Error(`Error al actualizar estatus: ${error.message}`);
    }
  }

  /**
   * Actualizar una participación
   * 
   * @param {number} id - ID de la participación
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Participación actualizada
   */
  async update(id, updateData) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Actualizando participación ${id}`);
      
      const participacion = await this.Participacion.findByPk(id);
      
      if (!participacion) {
        throw new Error(`Participación con ID ${id} no encontrada`);
      }
      
      await participacion.update(updateData);
      
      console.log(`✅ ParticipacionRepository: Participación actualizada correctamente`);
      
      return participacion.get({ plain: true });
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al actualizar participación:', error);
      throw new Error(`Error al actualizar participación: ${error.message}`);
    }
  }

  /**
   * Eliminar una participación
   * 
   * @param {number} id - ID de la participación
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async delete(id) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Eliminando participación ${id}`);
      
      const participacion = await this.Participacion.findByPk(id);
      
      if (!participacion) {
        throw new Error(`Participación con ID ${id} no encontrada`);
      }
      
      await participacion.destroy();
      
      console.log(`✅ ParticipacionRepository: Participación eliminada correctamente`);
      
      return true;
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al eliminar participación:', error);
      throw new Error(`Error al eliminar participación: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de participación de una encuesta
   * 
   * @param {number} idEncuesta - ID de la encuesta
   * @returns {Promise<Object>} Estadísticas de participación
   */
  async getStatsBySurvey(idEncuesta) {
    try {
      await this.initialize();
      
      console.log(`🔍 ParticipacionRepository: Obteniendo estadísticas de encuesta ${idEncuesta}`);
      
      const query = `
        SELECT 
          COUNT(*) as total_participaciones,
          COUNT(CASE WHEN estatus = 'completada' THEN 1 END) as completadas,
          COUNT(CASE WHEN estatus = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estatus = 'incompleta' THEN 1 END) as incompletas,
          MIN(fecha_respuesta) as primera_respuesta,
          MAX(fecha_respuesta) as ultima_respuesta
        FROM participaciones
        WHERE id_encuesta = :idEncuesta
      `;
      
      const [stats] = await sequelize.query(query, {
        replacements: { idEncuesta },
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ ParticipacionRepository: Estadísticas obtenidas`);
      
      return stats;
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al obtener estadísticas:', error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  /**
   * Obtener todas las participaciones con información de estudiante y encuesta
   * 
   * @param {number} idEncuesta - ID de la encuesta (opcional)
   * @returns {Promise<Array>} Lista de participaciones con relaciones
   */
  async findAllWithDetails(idEncuesta = null) {
    try {
      await this.initialize();
      
      console.log('🔍 ParticipacionRepository: Obteniendo participaciones con detalles');
      
      const query = `
        SELECT 
          p.id_participacion,
          p.id_estudiante,
          p.id_encuesta,
          p.fecha_respuesta,
          p.estatus,
          e.nombre as estudiante_nombre,
          e.matricula as estudiante_matricula,
          e.email as estudiante_email,
          enc.titulo as encuesta_titulo,
          enc.descripcion as encuesta_descripcion
        FROM participaciones p
        INNER JOIN estudiantes e ON p.id_estudiante = e.id
        INNER JOIN encuestas enc ON p.id_encuesta = enc.id_encuesta
        ${idEncuesta ? 'WHERE p.id_encuesta = :idEncuesta' : ''}
        ORDER BY p.fecha_respuesta DESC
      `;
      
      const participaciones = await sequelize.query(query, {
        replacements: { idEncuesta },
        type: sequelize.QueryTypes.SELECT
      });
      
      console.log(`✅ ParticipacionRepository: ${participaciones.length} participaciones encontradas`);
      
      return participaciones;
    } catch (error) {
      console.error('❌ ParticipacionRepository: Error al obtener participaciones con detalles:', error);
      throw new Error(`Error al obtener participaciones con detalles: ${error.message}`);
    }
  }
}

module.exports = ParticipacionRepository;
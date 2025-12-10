const EstudianteModel = require('./models/registration/EstudianteModel');
const { sequelize } = require('../../config/database');

class EstudianteRepository {
  constructor() {
    this.Estudiante = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      console.log('🔄 EstudianteRepository: Inicializando modelo Estudiante...');
      
      this.Estudiante = EstudianteModel.init(sequelize);
      
      if (!this.Estudiante) {
        throw new Error('Error al inicializar el modelo Estudiante.');
      }
      
      console.log('✅ EstudianteRepository: Modelo Estudiante inicializado correctamente');
      this.initialized = true;
    }
  }

    async getEstudianteByEmail(email) {
    try {
      await this.initialize();
      
      console.log(`🔍 EstudianteRepository: Buscando estudiante con email: ${email}`);
      
      const estudiante = await this.Estudiante.findOne({
        where: {
          email: email
        }
      });

      if (estudiante) {
        console.log(`✅ EstudianteRepository: Estudiante encontrado: ${estudiante.nombre}`);
      } else {
        console.log(`❌ EstudianteRepository: No se encontró estudiante con email: ${email}`);
      }
      
      return estudiante;
    } catch (error) {
      console.error('❌ EstudianteRepository: Error al buscar estudiante por email:', error);
      throw new Error(`Error al buscar estudiante por email: ${error.message}`);
    }
  }

  async getEstudiantesBasicInfo() {
    try {
      await this.initialize();
      
      console.log('🔍 EstudianteRepository: Obteniendo información básica de estudiantes...');
      
      const estudiantes = await this.Estudiante.findAll({
        attributes: ['matricula', 'nombre', 'tutor_academico_id'],
        order: [['matricula', 'ASC']]
      });

      console.log(`✅ EstudianteRepository: ${estudiantes.length} estudiantes encontrados`);
      return estudiantes;
    } catch (error) {
      console.error('❌ EstudianteRepository: Error al obtener información básica de estudiantes:', error);
      throw new Error(`Error al obtener información básica de estudiantes: ${error.message}`);
    }
  }

  async getEstudianteByMatricula(matricula) {
    try {
      await this.initialize();
      
      console.log(`🔍 EstudianteRepository: Buscando estudiante con matrícula: ${matricula}`);
      
      const estudiante = await this.Estudiante.findOne({
        where: {
          matricula: matricula
        }
      });

      if (estudiante) {
        console.log(`✅ EstudianteRepository: Estudiante encontrado: ${estudiante.nombre}`);
      } else {
        console.log(`❌ EstudianteRepository: No se encontró estudiante con matrícula: ${matricula}`);
      }
      
      return estudiante;
    } catch (error) {
      console.error('❌ EstudianteRepository: Error al buscar estudiante por matrícula:', error);
      throw new Error(`Error al buscar estudiante por matrícula: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      await this.initialize();
      
      console.log(`🔍 EstudianteRepository: Buscando estudiante con ID: ${id}`);
      
      const estudiante = await this.Estudiante.findByPk(id);
      console.log("estudiante", estudiante)
      
      if (estudiante) {
        console.log(`✅ EstudianteRepository: Estudiante encontrado: ${estudiante.nombre}`);
        return {
          id: estudiante.id,
          nombre: estudiante.nombre,
          matricula: estudiante.matricula,
          email: estudiante.email,
          tutor_academico_id: estudiante.tutor_academico_id
        };
      } else {
        console.log(`EstudianteRepository: No se encontró estudiante con ID: ${id}`);
        return null;
      }
    } catch (error) {
      console.error('EstudianteRepository: Error al buscar estudiante por ID:', error);
      throw new Error(`Error al buscar estudiante por ID: ${error.message}`);
    }
  }

  /**
   * Obtiene los estudiantes que NO han respondido una encuesta específica
   * 
   * @param {number} surveyId - ID de la encuesta
   * @returns {Promise<Array>} Lista de estudiantes sin respuesta
   */
async getStudentsWithoutResponse(surveyId) {
  try {
    await this.initialize();
    
    console.log(`🔍 EstudianteRepository: Buscando estudiantes sin respuesta para encuesta ID: ${surveyId}`);
    
    const query = `
      SELECT 
        e.id,
        e.matricula,
        e.nombre,
        e.email,
        e.estatus,
        e.cohorte_id
      FROM estudiantes e
      WHERE 
        e.id NOT IN (
          SELECT p.id_estudiante 
          FROM participaciones p 
          WHERE p.id_encuesta = :surveyId 
            AND p.estatus = 'completada'
        )
      ORDER BY e.nombre ASC
    `;

    const estudiantes = await sequelize.query(query, {
      replacements: { surveyId },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ EstudianteRepository: ${estudiantes.length} estudiantes sin respuesta encontrados`);
    
    return estudiantes;
  } catch (error) {
    console.error('❌ EstudianteRepository: Error al buscar estudiantes sin respuesta:', error);
    throw new Error(`Error al buscar estudiantes sin respuesta: ${error.message}`);
  }
}


async getStudentPendingSurveys(studentId) {
  try {
    await this.initialize();
    
    console.log(`🔍 EstudianteRepository: Obteniendo encuestas PENDIENTES para estudiante ID: ${studentId}`);
    
    const query = `
      SELECT 
        e.id_encuesta,
        e.titulo,
        e.descripcion,
        e.tipo,
        (SELECT COUNT(*) FROM preguntas p WHERE p.id_encuesta = e.id_encuesta) as total_preguntas,
        'pendiente' as estado_estudiante
      FROM encuestas e
      WHERE e.id_encuesta NOT IN (
          SELECT p.id_encuesta 
          FROM participaciones p 
          WHERE p.id_estudiante = :studentId 
            AND p.estatus = 'completada'
        )
      ORDER BY e.created_at DESC
    `;

    const encuestas = await sequelize.query(query, {
      replacements: { studentId },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ EstudianteRepository: ${encuestas.length} encuestas PENDIENTES encontradas`);
    
    return encuestas;
  } catch (error) {
    console.error('❌ EstudianteRepository: Error al obtener encuestas pendientes:', error);
    throw new Error(`Error al obtener encuestas pendientes: ${error.message}`);
  }
}

/**
 * Obtiene las encuestas RESPONDIDAS de un estudiante
 * (Encuestas que el estudiante ya completó)
 * 
 * @param {number} studentId - ID del estudiante
 * @returns {Promise<Array>} Lista de encuestas respondidas
 */
async getStudentCompletedSurveys(studentId) {
  try {
    await this.initialize();
    
    console.log(`🔍 EstudianteRepository: Obteniendo encuestas RESPONDIDAS para estudiante ID: ${studentId}`);
    
    const query = `
      SELECT 
        e.id_encuesta,
        e.titulo,
        e.descripcion,
        e.tipo,
        p.id_participacion,
        p.fecha_respuesta,
        p.estatus as estatus_participacion,
        (SELECT COUNT(*) FROM preguntas pr WHERE pr.id_encuesta = e.id_encuesta) as total_preguntas,
        (SELECT COUNT(*) FROM respuestas r WHERE r.id_participacion = p.id_participacion) as total_respuestas,
        'completada' as estado_estudiante
      FROM encuestas e
      INNER JOIN participaciones p ON p.id_encuesta = e.id_encuesta
      WHERE p.id_estudiante = :studentId
        AND p.estatus = 'completada'
      ORDER BY p.fecha_respuesta DESC
    `;

    const encuestas = await sequelize.query(query, {
      replacements: { studentId },
      type: sequelize.QueryTypes.SELECT
    });

    console.log(`✅ EstudianteRepository: ${encuestas.length} encuestas RESPONDIDAS encontradas`);
    
    return encuestas;
  } catch (error) {
    console.error('❌ EstudianteRepository: Error al obtener encuestas respondidas:', error);
    throw new Error(`Error al obtener encuestas respondidas: ${error.message}`);
  }
}
}

module.exports = EstudianteRepository;
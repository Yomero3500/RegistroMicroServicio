const SurveyModel = require('./models/registration/EncuestaModel');
const QuestionModel = require('./models/registration/PreguntaModel');
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { getModels } = require('./models');
const { Resend } = require('resend');
const dotenv = require('dotenv')
dotenv.config();

class SurveyRepository {

    getModel() {
        const surveyModel = SurveyModel.init(sequelize); 
        const questionModel = QuestionModel.init(sequelize); 
        const resend = new Resend(process.env.RESEND_KEY)
        return {
            surveyModel,
            questionModel,
            resend
        }
    }

  getBaseJoins() {
    return `
      FROM encuestas e
      LEFT JOIN participaciones p ON e.id_encuesta = p.id_encuesta
      LEFT JOIN usuarios u ON e.id_usuario = u.id
    `;
  }

// Reemplazar el método save existente en SurveyRepository

async save(titulo, id_usuario, descripcion, fecha_creacion, fecha_inicio, fecha_fin, tipo = null) {
  const { surveyModel } = this.getModel();
  const survey = await surveyModel.create({
    titulo,
    id_usuario,
    descripcion,
    fecha_creacion,
    fecha_inicio,
    fecha_fin,
    tipo,
  });

  return {
    id_encuesta: survey.id_encuesta,
    titulo: survey.titulo,
    id_usuario: survey.id_usuario,
    descripcion: survey.descripcion,
    fecha_creacion: survey.fecha_creacion,
    fecha_inicio: survey.fecha_inicio,
    fecha_fin: survey.fecha_fin,
    tipo: survey.tipo
  };
}
  async listAll() {
    const query = `
      SELECT 
        e.id_encuesta,
        e.titulo,
        e.fecha_creacion, 
        e.descripcion,
        e.fecha_inicio,
        e.fecha_fin,
        COUNT(DISTINCT p.id_participacion) AS total_respuestas,
        u.nombre_completo AS creador
      ${this.getBaseJoins()}
      GROUP BY e.id_encuesta, u.nombre_completo
      ORDER BY e.fecha_creacion DESC
    `;

    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    return results;
  }

async getSurveysByType(tipos = ['documento', 'seguimiento', 'final', 'empresa']) {
  const query = `
    SELECT 
      e.id_encuesta,
      e.titulo,
      e.tipo,
      e.fecha_creacion, 
      e.descripcion,
      e.fecha_inicio,
      e.fecha_fin,
      COUNT(DISTINCT p.id_participacion) AS total_respuestas,
      u.nombre_completo AS creador
    ${this.getBaseJoins()}
    WHERE e.tipo IN (:tipos)
    GROUP BY e.id_encuesta, u.nombre_completo
    ORDER BY e.fecha_creacion DESC
  `;

  const results = await sequelize.query(query, {
    replacements: { tipos },
    type: QueryTypes.SELECT,
  });

  return results;
}


async getSurveysExcludingTypes(tiposExcluir = ['documento', 'seguimiento', 'final', 'empresa']) {
  const query = `
    SELECT 
      e.id_encuesta,
      e.titulo,
      e.tipo,
      e.fecha_creacion, 
      e.descripcion,
      e.fecha_inicio,
      e.fecha_fin,
      COUNT(DISTINCT p.id_participacion) AS total_respuestas,
      u.nombre_completo AS creador
    ${this.getBaseJoins()}
    WHERE e.tipo NOT IN (:tiposExcluir)
    GROUP BY e.id_encuesta, u.nombre_completo
    ORDER BY e.fecha_creacion DESC
  `;

  const results = await sequelize.query(query, {
    replacements: { tiposExcluir },
    type: QueryTypes.SELECT,
  });

  return results;
}


async getSurveysBySpecificType(tipo) {
  const query = `
    SELECT 
      e.id_encuesta,
      e.titulo,
      e.tipo,
      e.fecha_creacion, 
      e.descripcion,
      e.fecha_inicio,
      e.fecha_fin,
      COUNT(DISTINCT p.id_participacion) AS total_respuestas,
      u.nombre_completo AS creador
    ${this.getBaseJoins()}
    WHERE e.tipo = :tipo
    GROUP BY e.id_encuesta, u.nombre_completo
    ORDER BY e.fecha_creacion DESC
  `;

  const results = await sequelize.query(query, {
    replacements: { tipo },
    type: QueryTypes.SELECT,
  });

  return results;
}

  async getSurveysWithQuestions() {
    const query = `
      SELECT 
        e.id_encuesta,
        e.titulo,
        e.descripcion,
        e.fecha_inicio,
        e.fecha_fin,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id_pregunta', p.id_pregunta,
            'title', p.title,
            'type', p.type,
            'options', p.options,
            'required', p.required
          )
        ) AS preguntas
      FROM encuestas e
      LEFT JOIN preguntas p ON p.id_encuesta = e.id_encuesta
      GROUP BY e.id_encuesta, e.titulo, e.descripcion, e.fecha_inicio, e.fecha_fin
      ORDER BY e.fecha_creacion DESC;
    `;

    const results = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    return results;
  }

  async delete(id_encuesta) {
    const { surveyModel } = this.getModel()
    const deletedRows = await surveyModel.destroy({ where: { id_encuesta } });
    return deletedRows > 0;
  }

  async update(id_encuesta, titulo, id_usuario, descripcion, fecha_creacion, fecha_inicio, fecha_fin) {
    const { surveyModel } = this.getModel()
    const updateData = {};
    if (titulo !== undefined) updateData.titulo = titulo;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (fecha_creacion !== undefined) updateData.fecha_creacion = fecha_creacion;
    if (fecha_inicio !== undefined) updateData.fecha_inicio = fecha_inicio;
    if (fecha_fin !== undefined) updateData.fecha_fin = fecha_fin;
    if (id_usuario !== undefined) updateData.id_usuario = id_usuario;

    const [updatedRows] = await surveyModel.update(updateData, { where: { id_encuesta } });

    if (updatedRows === 0) {
      throw new Error(`No se encontró la encuesta con id ${id_encuesta} para actualizar.`);
    }

    const updatedSurvey = await surveyModel.findByPk(id_encuesta);
    if (!updatedSurvey) {
      throw new Error(`Error inesperado al obtener la encuesta actualizada con id ${id_encuesta}.`);
    }

    return {
      id_encuesta: updatedSurvey.id_encuesta,
      titulo: updatedSurvey.titulo,
      id_usuario: updatedSurvey.id_usuario,
      descripcion: updatedSurvey.descripcion,
      fecha_creacion: updatedSurvey.fecha_creacion,
      fecha_inicio: updatedSurvey.fecha_inicio,
      fecha_fin: updatedSurvey.fecha_fin
    };
  }

  async getBasicStats(id_encuesta) {
    const query = `
      SELECT 
        e.id_encuesta,
        e.titulo,
        e.descripcion,
        e.fecha_inicio,
        e.fecha_fin,
        COUNT(DISTINCT p.id_participacion) as total_respuestas,
        u.nombre_completo as creador
      ${this.getBaseJoins()}
      WHERE e.id_encuesta = :id_encuesta
      GROUP BY e.id_encuesta, u.nombre_completo
    `;

    const results = await sequelize.query(query, {
      replacements: { id_encuesta },
      type: QueryTypes.SELECT,
    });

    if (!results || results.length === 0) {
      throw new Error("Encuesta no encontrada");
    }

    return results[0];
  }

  async getResponseDistribution(id_encuesta) {
    const query = `
      SELECT 
          p.id_pregunta,
          p.title AS titulo,
          p.options AS opciones,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'respuesta', r.respuesta_texto,
                  'cantidad', r.cantidad,
                  'porcentaje', r.porcentaje
              )
          ) AS respuestas
      FROM preguntas p
      JOIN (
          SELECT 
              id_pregunta,
              respuesta_texto,
              COUNT(*) AS cantidad,
              ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY id_pregunta), 0) AS porcentaje
          FROM respuestas
          GROUP BY id_pregunta, respuesta_texto
      ) r ON p.id_pregunta = r.id_pregunta
      WHERE p.id_encuesta = :id_encuesta
      GROUP BY p.id_pregunta, p.title, p.options
      ORDER BY p.id_pregunta;
    `;

    return await sequelize.query(query, {
      replacements: { id_encuesta },
      type: QueryTypes.SELECT,
    });
  }

  async getTemporalDaily(id_encuesta) {
    const query = `
      SELECT 
        DATE_FORMAT(p.fecha_respuesta, '%d/%m') AS name,
        COUNT(*) AS responses
      FROM participaciones p
      JOIN respuestas r ON p.id_participacion = r.id_participacion
      WHERE p.id_encuesta = :id_encuesta
        AND p.fecha_respuesta >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(p.fecha_respuesta, '%d/%m')
      ORDER BY DATE_FORMAT(p.fecha_respuesta, '%d/%m');
    `;
    return await sequelize.query(query, { replacements: { id_encuesta }, type: QueryTypes.SELECT });
  }

  async getTemporalWeekly(id_encuesta) {
    const query = `
      SELECT
        ANY_VALUE(CONCAT('Sem ', WEEK(p.fecha_respuesta) - WEEK(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) + 1)) as name,
        COUNT(*) as responses
      FROM participaciones p
      JOIN respuestas r ON p.id_participacion = r.id_participacion
      WHERE p.id_encuesta = :id_encuesta
        AND p.fecha_respuesta >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
      GROUP BY WEEK(p.fecha_respuesta)
      ORDER BY WEEK(p.fecha_respuesta);
    `;
    return await sequelize.query(query, { replacements: { id_encuesta }, type: QueryTypes.SELECT });
  }

  async getTemporalMonthly(id_encuesta) {
    const query = `
      SELECT
        ANY_VALUE(DATE_FORMAT(p.fecha_respuesta, '%b')) as name,
        COUNT(*) as responses
      FROM participaciones p
      JOIN respuestas r ON p.id_participacion = r.id_participacion
      WHERE p.id_encuesta = :id_encuesta
        AND p.fecha_respuesta >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(p.fecha_respuesta), MONTH(p.fecha_respuesta)
      ORDER BY YEAR(p.fecha_respuesta), MONTH(p.fecha_respuesta);
    `;
    return await sequelize.query(query, { replacements: { id_encuesta }, type: QueryTypes.SELECT });
  }

  async getHourlyAnalysis(id_encuesta) {
    const query = `
      SELECT 
        DATE_FORMAT(p.fecha_respuesta, '%H:00') as hour,
        COUNT(*) as responses,
        ROUND(COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM participaciones 
          WHERE id_encuesta = :id_encuesta
        ), 1) as percentage
      FROM participaciones p
      WHERE p.id_encuesta = :id_encuesta AND p.estatus = 'completado'
      GROUP BY DATE_FORMAT(p.fecha_respuesta, '%H:00')
      ORDER BY DATE_FORMAT(p.fecha_respuesta, '%H:00');
    `;
    return await sequelize.query(query, { replacements: { id_encuesta }, type: QueryTypes.SELECT });
  }

  async getSummaryMetrics(id_encuesta) {
    const query = `
      SELECT 
        COUNT(DISTINCT p.id_participacion) as total_respuestas
      FROM participaciones p
      WHERE p.id_encuesta = :id_encuesta AND p.estatus = 'completado';
    `;
    const results = await sequelize.query(query, { replacements: { id_encuesta }, type: QueryTypes.SELECT });
    return results[0] || null;
  }

  async getPeakHours(id_encuesta) {
    const query = `
      WITH horarios_resumen AS (
        SELECT
          DATE_FORMAT(p.fecha_respuesta, '%H:00') as hora,
          COUNT(*) as cantidad_respuestas
        FROM participaciones p
        WHERE p.id_encuesta = :id_encuesta AND p.estatus = 'completado'
        GROUP BY DATE_FORMAT(p.fecha_respuesta, '%H:00')
      )
      SELECT
        ANY_VALUE((SELECT hora FROM horarios_resumen ORDER BY cantidad_respuestas DESC LIMIT 1)) as hora_pico,
        ANY_VALUE((SELECT cantidad_respuestas FROM horarios_resumen ORDER BY cantidad_respuestas DESC LIMIT 1)) as respuestas_pico,
        ANY_VALUE((SELECT hora FROM horarios_resumen ORDER BY cantidad_respuestas ASC LIMIT 1)) as hora_valle,
        ANY_VALUE((SELECT cantidad_respuestas FROM horarios_resumen ORDER BY cantidad_respuestas ASC LIMIT 1)) as respuestas_valle;
    `;
    const results = await sequelize.query(query, { replacements: { id_encuesta }, type: QueryTypes.SELECT });
    return results[0] || null;
  }

  async getSurveyQuestions(id_encuesta) {
    const { questionModel } = this.getModel()
    try {
      const questions = await questionModel.findAll({ where: { id_encuesta } });
      return questions.map(q => ({
        id_pregunta: q.id_pregunta,
        titulo: q.title,
        tipo: q.type,
        opciones: q.options ? JSON.parse(q.options) : [],
        requerida: q.required,
      }));
    } catch (error) {
      console.error("Error al obtener preguntas de la encuesta:", error);
      throw error;
    }
  }


  async sendEmailToStudentSurvey(studentEmail,  studentName, surveyName) {
    try {
      const { resend} = this.getModel()
const data = await resend.emails.send({
  from: "Encuestas <onboarding@resend.dev>", // usa tu dominio verificado en Resend
  to: studentEmail, // dirección del destinatario
  subject: `Correo institucional para completar la encuesta ${surveyName}`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Hola ${studentName || "estimado usuario"},</h2>
      <p>
        Te informamos que tienes una encuesta pendiente por completar: 
        <strong>${surveyName}</strong>.
      </p>
      <p>
        Si ya la has completado, puedes ignorar este mensaje.
      </p>
      <br>
      <p>Atentamente,<br>Equipo del Sistema de Encuestas</p>
    </div>
  `,
});

      return data; 
    }catch(error) {
      throw error
    }
  }

  async getCompleteStats(id_encuesta) {
    try {
      const [
        basicInfo,
        questions,
        distribution,
        temporalDaily,
        temporalWeekly,
        temporalMonthly,
        hourly,
        metrics,
        peakHours,
      ] = await Promise.all([
        this.getBasicStats(id_encuesta),
        this.getSurveyQuestions(id_encuesta),
        this.getResponseDistribution(id_encuesta),
        this.getTemporalDaily(id_encuesta),
        this.getTemporalWeekly(id_encuesta),
        this.getTemporalMonthly(id_encuesta),
        this.getHourlyAnalysis(id_encuesta),
        this.getSummaryMetrics(id_encuesta),
        this.getPeakHours(id_encuesta),
      ]);

      if (!basicInfo || !metrics || !peakHours) {
        return null;
      }

      return {
        basicInfo,
        distribution,
        questions,
        temporal: {
          daily: temporalDaily,
          weekly: temporalWeekly,
          monthly: temporalMonthly,
        },
        hourly,
        metrics,
        peakHours,
      };
    } catch (error) {
      console.error("Error al obtener estadísticas completas:", error);
      throw error;
    }
  }

  async findById(id_encuesta) {
  const { surveyModel } = this.getModel();
  
  try {
    const survey = await surveyModel.findByPk(id_encuesta);
    
    if (!survey) {
      return null;
    }

    return {
      id: survey.id_encuesta,
      id_encuesta: survey.id_encuesta,
      titulo: survey.titulo,
      descripcion: survey.descripcion,
      tipo: survey.tipo,
      fecha_creacion: survey.fecha_creacion,
      fecha_inicio: survey.fecha_inicio,
      fecha_fin: survey.fecha_fin,
      id_usuario: survey.id_usuario
    };
  } catch (error) {
    console.error('❌ SurveyRepository: Error al buscar encuesta por ID:', error);
    throw new Error(`Error al buscar encuesta por ID: ${error.message}`);
  }
} 
}

module.exports = SurveyRepository;

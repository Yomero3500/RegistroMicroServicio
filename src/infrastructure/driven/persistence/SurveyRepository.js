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

// Agregar al final de la clase SurveyRepository, antes del cierre

/**
 * Envía correo con requisitos pendientes a un estudiante
 * @param {string} studentEmail - Email del estudiante
 * @param {string} studentName - Nombre completo del estudiante
 * @param {string} matricula - Matrícula del estudiante
 * @param {Array} requisitosFaltantes - Array con los nombres de los requisitos pendientes
 * @param {number} numRequisitos - Número total de requisitos pendientes
 * @returns {Promise} Resultado del envío
 */
async sendPendingRequirementsEmail(studentEmail, studentName, matricula, requisitosFaltantes = [], numRequisitos = 0) {
  try {
    const { resend } = this.getModel();

    // Formatear lista de requisitos
    const requisitosHTML = requisitosFaltantes
      .map((req, index) => `<li style="margin: 8px 0;">${index + 1}. ${req}</li>`)
      .join('');

    // Determinar nivel de urgencia
    let nivelUrgencia = 'normal';
    let colorUrgencia = '#FFA500'; // Naranja
    let mensajeUrgencia = 'Te recomendamos atender estos requisitos pronto.';

    if (numRequisitos >= 5) {
      nivelUrgencia = 'alta';
      colorUrgencia = '#DC2626'; // Rojo
      mensajeUrgencia = '⚠️ Es urgente que completes estos requisitos para continuar con tu proceso de titulación.';
    } else if (numRequisitos >= 3) {
      nivelUrgencia = 'media';
      colorUrgencia = '#F59E0B'; // Amarillo oscuro
      mensajeUrgencia = 'Te sugerimos dar seguimiento a estos requisitos en breve.';
    } else {
      colorUrgencia = '#3B82F6'; // Azul
      mensajeUrgencia = 'Estás muy cerca de completar todos los requisitos.';
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Servicios Escolares <onboarding@resend.dev>",
      to: studentEmail,
      subject: `Requisitos Pendientes de Titulación - ${numRequisitos} pendiente${numRequisitos > 1 ? 's' : ''}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Requisitos Pendientes</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 40px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
                         Requisitos de Titulación
                      </h1>
                      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                        Universidad Politécnica de Chiapas
                      </p>
                    </td>
                  </tr>

                  <!-- Cuerpo del mensaje -->
                  <tr>
                    <td style="padding: 40px;">
                      
                      <!-- Saludo -->
                      <h2 style="color: #333; margin: 0 0 10px 0; font-size: 22px;">
                        Hola ${studentName || 'Estimado(a) estudiante'},
                      </h2>
                      
                      <!-- Información del estudiante -->
                      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #555; font-size: 14px;">
                          <strong>Matrícula:</strong> ${matricula}
                        </p>
                      </div>

                      <!-- Mensaje principal -->
                      <p style="color: #555; line-height: 1.6; font-size: 15px; margin: 20px 0;">
                        Te informamos que actualmente tienes <strong style="color: ${colorUrgencia};">${numRequisitos} requisito${numRequisitos > 1 ? 's' : ''} pendiente${numRequisitos > 1 ? 's' : ''}</strong> para completar tu proceso de titulación.
                      </p>

                      <!-- Badge de urgencia -->
                      <div style="background-color: ${colorUrgencia}15; border: 2px solid ${colorUrgencia}; border-radius: 6px; padding: 15px; margin: 25px 0;">
                        <p style="margin: 0; color: ${colorUrgencia}; font-weight: 600; font-size: 14px;">
                          ${mensajeUrgencia}
                        </p>
                      </div>

                      <!-- Lista de requisitos -->
                      <div style="margin: 30px 0;">
                        <h3 style="color: #333; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                           Requisitos Pendientes:
                        </h3>
                        <ul style="list-style: none; padding: 0; margin: 0;">
                          ${requisitosHTML}
                        </ul>
                      </div>

                      <!-- Instrucciones -->
                      <div style="background-color: #e0e7ff; border-radius: 6px; padding: 20px; margin: 30px 0;">
                        <h4 style="color: #4338ca; margin: 0 0 10px 0; font-size: 16px;">
                           ¿Qué debes hacer?
                        </h4>
                        <ol style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
                          <li>Revisa cada requisito pendiente</li>
                          <li>Completa las encuestas correspondientes en el sistema</li>
                          <li>Presenta la documentación necesaria</li>
                          <li>Contacta a Servicios Escolares si tienes dudas</li>
                        </ol>
                      </div>

                      <!-- Botón de acción -->
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="${process.env.BASE_URL || 'http://localhost:5173'}/estudiante/requisitos" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; 
                                  text-decoration: none; 
                                  padding: 14px 32px; 
                                  border-radius: 6px; 
                                  font-weight: 600;
                                  font-size: 15px;
                                  display: inline-block;
                                  box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                          Ver Mis Requisitos
                        </a>
                      </div>

                      <!-- Nota importante -->
                      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #856404; font-size: 13px;">
                          <strong>Importante:</strong> Es necesario completar todos los requisitos para poder continuar con tu proceso de titulación. Si ya has completado alguno de estos requisitos, por favor ignora este mensaje o contacta a Servicios Escolares.
                        </p>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 25px 40px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; line-height: 1.6;">
                        <strong>Atentamente,</strong><br>
                        Departamento de Servicios Escolares<br>
                        Universidad Politécnica de Chiapas
                      </p>
                      
                      <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
                        <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.5;">
                           Correo enviado automáticamente. Por favor no responder a este mensaje.<br>
                          Si tienes dudas, comunícate con Servicios Escolares.
                        </p>
                      </div>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ Correo de requisitos enviado a ${studentEmail}`);
    return {
      success: true,
      messageId: data.id,
      recipient: studentEmail,
      numRequisitos
    };

  } catch (error) {
    console.error('❌ Error al enviar correo de requisitos:', error);
    throw new Error(`Error al enviar correo: ${error.message}`);
  }
}
}

module.exports = SurveyRepository;

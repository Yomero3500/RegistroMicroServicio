const crypto = require('crypto');

class SendSurveyEmailUseCase {
  constructor(
    studentRepository,
    surveyRepository,
    surveyTokenRepository,
    emailRepository
  ) {
    this.studentRepository = studentRepository;
    this.surveyRepository = surveyRepository;
    this.surveyTokenRepository = surveyTokenRepository;
    this.emailRepository = emailRepository;
  }

  /**
   * Envía una encuesta por email a un estudiante específico
   */
  async execute({ surveyId, studentId, expirationDays = 30 }) {
    try {
      this._validateInput({ surveyId, studentId, expirationDays });

      // Verificar que el servicio de email esté funcionando
      const emailServiceReady = await this.emailRepository.verifyConnection();
      if (!emailServiceReady) {
        throw new Error('El servicio de email no está disponible. Verifica la configuración de Resend.');
      }

      const survey = await this.surveyRepository.findById(surveyId);
      if (!survey) {
        throw new Error(`La encuesta con ID ${surveyId} no existe`);
      }

      const student = await this.studentRepository.findById(studentId);
      if (!student) {
        throw new Error(`El estudiante con ID ${studentId} no existe`);
      }

      if (!student.email || !this._isValidEmail(student.email)) {
        throw new Error(`El estudiante ${student.nombre} no tiene un email válido: ${student.email || 'sin email'}`);
      }

      const token = await this._getOrCreateToken({
        surveyId,
        studentId,
        expirationDays
      });

      const surveyUrl = this._generateSurveyUrl(token.token);

      // Enviar email usando Resend
      const emailResult = await this.emailRepository.sendSurveyEmail({
        student,
        survey,
        token: token.token,
        surveyUrl
      });

      if (!emailResult.success) {
        console.error(`Error enviando email a ${student.email}:`, emailResult.error);
        throw new Error(`Error al enviar email: ${emailResult.error}`);
      }

      console.log(`Email enviado exitosamente a ${student.email} - Message ID: ${emailResult.messageId}`);

      return {
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.nombre,
            matricula: student.matricula,
            email: student.email
          },
          survey: {
            id: survey.id,
            title: survey.titulo,
            description: survey.descripcion
          },
          token: {
            id: token.id,
            value: token.token,
            expiresAt: token.fecha_expiracion,
            isNew: token.isNew
          },
          surveyUrl,
          email: {
            messageId: emailResult.messageId,
            recipient: emailResult.recipient,
            service: 'resend',
            sentAt: new Date().toISOString()
          }
        },
        message: `Encuesta "${survey.titulo}" enviada exitosamente a ${student.nombre} (${student.email})`
      };

    } catch (error) {
      console.error('Error en SendSurveyEmailUseCase:', error.message);
      throw new Error(`Error al enviar encuesta por email: ${error.message}`);
    }
  }

  /**
   * Envía encuestas a múltiples estudiantes en lotes
   */
  async executeBatch({ surveyId, studentIds, expirationDays = 30 }) {
    try {
      this._validateInput({ surveyId, studentId: studentIds[0], expirationDays });

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        throw new Error('Se requiere un array de IDs de estudiantes');
      }

      console.log(`Iniciando envío masivo de encuesta ${surveyId} a ${studentIds.length} estudiantes`);

      // Verificar servicio de email
      const emailServiceReady = await this.emailRepository.verifyConnection();
      if (!emailServiceReady) {
        throw new Error('El servicio de email no está disponible. Verifica la configuración de Resend.');
      }

      // Obtener datos de la encuesta
      const survey = await this.surveyRepository.findById(surveyId);
      if (!survey) {
        throw new Error(`La encuesta con ID ${surveyId} no existe`);
      }

      // Preparar datos para envío en lotes
      const emailsData = [];
      const failedStudents = [];

      for (const studentId of studentIds) {
        try {
          const student = await this.studentRepository.findById(studentId);
          
          if (!student) {
            failedStudents.push({
              studentId,
              error: 'Estudiante no encontrado'
            });
            continue;
          }

          if (!student.email || !this._isValidEmail(student.email)) {
            failedStudents.push({
              studentId,
              studentName: student.nombre,
              error: `Email inválido: ${student.email || 'sin email'}`
            });
            continue;
          }

          // Obtener o crear token
          const token = await this._getOrCreateToken({
            surveyId,
            studentId,
            expirationDays
          });

          const surveyUrl = this._generateSurveyUrl(token.token);

          emailsData.push({
            student,
            survey,
            token: token.token,
            surveyUrl
          });

        } catch (error) {
          failedStudents.push({
            studentId,
            error: error.message
          });
        }
      }

      console.log(`Preparados ${emailsData.length} emails para envío. ${failedStudents.length} estudiantes fallaron en preparación.`);

      // Enviar emails en lotes usando Resend
      const batchResult = await this.emailRepository.sendBatchSurveyEmails(emailsData);

      return {
        success: true,
        data: {
          survey: {
            id: survey.id,
            title: survey.titulo,
            description: survey.descripcion
          },
          batch: {
            total: studentIds.length,
            prepared: emailsData.length,
            successful: batchResult.successful,
            failed: batchResult.failed + failedStudents.length,
            emailResults: batchResult.results,
            preparationFailures: failedStudents
          },
          sentAt: new Date().toISOString(),
          service: 'resend'
        },
        message: `Envío masivo completado: ${batchResult.successful}/${studentIds.length} emails enviados exitosamente`
      };

    } catch (error) {
      console.error('Error en envío masivo:', error.message);
      throw new Error(`Error en envío masivo de encuestas: ${error.message}`);
    }
  }

  /**
   * Reenvía una encuesta a un estudiante (con el mismo token si aún es válido)
   */
  async resend({ surveyId, studentId }) {
    try {
      this._validateInput({ surveyId, studentId, expirationDays: 30 });

      const survey = await this.surveyRepository.findById(surveyId);
      if (!survey) {
        throw new Error(`La encuesta con ID ${surveyId} no existe`);
      }

      const student = await this.studentRepository.findById(studentId);
      if (!student) {
        throw new Error(`El estudiante con ID ${studentId} no existe`);
      }

      // Buscar token existente
      const existingToken = await this.surveyTokenRepository.findValidToken({
        surveyId,
        studentId
      });

      if (!existingToken) {
        throw new Error('No se encontró un token válido. Crea una nueva invitación.');
      }

      const surveyUrl = this._generateSurveyUrl(existingToken.token);

      // Reenviar email
      const emailResult = await this.emailRepository.sendSurveyEmail({
        student,
        survey,
        token: existingToken.token,
        surveyUrl
      });

      if (!emailResult.success) {
        throw new Error(`Error al reenviar email: ${emailResult.error}`);
      }

      return {
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.nombre,
            email: student.email
          },
          survey: {
            id: survey.id,
            title: survey.titulo
          },
          token: {
            id: existingToken.id,
            value: existingToken.token,
            expiresAt: existingToken.fecha_expiracion
          },
          surveyUrl,
          email: {
            messageId: emailResult.messageId,
            recipient: emailResult.recipient,
            service: 'resend',
            resentAt: new Date().toISOString()
          }
        },
        message: `Encuesta reenviada exitosamente a ${student.nombre}`
      };

    } catch (error) {
      console.error('Error al reenviar encuesta:', error.message);
      throw new Error(`Error al reenviar encuesta: ${error.message}`);
    }
  }

  /**
   * Obtiene el estado de un email enviado
   */
  async getEmailStatus(messageId) {
    try {
      if (!messageId) {
        throw new Error('Se requiere el ID del mensaje de email');
      }

      const status = await this.emailRepository.getEmailStatus(messageId);
      
      return {
        success: true,
        data: {
          messageId,
          status: status.success ? status.data : null,
          service: 'resend',
          checkedAt: new Date().toISOString()
        },
        message: status.success ? 'Estado obtenido exitosamente' : 'No se pudo obtener el estado'
      };

    } catch (error) {
      console.error('Error obteniendo estado del email:', error.message);
      throw new Error(`Error al obtener estado del email: ${error.message}`);
    }
  }

  /**
   * Valida los parámetros de entrada
   * @private
   */
  _validateInput({ surveyId, studentId, expirationDays }) {
    if (!surveyId || typeof surveyId !== 'number') {
      throw new Error('El ID de la encuesta es requerido y debe ser un número');
    }

    if (!studentId || typeof studentId !== 'number') {
      throw new Error('El ID del estudiante es requerido y debe ser un número');
    }

    if (expirationDays && (typeof expirationDays !== 'number' || expirationDays < 1)) {
      throw new Error('Los días de expiración deben ser un número mayor a 0');
    }
  }

  /**
   * Valida formato de email
   * @private
   */
  _isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Obtiene un token existente válido o crea uno nuevo
   * @private
   */
  async _getOrCreateToken({ surveyId, studentId, expirationDays }) {
    // Buscar token existente y válido
    const existingToken = await this.surveyTokenRepository.findValidToken({
      surveyId,
      studentId
    });

    if (existingToken) {
      console.log(`Reutilizando token existente para estudiante ID: ${studentId}`);
      return {
        ...existingToken,
        isNew: false
      };
    }

    // Crear nuevo token
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);

    const newToken = await this.surveyTokenRepository.create({
      token: this._generateSecureToken(),
      id_encuesta: surveyId,
      id_estudiante: studentId,
      fecha_expiracion: expirationDate,
      usado: false
    });

    console.log(`Nuevo token creado para estudiante ID: ${studentId}`);
    
    return {
      ...newToken,
      isNew: true
    };
  }

  /**
   * Genera un token seguro de 64 caracteres
   * @private
   */
  _generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Genera la URL completa de la encuesta
   * @private
   */
  _generateSurveyUrl(token) {
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'https://cacei-production.up.railway.app';
    return `${baseUrl}/encuesta/${token}`;
  }

  /**
   * Obtiene estadísticas de envío de emails
   */
  async getEmailStats() {
    try {
      const stats = await this.emailRepository.getEmailStats();
      
      return {
        success: true,
        data: {
          service: 'resend',
          stats: stats.success ? stats : null,
          dashboardUrl: 'https://resend.com/emails',
          checkedAt: new Date().toISOString()
        },
        message: 'Estadísticas obtenidas exitosamente'
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error.message);
      throw new Error(`Error al obtener estadísticas de email: ${error.message}`);
    }
  }
}

module.exports = SendSurveyEmailUseCase;
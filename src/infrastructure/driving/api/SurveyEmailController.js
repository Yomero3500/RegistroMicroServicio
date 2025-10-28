class SurveyEmailController {
  constructor(sendSurveyEmailUseCase) {
    this.sendSurveyEmailUseCase = sendSurveyEmailUseCase;
  }

  /**
   * Envía encuesta a un estudiante individual
   * POST /api/surveys/email/send
   * Body: { surveyId, studentId, expirationDays? }
   */
  async sendToStudent(req, res) {
    try {
      const { surveyId, studentId, expirationDays } = req.body;

      // Validaciones
      if (!surveyId) {
        return res.status(400).json({
          success: false,
          error: 'El campo surveyId es requerido'
        });
      }

      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'El campo studentId es requerido'
        });
      }

      if (expirationDays && (isNaN(expirationDays) || expirationDays < 1)) {
        return res.status(400).json({
          success: false,
          error: 'Los días de expiración deben ser un número mayor a 0'
        });
      }

      const result = await this.sendSurveyEmailUseCase.execute({
        surveyId: parseInt(surveyId),
        studentId: parseInt(studentId),
        expirationDays: expirationDays ? parseInt(expirationDays) : 30
      });

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error en SurveyEmailController.sendToStudent:', error);
      
      // Manejo específico de errores comunes
      if (error.message.includes('no existe')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      if (error.message.includes('email válido') || error.message.includes('email inválido')) {
        return res.status(422).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Envía encuesta a múltiples estudiantes en lotes
   * POST /api/surveys/email/send-batch
   * Body: { surveyId, studentIds: [1,2,3], expirationDays? }
   */
  async sendBatch(req, res) {
    try {
      const { surveyId, studentIds, expirationDays } = req.body;

      // Validaciones
      if (!surveyId) {
        return res.status(400).json({
          success: false,
          error: 'El campo surveyId es requerido'
        });
      }

      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El campo studentIds debe ser un array con al menos un ID'
        });
      }

      if (studentIds.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'No se pueden enviar más de 100 emails por lote'
        });
      }

      // Validar que todos los IDs sean números
      const invalidIds = studentIds.filter(id => isNaN(parseInt(id)));
      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          error: `IDs de estudiantes inválidos: ${invalidIds.join(', ')}`
        });
      }

      const result = await this.sendSurveyEmailUseCase.executeBatch({
        surveyId: parseInt(surveyId),
        studentIds: studentIds.map(id => parseInt(id)),
        expirationDays: expirationDays ? parseInt(expirationDays) : 30
      });

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error en SurveyEmailController.sendBatch:', error);
      
      if (error.message.includes('no existe')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Reenvía una encuesta usando el token existente
   * POST /api/surveys/email/resend
   * Body: { surveyId, studentId }
   */
  async resend(req, res) {
    try {
      const { surveyId, studentId } = req.body;

      if (!surveyId) {
        return res.status(400).json({
          success: false,
          error: 'El campo surveyId es requerido'
        });
      }

      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: 'El campo studentId es requerido'
        });
      }

      const result = await this.sendSurveyEmailUseCase.resend({
        surveyId: parseInt(surveyId),
        studentId: parseInt(studentId)
      });

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error en SurveyEmailController.resend:', error);
      
      if (error.message.includes('no existe') || error.message.includes('no se encontró')) {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }

      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene el estado de un email específico
   * GET /api/surveys/email/status/:messageId
   */
  async getEmailStatus(req, res) {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({
          success: false,
          error: 'El messageId es requerido'
        });
      }

      const result = await this.sendSurveyEmailUseCase.getEmailStatus(messageId);

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error en SurveyEmailController.getEmailStatus:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas generales de emails
   * GET /api/surveys/email/stats
   */
  async getEmailStats(req, res) {
    try {
      const result = await this.sendSurveyEmailUseCase.getEmailStats();

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error en SurveyEmailController.getEmailStats:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Obtiene estadísticas de tokens de una encuesta específica
   * GET /api/surveys/:surveyId/email-stats
   */
  async getSurveyStats(req, res) {
    try {
      const { surveyId } = req.params;

      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          error: 'El surveyId es requerido y debe ser un número válido'
        });
      }

      // Nota: Este método requiere que tengas un método getStats en el surveyTokenRepository
      // Si no lo tienes, puedes comentar esta funcionalidad o implementarla
      const stats = await this.sendSurveyEmailUseCase.surveyTokenRepository.getStats
        ? await this.sendSurveyEmailUseCase.surveyTokenRepository.getStats(parseInt(surveyId))
        : { message: 'Estadísticas de tokens no implementadas' };

      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error en SurveyEmailController.getSurveyStats:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Verifica la configuración del servicio de email
   * GET /api/surveys/email/verify
   */
  async verifyEmailService(req, res) {
    try {
      const isConnected = await this.sendSurveyEmailUseCase.emailRepository.verifyConnection();

      return res.status(200).json({
        success: true,
        data: {
          emailServiceReady: isConnected,
          service: 'resend',
          checkedAt: new Date().toISOString()
        },
        message: isConnected 
          ? 'Servicio de email funcionando correctamente' 
          : 'Servicio de email no disponible'
      });

    } catch (error) {
      console.error('Error en SurveyEmailController.verifyEmailService:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message,
        data: {
          emailServiceReady: false,
          service: 'resend',
          checkedAt: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Obtiene el historial de envíos de una encuesta
   * GET /api/surveys/:surveyId/email-history?page=1&limit=10
   */
  async getEmailHistory(req, res) {
    try {
      const { surveyId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!surveyId || isNaN(surveyId)) {
        return res.status(400).json({
          success: false,
          error: 'El surveyId es requerido y debe ser un número válido'
        });
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Parámetros de paginación inválidos (page >= 1, limit entre 1 y 100)'
        });
      }

      // Nota: Este método requiere implementación en el repository
      // Si no tienes este método, puedes comentar o implementar
      const history = await this.sendSurveyEmailUseCase.surveyTokenRepository.getEmailHistory
        ? await this.sendSurveyEmailUseCase.surveyTokenRepository.getEmailHistory({
            surveyId: parseInt(surveyId),
            page: pageNum,
            limit: limitNum
          })
        : { message: 'Historial de emails no implementado' };

      return res.status(200).json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('Error en SurveyEmailController.getEmailHistory:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Endpoint para testing interno
   * POST /api/surveys/email/test
   * Body: { email: "test@example.com" }
   */
  async testEmail(req, res) {
    try {
      // Solo permitir en desarrollo
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          error: 'Endpoint de testing no disponible en producción'
        });
      }

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'El campo email es requerido'
        });
      }

      // Crear datos de prueba
      const testStudent = {
        id: 999,
        nombre: 'Usuario de Prueba',
        matricula: 'TEST999',
        email: email
      };

      const testSurvey = {
        id: 999,
        titulo: 'Encuesta de Prueba - API',
        descripcion: 'Esta es una encuesta de prueba enviada desde el API'
      };

      const testResult = await this.sendSurveyEmailUseCase.emailRepository.sendSurveyEmail({
        student: testStudent,
        survey: testSurvey,
        token: `test-${Date.now()}`,
        surveyUrl: `${process.env.BASE_URL || 'http://localhost:5173'}/encuesta/test-${Date.now()}`
      });

      return res.status(200).json({
        success: true,
        data: {
          testResult,
          message: 'Email de prueba enviado exitosamente'
        }
      });

    } catch (error) {
      console.error('Error en SurveyEmailController.testEmail:', error);
      
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Middleware para validar rate limiting (opcional)
   * Puedes usar esto en las rutas para limitar el número de requests
   */
  rateLimitMiddleware() {
    // Implementación básica de rate limiting
    const requests = new Map();
    
    return (req, res, next) => {
      const clientId = req.ip || 'unknown';
      const now = Date.now();
      const windowMs = 60 * 1000; // 1 minuto
      const maxRequests = 10; // máximo 10 requests por minuto

      if (!requests.has(clientId)) {
        requests.set(clientId, []);
      }

      const clientRequests = requests.get(clientId);
      
      // Filtrar requests dentro de la ventana de tiempo
      const validRequests = clientRequests.filter(time => now - time < windowMs);
      
      if (validRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Demasiadas solicitudes. Intenta nuevamente en un minuto.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      validRequests.push(now);
      requests.set(clientId, validRequests);
      
      next();
    };
  }
}

module.exports = SurveyEmailController;
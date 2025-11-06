class PublicSurveyController {
  constructor(getSurveyByTokenUseCase, submitSurveyResponseUseCase) {
    this.getSurveyByTokenUseCase = getSurveyByTokenUseCase;
    this.submitSurveyResponseUseCase = submitSurveyResponseUseCase;
  }

  /**
   * GET /api/public/survey/:token
   */
  async getSurveyByToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'El token es requerido'
        });
      }

      const result = await this.getSurveyByTokenUseCase.execute({ token });

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error en PublicSurveyController.getSurveyByToken:', error);
      
      let statusCode = 500;
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('utilizado') || error.message.includes('expirado')) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * POST /api/public/survey/submit
   */
  async submitSurveyResponse(req, res) {
    try {
      const { token, respuestas } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'El token es requerido'
        });
      }

      if (!respuestas) {
        return res.status(400).json({
          success: false,
          error: 'Las respuestas son requeridas'
        });
      }

      const result = await this.submitSurveyResponseUseCase.execute({
        token,
        respuestas,
        ipAddress
      });

      return res.status(200).json(result);

    } catch (error) {
      console.error('Error en PublicSurveyController.submitSurveyResponse:', error);
      
      let statusCode = 500;
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('utilizado') || error.message.includes('expirado') || error.message.includes('inválido')) {
        statusCode = 400;
      }

      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = PublicSurveyController;
class GetSurveyByTokenUseCase {
  constructor(surveyTokenRepository, surveyRepository) {
    this.surveyTokenRepository = surveyTokenRepository;
    this.surveyRepository = surveyRepository;
  }

  async execute({ token }) {
    try {
      this._validateInput({ token });

      console.log(`🔍 Verificando token: ${token.substring(0, 10)}...`);

      const tokenData = await this.surveyTokenRepository.findByToken(token);

      if (!tokenData) {
        throw new Error('Token no encontrado o inválido');
      }

      if (tokenData.usado) {
        throw new Error('Este enlace ya fue utilizado. No puedes responder la encuesta dos veces.');
      }

      if (new Date() > new Date(tokenData.fecha_expiracion)) {
        throw new Error('Este enlace ha expirado. Contacta al administrador.');
      }

      const survey = await this.surveyRepository.findById(tokenData.id_encuesta);

      if (!survey) {
        throw new Error('Encuesta no encontrada');
      }

      const questions = await this.surveyRepository.getSurveyQuestions(tokenData.id_encuesta);

      console.log(`✅ Encuesta "${survey.titulo}" cargada exitosamente`);

      return {
        success: true,
        data: {
          token,
          survey: {
            id: survey.id_encuesta,
            titulo: survey.titulo,
            descripcion: survey.descripcion,
            tipo: survey.tipo
          },
          questions
        },
        message: 'Encuesta cargada exitosamente'
      };

    } catch (error) {
      throw new Error(`Error al obtener encuesta: ${error.message}`);
    }
  }

  _validateInput({ token }) {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('El token es requerido y debe ser una cadena válida');
    }

    // Validar que el token tenga la longitud esperada (64 caracteres para hex de 32 bytes)
    if (token.length !== 64) {
      throw new Error('El token tiene un formato inválido');
    }
  }
}

module.exports = GetSurveyByTokenUseCase;
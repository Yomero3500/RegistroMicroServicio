// src/application/usecases/SubmitSurveyResponseUseCase.js

class SubmitSurveyResponseUseCase {
  constructor(surveyTokenRepository, participationRepository, responseRepository) {
    this.surveyTokenRepository = surveyTokenRepository;
    this.participationRepository = participationRepository;
    this.responseRepository = responseRepository;
  }

  async execute({ token, respuestas, ipAddress = null }) {
    try {
      console.log(`📝 Procesando respuestas para token: ${token.substring(0, 10)}...`);

      // ===================================
      // 1. VALIDAR ENTRADA
      // ===================================
      this._validateInput({ token, respuestas });

      // ===================================
      // 2. VALIDAR TOKEN
      // ===================================
      const tokenData = await this._validateToken(token);
      console.log(`✅ Token válido para encuesta ${tokenData.id_encuesta}, estudiante ${tokenData.id_estudiante}`);

      // ===================================
      // 3. CREAR PARTICIPACIÓN PRIMERO
      // ===================================
      const participacion = await this._createParticipation({
        studentId: tokenData.id_estudiante,
        surveyId: tokenData.id_encuesta
      });
      console.log(`✅ Participación creada con ID: ${participacion.id_participacion}`);

      // ===================================
      // 4. GUARDAR RESPUESTAS
      // ===================================
      const savedResponses = await this._saveResponses({
        participationId: participacion.id_participacion,
        respuestas
      });
      console.log(`✅ ${savedResponses.length} respuestas guardadas exitosamente`);

      // ===================================
      // 5. MARCAR TOKEN COMO USADO (SOLO AL FINAL)
      // ===================================
      await this.surveyTokenRepository.markAsUsed(token, ipAddress);
      console.log(`✅ Token marcado como usado desde IP: ${ipAddress || 'desconocida'}`);

      // ===================================
      // 6. RETORNAR RESULTADO
      // ===================================
      return {
        success: true,
        data: {
          participacion: {
            id: participacion.id_participacion,
            fecha: participacion.fecha_respuesta
          },
          totalRespuestas: savedResponses.length,
          ipAddress
        },
        message: '¡Encuesta completada exitosamente! Gracias por tu participación.'
      };

    } catch (error) {
      console.error('❌ Error en SubmitSurveyResponseUseCase:', error.message);
      throw new Error(`Error al guardar respuestas: ${error.message}`);
    }
  }

  _validateInput({ token, respuestas }) {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('El token es requerido y debe ser una cadena válida');
    }

    if (!respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
      throw new Error('Las respuestas son requeridas y deben ser un array no vacío');
    }

    respuestas.forEach((respuesta, index) => {
      if (!respuesta.id_pregunta || !respuesta.respuesta_texto) {
        throw new Error(
          `Respuesta ${index + 1} tiene formato inválido. Debe incluir id_pregunta y respuesta_texto`
        );
      }
      
      // Validar que respuesta_texto no esté vacío
      if (String(respuesta.respuesta_texto).trim() === '') {
        throw new Error(`La respuesta ${index + 1} no puede estar vacía`);
      }
    });
  }

  async _validateToken(token) {
    const tokenData = await this.surveyTokenRepository.findByToken(token);

    if (!tokenData) {
      throw new Error('Token no encontrado');
    }

    if (tokenData.usado) {
      throw new Error('Este enlace ya fue utilizado');
    }

    if (new Date() > new Date(tokenData.fecha_expiracion)) {
      throw new Error('Este enlace ha expirado');
    }

    return tokenData;
  }

  async _createParticipation({ studentId, surveyId }) {
    try {
      const participacion = await this.participationRepository.create({
        id_estudiante: studentId,
        id_encuesta: surveyId,
        estatus: 'completada',
        fecha_respuesta: new Date()
      });

      return participacion;
    } catch (error) {
      console.error('❌ Error al crear participación:', error);
      throw new Error(`No se pudo crear la participación: ${error.message}`);
    }
  }

  async _saveResponses({ participationId, respuestas }) {
    const savedResponses = [];

    try {
      for (const respuesta of respuestas) {
        // ✅ Usar el método save() de AnswerRepository con parámetros separados
        const saved = await this.responseRepository.save(
          respuesta.id_pregunta,
          participationId,
          String(respuesta.respuesta_texto).trim()
        );
        
        savedResponses.push(saved);
        console.log(`  ✓ Respuesta guardada para pregunta ${respuesta.id_pregunta}`);
      }

      return savedResponses;
    } catch (error) {
      console.error('❌ Error al guardar respuestas:', error);
      
      // Rollback: Eliminar participación si falla al guardar respuestas
      try {
        await this.participationRepository.delete(participationId);
        console.log(`🔄 Rollback: Participación ${participationId} eliminada`);
      } catch (rollbackError) {
        console.error('❌ Error en rollback:', rollbackError);
      }
      
      throw new Error(`No se pudieron guardar las respuestas: ${error.message}`);
    }
  }
}

module.exports = SubmitSurveyResponseUseCase;
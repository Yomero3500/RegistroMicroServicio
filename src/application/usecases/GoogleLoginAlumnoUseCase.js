const { OAuth2Client } = require('google-auth-library');

class GoogleLoginAlumnoUseCase {
  constructor(estudianteRepository, options = {}) {
    this.estudianteRepository = estudianteRepository;
    this.clientId = options.clientId || process.env.GOOGLE_CLIENT_ID || '';
    if (!this.clientId) {
      // Defer throw until execute() so app can boot without env in some environments
      console.warn('GOOGLE_CLIENT_ID no está configurado; Google login no funcionará');
    }
    this.client = new OAuth2Client(this.clientId);
  }

  async execute(idToken) {
    if (!idToken) {
      return { success: false, status: 400, message: 'idToken es requerido' };
    }
    if (!this.clientId) {
      return { success: false, status: 500, message: 'GOOGLE_CLIENT_ID no está configurado' };
    }

    try {
      const ticket = await this.client.verifyIdToken({ idToken, audience: this.clientId });
      const payload = ticket.getPayload();
      const email = payload?.email;
      const name = payload?.name || payload?.given_name || 'Usuario Google';

      if (!email) {
        return { success: false, status: 401, message: 'Token inválido: sin email' };
      }

      const estudiante = await this.estudianteRepository.getEstudianteByEmail(email);
      if (!estudiante) {
        return { success: false, status: 404, message: 'No se encontró alumno con ese email' };
      }

      return {
        success: true,
        status: 200,
        data: {
          matricula: estudiante.matricula,
          nombre: estudiante.nombre,
          email: estudiante.email,
          estatus: estudiante.estatus,
          tutor_academico_id: estudiante.tutor_academico_id,
          cohorte_id: estudiante.cohorte_id
        },
        message: 'Login con Google exitoso'
      };
    } catch (error) {
      console.error('❌ GoogleLoginAlumnoUseCase: error verificando token:', error);
      return { success: false, status: 401, message: 'Token inválido o expirado' };
    }
  }
}

module.exports = GoogleLoginAlumnoUseCase;

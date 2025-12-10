const jwt = require('jsonwebtoken');

class LoginAlumnoUseCase {
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.jwtExpires = process.env.JWT_EXPIRES || '7d';
  }

  async execute(email, password) {
    if (!email || !password) {
      return {
        success: false,
        status: 400,
        message: 'Email y password son obligatorios'
      };
    }
    
    // 1) Buscar alumno por email
    const estudiante = await this.estudianteRepository.getEstudianteByEmail(email);
    if (!estudiante) {
      return {
        success: false,
        status: 401,
        message: 'Credenciales inválidas'
      };
    }

    // 2) Estructura de datos para el JWT
    const tokenPayload = {
      id: estudiante.matricula,
      email: estudiante.email,
      name: estudiante.nombre,
      role: 'student'
    };

    // 3) Generar JWT con los datos encriptados
    try {
      const token = jwt.sign(
        tokenPayload,
        this.jwtSecret,
        { expiresIn: this.jwtExpires }
      );

      return {
        success: true,
        status: 200,
        message: 'Login exitoso',
        data: {
          token,
          expiresIn: this.jwtExpires
        }
      };
    } catch (error) {
      console.error('❌ LoginAlumnoUseCase: Error al generar JWT:', error);
      return {
        success: false,
        status: 500,
        message: 'Error al generar token de autenticación'
      };
    }
  }
}

module.exports = LoginAlumnoUseCase;

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

    // 2) Datos del estudiante para el JWT
    const estudianteData = {
      matricula: estudiante.matricula,
      nombre: estudiante.nombre,
      email: estudiante.email,
      estatus: estudiante.estatus,
      tutor_academico_id: estudiante.tutor_academico_id,
      cohorte_id: estudiante.cohorte_id
    };

    // 3) Generar JWT con los datos encriptados
    try {
      const token = jwt.sign(
        estudianteData,
        this.jwtSecret,
        { expiresIn: this.jwtExpires }
      );

      return {
        success: true,
        status: 200,
        message: 'Login exitoso',
        data: {
          token,
          estudiante: estudianteData,
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

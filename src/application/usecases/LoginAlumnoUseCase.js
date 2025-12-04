const jwt = require('jsonwebtoken');

class LoginAlumnoUseCase {
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
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

    // 2) Aceptar cualquier contraseña; solo validamos que el email exista
    
    // 3) Generar token JWT
    const token = jwt.sign(
      {
        id: estudiante.matricula,
        email: estudiante.email,
        role: 'student'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return {
      success: true,
      status: 200,
      message: 'Login exitoso',
      token: token,
      user: {
        id: estudiante.matricula,
        email: estudiante.email,
        name: estudiante.nombre,
        role: 'student',
        estatus: estudiante.estatus,
        tutor_academico_id: estudiante.tutor_academico_id,
        cohorte_id: estudiante.cohorte_id
      }
    };
  }
}

module.exports = LoginAlumnoUseCase;

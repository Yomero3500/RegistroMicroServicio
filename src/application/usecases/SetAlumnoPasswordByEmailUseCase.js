const bcrypt = require('bcryptjs');

class SetAlumnoPasswordByEmailUseCase {
  constructor(estudianteRepository) {
    this.estudianteRepository = estudianteRepository;
  }

  async execute(email, password) {
    if (!email || !password) {
      return { success: false, status: 400, message: 'Email y password son obligatorios' };
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hash = await bcrypt.hash(password, saltRounds);

    const ok = await this.estudianteRepository.updatePasswordByEmail(email, hash);
    if (!ok) {
      return { success: false, status: 404, message: 'No se encontró alumno con ese email' };
    }

    return { success: true, status: 200, message: 'Contraseña actualizada' };
  }
}

module.exports = SetAlumnoPasswordByEmailUseCase;

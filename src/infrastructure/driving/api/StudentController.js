class StudentController {
  constructor(importStudentsUseCase, getAllStudentsUseCase, createStudentUseCase, updateStudentUseCase, deleteStudentUseCase, getStudentHistoryUseCase, getStudentsBasicInfoUseCase, getEstudiantesBasicInfoUseCase, getEstudianteByMatriculaUseCase, loginAlumnoUseCase = null, setAlumnoPasswordByEmailUseCase = null, googleLoginAlumnoUseCase = null) {
    this.importStudentsUseCase = importStudentsUseCase;
    this.getAllStudentsUseCase = getAllStudentsUseCase;
    this.createStudentUseCase = createStudentUseCase;
    this.updateStudentUseCase = updateStudentUseCase;
    this.deleteStudentUseCase = deleteStudentUseCase;
    this.getStudentHistoryUseCase = getStudentHistoryUseCase;
    this.getStudentsBasicInfoUseCase = getStudentsBasicInfoUseCase;
    this.getEstudiantesBasicInfoUseCase = getEstudiantesBasicInfoUseCase;
    this.getEstudianteByMatriculaUseCase = getEstudianteByMatriculaUseCase;
    this.loginAlumnoUseCase = loginAlumnoUseCase;
    this.setAlumnoPasswordByEmailUseCase = setAlumnoPasswordByEmailUseCase;
    this.googleLoginAlumnoUseCase = googleLoginAlumnoUseCase;
  }

  async importStudents(req, res, next) {
    try {
      console.log('🚀 StudentController: Iniciando importación de estudiantes...');
      
      if (!req.file) {
        console.log('❌ StudentController: No se recibió ningún archivo');
        return res.status(400).json({ 
          success: false,
          message: 'No se ha proporcionado ningún archivo' 
        });
      }

      console.log('📁 StudentController: Información del archivo recibido:');
      console.log('  - Nombre original:', req.file.originalname);
      console.log('  - Nombre en servidor:', req.file.filename);
      console.log('  - Ruta completa:', req.file.path);
      console.log('  - Tamaño:', req.file.size, 'bytes');
      console.log('  - Tipo MIME:', req.file.mimetype);
      console.log('  - Codificación:', req.file.encoding);

      console.log('⚙️ StudentController: Ejecutando caso de uso...');
      const result = await this.importStudentsUseCase.execute(req.file.path);
      
      console.log('✅ StudentController: Importación completada');
      console.log('📊 StudentController: Resultado:', {
        totalRows: result.totalRows,
        successfullyProcessed: result.successfullyProcessed,
        errors: result.errors
      });
      
      res.json(result);
    } catch (error) {
      console.error('💥 StudentController: Error durante la importación:', error.message);
      next(error);
    }
  }

  async getAllStudents(req, res, next) {
    try {
      console.log('🔍 StudentController: Obteniendo todos los estudiantes...');
      
      const result = await this.getAllStudentsUseCase.execute();
      
      console.log('📊 StudentController: Resultado del caso de uso:', {
        success: result.success,
        totalEstudiantes: result.data ? result.data.length : 0
      });
      
      if (!result.success) {
        console.log('ℹ️ StudentController: No se encontraron estudiantes');
        return res.status(404).json({
          success: false,
          message: result.message,
          data: result.data
        });
      }

      console.log('✅ StudentController: Estudiantes obtenidos exitosamente');
      res.json({
        success: true,
        data: result.data,
        total: result.total
      });
    } catch (error) {
      console.error('💥 StudentController: Error al obtener estudiantes:', error.message);
      next(error);
    }
  }

  async createStudent(req, res, next) {
    try {
      const result = await this.createStudentUseCase.execute(req.body);
      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.updateStudentUseCase.execute(id, req.body);
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  }

  async deleteStudent(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.deleteStudentUseCase.execute(id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getStudentByMatricula(req, res, next) {
    try {
      const { matricula } = req.params;
      
      if (!matricula) {
        return res.status(400).json({
          success: false,
          message: 'La matrícula es obligatoria'
        });
      }

      console.log(`🔍 StudentController: Buscando historial completo para matrícula: ${matricula}`);
      
      const result = await this.getStudentHistoryUseCase.execute(matricula);
      
      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
          data: result.data
        });
      }

      console.log(`✅ StudentController: Historial encontrado para matrícula ${matricula}:`, {
        totalRegistros: result.data.estudiante.totalRegistros,
        totalMaterias: result.data.estadisticas.totalMaterias
      });

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('💥 StudentController: Error al buscar historial:', error.message);
      next(error);
    }
  }

  async getStudentById(req, res, next) {
    try {
      // Esta funcionalidad requeriría un nuevo caso de uso, pero por ahora podemos usar el repositorio directamente
      res.status(501).json({ message: 'Endpoint no implementado aún' });
    } catch (error) {
      next(error);
    }
  }

  async getStudentsBasicInfo(req, res, next) {
    try {
      console.log('🔍 StudentController: Obteniendo información básica de estudiantes...');
      
      const students = await this.getStudentsBasicInfoUseCase.execute();
      
      console.log(`✅ StudentController: ${students.length} estudiantes obtenidos`);
      
      res.status(200).json({
        success: true,
        message: 'Información básica de estudiantes obtenida exitosamente',
        data: students,
        total: students.length
      });
    } catch (error) {
      console.error('❌ StudentController: Error al obtener información básica de estudiantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener la información básica de estudiantes'
      });
    }
  }

  async getEstudiantesBasicInfo(req, res, next) {
    try {
      console.log('🔍 StudentController: Obteniendo información básica de estudiantes desde modelo Estudiante...');
      
      const estudiantes = await this.getEstudiantesBasicInfoUseCase.execute();
      
      console.log(`✅ StudentController: ${estudiantes.length} estudiantes obtenidos`);
      
      res.status(200).json({
        success: true,
        message: 'Información básica de estudiantes obtenida exitosamente desde modelo Estudiante',
        data: estudiantes,
        total: estudiantes.length
      });
    } catch (error) {
      console.error('❌ StudentController: Error al obtener información básica de estudiantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener la información básica de estudiantes'
      });
    }
  }

  async getEstudianteByMatricula(req, res, next) {
    try {
      const { matricula } = req.params;
      console.log(`🔍 StudentController: Buscando estudiante con matrícula: ${matricula}`);
      
      const estudiante = await this.getEstudianteByMatriculaUseCase.execute(matricula);
      
      console.log(`✅ StudentController: Estudiante encontrado: ${estudiante.nombre}`);
      
      res.status(200).json({
        success: true,
        message: `Estudiante con matrícula ${matricula} encontrado exitosamente`,
        data: estudiante
      });
    } catch (error) {
      console.error('❌ StudentController: Error al buscar estudiante por matrícula:', error);
      
      if (error.message.includes('No se encontró') || error.message.includes('matrícula debe tener')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error interno del servidor al buscar el estudiante'
        });
      }
    }
  }

  async loginAlumno(req, res, next) {
    try {
      if (!this.loginAlumnoUseCase) {
        return res.status(501).json({ success: false, message: 'Login de alumno no está configurado' });
      }

      const { email, password } = req.body || {};
      const result = await this.loginAlumnoUseCase.execute(email, password);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('❌ StudentController: Error en loginAlumno:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor en login de alumno' });
    }
  }

  async setAlumnoPasswordByEmail(req, res, next) {
    try {
      if (!this.setAlumnoPasswordByEmailUseCase) {
        return res.status(501).json({ success: false, message: 'Endpoint no configurado' });
      }
      const { email, password } = req.body || {};
      const result = await this.setAlumnoPasswordByEmailUseCase.execute(email, password);
      return res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
      console.error('❌ StudentController: Error al establecer contraseña por email:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  async googleLogin(req, res, next) {
    try {
      if (!this.googleLoginAlumnoUseCase) {
        return res.status(501).json({ success: false, message: 'Login con Google no está configurado' });
      }

      const { idToken } = req.body || {};
      const result = await this.googleLoginAlumnoUseCase.execute(idToken);

      return res.status(result.status).json({
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('❌ StudentController: Error en googleLogin:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor en login con Google' });
    }
  }
}

module.exports = StudentController;
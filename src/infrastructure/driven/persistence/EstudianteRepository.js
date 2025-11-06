const EstudianteModel = require('./models/registration/EstudianteModel');
const { sequelize } = require('../../config/database');

class EstudianteRepository {
    constructor() {
        this.Estudiante = null;
        this.initialized = false;
    }

    async initialize() {
        if (!this.initialized) {
            console.log('🔄 EstudianteRepository: Inicializando modelo Estudiante...');
            
            // Inicializar el modelo directamente
            this.Estudiante = EstudianteModel.init(sequelize);
            
            if (!this.Estudiante) {
                throw new Error('Error al inicializar el modelo Estudiante.');
            }
            
            console.log('✅ EstudianteRepository: Modelo Estudiante inicializado correctamente');
            this.initialized = true;
        }
    }

    async getEstudiantesBasicInfo() {
        try {
            await this.initialize();
            
            console.log('🔍 EstudianteRepository: Obteniendo información básica de estudiantes...');
            
            const estudiantes = await this.Estudiante.findAll({
                attributes: ['matricula', 'nombre', 'tutor_academico_id'],
                order: [['matricula', 'ASC']]
            });

            console.log(`✅ EstudianteRepository: ${estudiantes.length} estudiantes encontrados`);
            return estudiantes;
        } catch (error) {
            console.error('❌ EstudianteRepository: Error al obtener información básica de estudiantes:', error);
            throw new Error(`Error al obtener información básica de estudiantes: ${error.message}`);
        }
    }

    async getEstudianteByMatricula(matricula) {
        try {
            await this.initialize();
            
            console.log(`🔍 EstudianteRepository: Buscando estudiante con matrícula: ${matricula}`);
            
            const estudiante = await this.Estudiante.findOne({
                where: {
                    matricula: matricula
                }
            });

            if (estudiante) {
                console.log(`✅ EstudianteRepository: Estudiante encontrado: ${estudiante.nombre}`);
            } else {
                console.log(`❌ EstudianteRepository: No se encontró estudiante con matrícula: ${matricula}`);
            }
            
            return estudiante;
        } catch (error) {
            console.error('❌ EstudianteRepository: Error al buscar estudiante por matrícula:', error);
            throw new Error(`Error al buscar estudiante por matrícula: ${error.message}`);
        }
    }

    async getEstudianteByEmail(email) {
        try {
            await this.initialize();

            console.log(`🔍 EstudianteRepository: Buscando estudiante con email: ${email}`);

            const estudiante = await this.Estudiante.findOne({
                where: { email },
                attributes: ['matricula', 'nombre', 'email', 'estatus', 'tutor_academico_id', 'cohorte_id', 'password_hash', 'created_at', 'updated_at']
            });

            if (estudiante) {
                console.log(`✅ EstudianteRepository: Estudiante encontrado: ${estudiante.nombre}`);
            } else {
                console.log(`❌ EstudianteRepository: No se encontró estudiante con email: ${email}`);
            }

            return estudiante;
        } catch (error) {
            console.error('❌ EstudianteRepository: Error al buscar estudiante por email:', error);
            throw new Error(`Error al buscar estudiante por email: ${error.message}`);
        }
    }

    async updatePasswordByEmail(email, passwordHash) {
        try {
            await this.initialize();

            const [updated] = await this.Estudiante.update(
                { password_hash: passwordHash },
                { where: { email } }
            );
            return updated > 0;
        } catch (error) {
            console.error('❌ EstudianteRepository: Error al actualizar password por email:', error);
            throw new Error(`Error al actualizar password: ${error.message}`);
        }
    }

    async updatePasswordByMatricula(matricula, passwordHash) {
        try {
            await this.initialize();

            const [updated] = await this.Estudiante.update(
                { password_hash: passwordHash },
                { where: { matricula } }
            );
            return updated > 0;
        } catch (error) {
            console.error('❌ EstudianteRepository: Error al actualizar password por matrícula:', error);
            throw new Error(`Error al actualizar password: ${error.message}`);
        }
    }
}

module.exports = EstudianteRepository;

const { sequelize } = require('../../../config/database');
const AsignaturaModel = require('./registration/AsignaturaModel');
const StudentModel = require('./StudentModel');

class ModelInitializer {
    static init() {
        // Inicializar todos los modelos
        const Asignatura = AsignaturaModel.init(sequelize);
        const Student = StudentModel.init(sequelize);

        // Crear objeto con todos los modelos
        const models = {
            Asignatura,
            Student
        };

        // Ejecutar asociaciones si existen
        Object.keys(models).forEach(modelName => {
            const model = models[modelName];
            if (model.associate) {
                model.associate(models);
            }
        });

        return models;
    }

    static async syncDatabase() {
        try {
            console.log('🔄 Sincronizando modelos con la base de datos...');
            await sequelize.sync({ alter: false }); // No alterar tablas existentes
            console.log('✅ Modelos sincronizados correctamente');
        } catch (error) {
            console.error('❌ Error al sincronizar modelos:', error);
            throw error;
        }
    }
}

module.exports = ModelInitializer;

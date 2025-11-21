const { DataTypes } = require('sequelize');

class EncuestaModel {
  static model = null;

  static init(sequelize) {
    this.model = sequelize.define('Encuesta', {
      id_encuesta: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      titulo: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      id_usuario: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      descripcion: { 
        type: DataTypes.TEXT 
      },
      tipo: { 
        type: DataTypes.STRING, 
        allowNull: true,
        defaultValue: 'general'
      },
      fecha_creacion: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
      },
      fecha_inicio: { 
        type: DataTypes.DATE 
      },
      fecha_fin: { 
        type: DataTypes.DATE 
      }
    }, {
      tableName: 'encuestas',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    });

    return this.model;
  }

  static associate(models) {
    // ✅ Cascada con Preguntas
    if (models.Pregunta) {
      this.model.hasMany(models.Pregunta, {
        foreignKey: 'id_encuesta',
        as: 'preguntas',
        onDelete: 'CASCADE',  // 🔥 Elimina preguntas al borrar encuesta
        hooks: true
      });
    }

    // ✅ Cascada con Participaciones
    if (models.Participacion) {
      this.model.hasMany(models.Participacion, {
        foreignKey: 'id_encuesta',
        as: 'participaciones',
        onDelete: 'CASCADE',  // 🔥 Elimina participaciones al borrar encuesta
        hooks: true
      });
    }

    // ✅ Cascada con Tokens de Encuesta (NUEVO)
    if (models.TokenEncuesta) {
      this.model.hasMany(models.TokenEncuesta, {
        foreignKey: 'id_encuesta',
        as: 'tokens',
        onDelete: 'CASCADE',  // 🔥 Elimina tokens al borrar encuesta
        hooks: true
      });
    }
  }
}

module.exports = EncuestaModel;
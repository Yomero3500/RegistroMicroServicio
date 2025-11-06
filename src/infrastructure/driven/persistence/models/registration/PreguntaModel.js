const { DataTypes } = require('sequelize');

class PreguntaModel {
  static model = null;

  static init(sequelize) {
    this.model = sequelize.define('Pregunta', {
      id_pregunta: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
      },
      id_encuesta: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
      },
      title: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      type: { 
        type: DataTypes.ENUM('text', 'multiple', 'checkbox', 'select'), 
        defaultValue: 'text' 
      },
      options: { 
        type: DataTypes.TEXT, 
        allowNull: true 
      },
      required: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
      }
    }, {
      tableName: 'preguntas',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    });

    return this.model;
  }

  static associate(models) {
    if (models.Encuesta) {
      this.model.belongsTo(models.Encuesta, {
        foreignKey: 'id_encuesta',
        as: 'encuesta'
      });
    }

    // ✅ Cascada con Respuestas
    if (models.Respuesta) {
      this.model.hasMany(models.Respuesta, {
        foreignKey: 'id_pregunta',
        as: 'respuestas',
        onDelete: 'CASCADE',  // 🔥 Elimina respuestas al borrar pregunta
        hooks: true
      });
    }
  }
}

module.exports = PreguntaModel;
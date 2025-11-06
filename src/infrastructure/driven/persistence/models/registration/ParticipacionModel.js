const { DataTypes } = require('sequelize');

class ParticipacionModel {
  static model = null;

  static init(sequelize) {
    this.model = sequelize.define('Participacion', {
      id_participacion: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_estudiante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID del estudiante participante',
      },
      id_encuesta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID de la encuesta',
      },
      fecha_respuesta: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha de respuesta de la participación',
      },
      estatus: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Estatus de la participación',
      },
    }, {
      tableName: 'participaciones',
      timestamps: false,
    });

    return this.model;
  }

  static associate(models) {
    if (models.Encuesta) {
      this.model.belongsTo(models.Encuesta, {
        foreignKey: 'id_encuesta',
        as: 'encuesta',
      });
    }

    // ✅ Cascada con Respuestas
    if (models.Respuesta) {
      this.model.hasMany(models.Respuesta, {
        foreignKey: 'id_participacion',
        as: 'respuestas',
        onDelete: 'CASCADE',  // 🔥 Elimina respuestas al borrar participación
        hooks: true
      });
    }

    if (models.Estudiante) {
      this.model.belongsTo(models.Estudiante, {
        foreignKey: 'id_estudiante',
        as: 'estudiante',
      });
    }
  }
}

module.exports = ParticipacionModel;
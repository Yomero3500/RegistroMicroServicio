const { DataTypes } = require('sequelize');

class RespuestaModel {
  static model = null;

  static init(sequelize) {
    this.model = sequelize.define('Respuesta', {
      id_respuesta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      id_pregunta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID de la pregunta a la que pertenece la respuesta',
      },
      id_participacion: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID de la participación del usuario',
      },
      respuesta_texto: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Texto de la respuesta',
      },
    }, {
      tableName: 'respuestas',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });

    return this.model;
  }

  static associate(models) {
    if (models.Pregunta) {
      this.model.belongsTo(models.Pregunta, {
        foreignKey: 'id_pregunta',
        as: 'pregunta',
      });
    }

    // ✅ AGREGA ESTA ASOCIACIÓN
    if (models.Participacion) {
      this.model.belongsTo(models.Participacion, {
        foreignKey: 'id_participacion',
        as: 'participacion',
      });
    }
  }
}

module.exports = RespuestaModel;
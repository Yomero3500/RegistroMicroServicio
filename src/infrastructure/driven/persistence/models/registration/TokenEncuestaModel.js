const { DataTypes } = require('sequelize');

class TokenEncuestaModel {
  static model = null; 

  static init(sequelize) {
    this.model = sequelize.define('TokenEncuesta', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Token único para acceder a la encuesta'
      },
      id_encuesta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { 
          model: 'encuestas', 
          key: 'id_encuesta' 
        },
        onDelete: 'CASCADE',  // 🔥 Se elimina si se borra la encuesta
        onUpdate: 'CASCADE'
      },
      id_estudiante: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { 
          model: 'estudiantes', 
          key: 'id' 
        },
        onDelete: 'CASCADE',  // 🔥 Se elimina si se borra el estudiante
        onUpdate: 'CASCADE'
      },
      usado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el token ya fue utilizado'
      },
      fecha_expiracion: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha de expiración del token'
      },
      fecha_uso: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha en que se usó el token'
      },
      ip_uso: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP desde la que se respondió'
      }
    }, {
      tableName: 'tokens_encuesta',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { unique: true, fields: ['token'] },
        { fields: ['id_encuesta', 'id_estudiante'] }
      ]
    });

    return this.model;
  }

  static associate(models) {
    const { Encuesta, Estudiante } = models;

    // 🔥 Relación con Encuesta (con cascada)
    if (Encuesta) {
      this.model.belongsTo(Encuesta, {
        foreignKey: 'id_encuesta',
        as: 'encuesta',
        onDelete: 'CASCADE',  // 🔥 Se elimina el token si se elimina la encuesta
        hooks: true
      });
    }

    // 🔥 Relación con Estudiante (con cascada)
    if (Estudiante) {
      this.model.belongsTo(Estudiante, {
        foreignKey: 'id_estudiante',
        as: 'estudiante',
        onDelete: 'CASCADE',  // 🔥 Se elimina el token si se elimina el estudiante
        hooks: true
      });
    }
  }
}

module.exports = TokenEncuestaModel;
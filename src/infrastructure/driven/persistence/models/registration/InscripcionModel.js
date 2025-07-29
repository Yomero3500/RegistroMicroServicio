const { DataTypes } = require('sequelize');

class InscripcionModel {
  static init(sequelize) {
    const Inscripcion = sequelize.define('Inscripcion', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      estudiante_id: {
        type: DataTypes.STRING(7),
        allowNull: false,
        references: {
          model: 'estudiantes',
          key: 'matricula'
        }
      },
      grupo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'grupos',
          key: 'id'
        }
      },
      tutor_usuario_id: {
        type: DataTypes.STRING(128),
        allowNull: false,
        comment: 'UUID del tutor del microservicio de Personal'
      },
      estado: {
        type: DataTypes.ENUM('Inscrito', 'Inactivo', 'Egresado', 'Baja Temporal', 'Baja Definitiva', 'Baja Académica'),
        allowNull: true,
        defaultValue: 'Inscrito'
      }
    }, {
      tableName: 'inscripciones',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return Inscripcion;
  }

  static associate(models) {
    const { Estudiante, Grupo } = models;
    if (Estudiante) {
      this.belongsTo(Estudiante, {
        foreignKey: 'estudiante_id',
        targetKey: 'matricula',
        as: 'estudiante'
      });
    }
    if (Grupo) {
      this.belongsTo(Grupo, {
        foreignKey: 'grupo_id',
        as: 'grupo'
      });
    }
  }
}

module.exports = InscripcionModel;

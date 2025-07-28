const { DataTypes } = require('sequelize');

class GrupoModel {
  static init(sequelize) {
    const Grupo = sequelize.define('Grupo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      cohorte_id: {
        type: DataTypes.STRING(3),
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'cohortes',
          key: 'id'
        }
      },
      grado: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1
        }
      },
      profesor_id: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: 'UUID del profesor del microservicio de Personal'
      }
    }, {
      tableName: 'grupos',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return Grupo;
  }

  static associate(models) {
    const { Cohorte, Inscripcion } = models;
    if (Cohorte) {
      this.belongsTo(Cohorte, {
        foreignKey: 'cohorte_id',
        as: 'cohorte'
      });
    }
    if (Inscripcion) {
      this.hasMany(Inscripcion, {
        foreignKey: 'grupo_id',
        as: 'inscripciones'
      });
    }
  }
}

module.exports = GrupoModel;

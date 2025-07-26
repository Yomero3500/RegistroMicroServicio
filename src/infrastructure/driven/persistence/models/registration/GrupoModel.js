const { DataTypes } = require('sequelize');

class GrupoModel {
  static init(sequelize) {
    const Grupo = sequelize.define('Grupo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cohorte_id: {
        type: DataTypes.STRING(3),
        allowNull: false,
        references: {
          model: 'cohortes',
          key: 'id'
        }
      },
      grado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      letra_grupo: {
        type: DataTypes.CHAR(1),
        allowNull: false,
        validate: {
          isUppercase: true,
          isIn: [['A', 'B', 'C', 'D', 'E', 'F']]
        }
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

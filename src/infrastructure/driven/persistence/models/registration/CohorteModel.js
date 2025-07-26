const { DataTypes } = require('sequelize');

class CohorteModel {
  static init(sequelize) {
    const Cohorte = sequelize.define('Cohorte', {
      id: {
        type: DataTypes.STRING(3),
        primaryKey: true,
        validate: {
          is: /^[0-9]{3}$/
        }
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: true
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      tableName: 'cohortes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return Cohorte;
  }

  static associate(models) {
    const { Grupo } = models;
    if (Grupo) {
      this.hasMany(Grupo, {
        foreignKey: 'cohorte_id',
        as: 'grupos'
      });
    }
  }
}

module.exports = CohorteModel;

const { DataTypes } = require('sequelize');
const moment = require('moment');

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
      anio_ingreso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Año de ingreso del cohorte (ej: 2022)'
      },
      periodo_ingreso: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Periodo de ingreso (1: Enero, 3: Septiembre)',
        validate: {
          isIn: [[1, 3]]
        }
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha de inicio del cohorte'
      },
      fecha_fin_ideal: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha ideal de finalización (10 cuatrimestres)'
      },
      fecha_fin_maxima: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Fecha máxima de finalización (15 cuatrimestres)'
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
  const { Grupo, EstrategiaCohorte } = models;
  
  if (Grupo) {
    this.hasMany(Grupo, {
      foreignKey: 'cohorte_id',
      as: 'grupos'
    });
  }

  // ✅ NUEVA RELACIÓN con Estrategias
  if (EstrategiaCohorte) {
    this.hasMany(EstrategiaCohorte, {
      foreignKey: 'cohorte_id',
      as: 'estrategias'
    });
  }
}
}

module.exports = CohorteModel;

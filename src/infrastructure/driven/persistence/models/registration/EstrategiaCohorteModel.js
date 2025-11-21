const { DataTypes } = require('sequelize');

class EstrategiaCohorteModel {
  static model = null;

  static init(sequelize) {
    this.model = sequelize.define('EstrategiaCohorte', {
      id_estrategia: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      cohorte_id: {
        type: DataTypes.STRING(3),
        allowNull: false,
        comment: 'ID del cohorte (relación con tabla cohortes)',
        references: {
          model: 'cohortes',
          key: 'id'
        }
      },
      fecha_estrategia: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha en que se crea/aplica la estrategia'
      },
      periodo_aplicacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Periodo en que se aplica (ej: Septiembre-Diciembre 2024)'
      },
      estatus_seguimiento: {
        type: DataTypes.ENUM('pendiente', 'en_proceso', 'completada', 'cancelada'),
        allowNull: false,
        defaultValue: 'pendiente'
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada de la estrategia'
      },
      id_usuario_creador: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ID del usuario que creó la estrategia'
      },
      activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    }, {
      tableName: 'estrategias_cohorte',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return this.model;
  }

  static associate(models) {
    // Relación con Cohorte
    if (models.Cohorte) {
      this.model.belongsTo(models.Cohorte, {
        foreignKey: 'cohorte_id',
        as: 'cohorte',
        onDelete: 'CASCADE'
      });
    }

    // Relación con Usuario (si existe)
    if (models.Usuario) {
      this.model.belongsTo(models.Usuario, {
        foreignKey: 'id_usuario_creador',
        as: 'creador'
      });
    }
  }
}

module.exports = EstrategiaCohorteModel;
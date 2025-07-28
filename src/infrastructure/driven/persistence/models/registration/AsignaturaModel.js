const { DataTypes } = require('sequelize');

class AsignaturaModel {
  static init(sequelize) {
    const Asignatura = sequelize.define('Asignatura', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      num_cuatri: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      }
    }, {
      tableName: 'asignaturas',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return Asignatura;
  }

  static associate(models) {
    // Las asociaciones se manejan en otro microservicio
  }
}

module.exports = AsignaturaModel;

const { DataTypes } = require('sequelize');

class StudentModel {
  static init(sequelize) {
    const Student = sequelize.define('Student', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      matricula: {
        type: DataTypes.STRING(7),
        allowNull: false,
        unique: true
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      estatus: {
        type: DataTypes.ENUM('Inscrito','Inactivo', 'Egresado', 'Baja Temporal', 'Baja Definitiva', 'Baja Académica'),
        allowNull: false,
        defaultValue: 'Inscrito'
      },
      tutorAcademicoId: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: 'tutor_academico_id'
      },
      cohorteId: {
        type: DataTypes.STRING(3),
        allowNull: false,
        field: 'cohorte_id'
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'password_hash'
      }
    }, {
      tableName: 'estudiantes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      // Evitar que Sequelize intente alterar columnas con valores inválidos
      sync: {
        alter: false
      }
    });

    return Student;
  }

  static associate(models) {
    // Aquí se definirían las asociaciones cuando se agreguen más modelos
  }
}

module.exports = StudentModel;

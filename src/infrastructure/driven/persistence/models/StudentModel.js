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
        type: DataTypes.STRING(6),
        allowNull: false,
        unique: true,
        validate: {
          len: [6, 6],
          isNumeric: true
        }
      },
      nombres: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      carreraId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'carrera_id'
      },
      planEstudiosId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'plan_estudios_id'
      },
      estatusGeneral: {
        type: DataTypes.ENUM('Inscrito', 'Baja Temporal', 'Baja Definitiva', 'Egresado'),
        allowNull: false,
        defaultValue: 'Inscrito',
        field: 'estatus_general'
      },
      cuatrimestreActual: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 12
        },
        field: 'cuatrimestre_actual'
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      numeroTelefono: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          isNumeric: true,
          len: [10, 10]
        },
        field: 'numero_telefono'
      },
      nombreTutorLegal: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'nombre_tutor_legal'
      },
      tutorAcademicoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'tutor_academico_id'
      },
      telefonoTutorLegal: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
          isNumeric: true,
          len: [10, 10]
        },
        field: 'telefono_tutor_legal'
      }
    }, {
      tableName: 'estudiantes',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return Student;
  }

  static associate(models) {
    // Aquí se definirían las asociaciones cuando se agreguen más modelos
    // Por ejemplo:
    // models.Student.belongsTo(models.Carrera, { foreignKey: 'carreraId' });
    // models.Student.belongsTo(models.PlanEstudios, { foreignKey: 'planEstudiosId' });
  }
}

module.exports = StudentModel;

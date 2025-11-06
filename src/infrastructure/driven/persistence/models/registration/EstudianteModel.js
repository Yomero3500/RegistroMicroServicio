const { DataTypes } = require('sequelize');

class EstudianteModel {
  static init(sequelize) {
    const Estudiante = sequelize.define('Estudiante', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      matricula: {
        type: DataTypes.STRING(7),
        allowNull: false,
        validate: {
          is: /^[0-9]{6}$/
        }
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
        validate: {
          isEmail: true
        }
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Hash de la contraseña del alumno (bcrypt)'
      },
      estatus: {
        type: DataTypes.ENUM('Inscrito', 'Inactivo', 'Egresado', 'Baja Temporal', 'Baja Definitiva', 'Baja Académica'),
        allowNull: false,
        defaultValue: 'Inscrito'
      },
      tutor_academico_id: {
        type: DataTypes.STRING(128),
        allowNull: true,
        comment: 'UUID del tutor académico del microservicio de Personal'
      },
      cohorte_id: {
        type: DataTypes.STRING(3),
        allowNull: false,
        comment: 'ID del cohorte al que pertenece el estudiante'
      }
    }, {
      tableName: 'estudiantes',
      indexes: [
        {
          unique: true,
          fields: ['matricula'],
          name: 'estudiantes_matricula'
        },
        {
          unique: true,
          fields: ['email'],
          name: 'estudiantes_email'
        },
        {
          fields: ['cohorte_id'],
          name: 'estudiantes_cohorte'
        }
      ],
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });

    return Estudiante;
  }

  static associate(models) {
    const { Inscripcion, Cohorte } = models;
    
    if (Inscripcion) {
      this.hasMany(Inscripcion, {
        foreignKey: 'estudiante_id',
        as: 'inscripciones'
      });
    }

    if (Cohorte) {
      this.belongsTo(Cohorte, {
        foreignKey: 'cohorte_id',
        as: 'cohorte'
      });
    }
  }
}

module.exports = EstudianteModel;

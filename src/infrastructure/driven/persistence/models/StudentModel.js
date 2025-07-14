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
        validate: {
          len: [6, 6],
          isNumeric: true
        }
      },
      nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      carrera: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      estatusAlumno: {
        type: DataTypes.ENUM('Activo', 'Inactivo', 'Egresado', 'Baja Temporal', 'Baja Definitiva', 'Baja Académica'),
        allowNull: false,
        defaultValue: 'Activo',
        field: 'estatus_alumno'
      },
      cuatrimestreActual: {
        type: DataTypes.STRING(10),
        allowNull: false,
        field: 'cuatrimestre_actual'
      },
      grupoActual: {
        type: DataTypes.STRING(10),
        allowNull: true,
        field: 'grupo_actual'
      },
      materia: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      periodo: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      estatusMateria: {
        type: DataTypes.ENUM('Sin cursar', 'Cursando', 'Aprobada', 'Aprobado', 'Reprobada', 'Reprobado'),
        allowNull: true,
        defaultValue: 'Sin cursar',
        field: 'estatus_materia'
      },
      final: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100
        }
      },
      extra: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: 'N/A'
      },
      estatusCardex: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Vigente',
        field: 'estatus_cardex'
      },
      periodoCursado: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'periodo_cursado'
      },
      planEstudiosClave: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'plan_estudios_clave'
      },
      creditos: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0
        }
      },
      tutorAcademico: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'tutor_academico'
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
  }
}

module.exports = StudentModel;

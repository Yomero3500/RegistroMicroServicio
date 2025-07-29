'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Eliminar la clave foránea existente
    try {
      await queryInterface.removeConstraint('inscripciones', 'inscripciones_estudiante_id_fkey');
    } catch (error) {
      console.log('La restricción no existía, continuando...');
    }

    // Modificar la columna estudiante_id
    await queryInterface.changeColumn('inscripciones', 'estudiante_id', {
      type: Sequelize.STRING(7),
      allowNull: false,
      references: {
        model: 'estudiantes',
        key: 'matricula'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar la clave foránea
    try {
      await queryInterface.removeConstraint('inscripciones', 'inscripciones_estudiante_id_fkey');
    } catch (error) {
      console.log('La restricción no existía, continuando...');
    }

    // Revertir la columna estudiante_id
    await queryInterface.changeColumn('inscripciones', 'estudiante_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'estudiantes',
        key: 'id'
      }
    });
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primero eliminamos la restricción de clave foránea existente
    await queryInterface.removeConstraint('inscripciones', 'inscripciones_estudiante_id_fkey');

    // Luego modificamos la columna
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
    // Primero eliminamos la restricción de clave foránea
    await queryInterface.removeConstraint('inscripciones', 'inscripciones_estudiante_id_fkey');

    // Luego revertimos la columna a su estado original
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

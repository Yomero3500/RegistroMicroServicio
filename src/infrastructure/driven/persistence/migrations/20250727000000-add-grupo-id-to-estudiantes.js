'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('estudiantes', 'grupo_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'ID del grupo al que pertenece el estudiante'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('estudiantes', 'grupo_id');
  }
};

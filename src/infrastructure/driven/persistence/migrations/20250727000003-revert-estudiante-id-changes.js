'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primero eliminamos la restricción de clave foránea si existe
    try {
      await queryInterface.removeConstraint('inscripciones', 'inscripciones_estudiante_id_fkey');
    } catch (error) {
      console.log('La restricción no existía, continuando...');
    }

    // Modificamos la columna estudiante_id para que vuelva a ser INTEGER
    await queryInterface.changeColumn('inscripciones', 'estudiante_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'estudiantes',
        key: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    // No necesitamos down ya que esto es una corrección
    return Promise.resolve();
  }
};

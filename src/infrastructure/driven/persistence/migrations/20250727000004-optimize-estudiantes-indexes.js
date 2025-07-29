'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Primero, eliminar todos los índices excepto la clave primaria
    const [indexes] = await queryInterface.sequelize.query(
      "SHOW INDEXES FROM estudiantes WHERE Key_name != 'PRIMARY'"
    );

    for (const index of indexes) {
      await queryInterface.removeIndex('estudiantes', index.Key_name);
    }

    // Crear solo los índices necesarios
    await queryInterface.addIndex('estudiantes', ['matricula'], {
      name: 'estudiantes_matricula',
      unique: true
    });

    await queryInterface.addIndex('estudiantes', ['email'], {
      name: 'estudiantes_email',
      unique: true
    });

    await queryInterface.addIndex('estudiantes', ['cohorte_id'], {
      name: 'estudiantes_cohorte'
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar los índices creados
    await queryInterface.removeIndex('estudiantes', 'estudiantes_matricula');
    await queryInterface.removeIndex('estudiantes', 'estudiantes_email');
    await queryInterface.removeIndex('estudiantes', 'estudiantes_cohorte');
  }
};

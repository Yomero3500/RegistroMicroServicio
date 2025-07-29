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

    // Primero, eliminar cualquier dato existente que podría causar problemas
    await queryInterface.sequelize.query('DELETE FROM inscripciones;');
    
    // Modificar la columna estudiante_id
    await queryInterface.removeColumn('inscripciones', 'estudiante_id');
    
    // Agregar la columna nuevamente con la configuración correcta
    await queryInterface.addColumn('inscripciones', 'estudiante_id', {
      type: Sequelize.STRING(7),
      allowNull: false
    });

    // Agregar la clave foránea por separado
    await queryInterface.addConstraint('inscripciones', {
      fields: ['estudiante_id'],
      type: 'foreign key',
      name: 'inscripciones_estudiante_matricula_fk',
      references: {
        table: 'estudiantes',
        field: 'matricula'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    // Eliminar la clave foránea
    try {
      await queryInterface.removeConstraint('inscripciones', 'inscripciones_estudiante_id_fkey');
    } catch (error) {
      console.log('La restricción no existía, continuando...');
    }

    // Eliminar la clave foránea primero
    await queryInterface.removeConstraint('inscripciones', 'inscripciones_estudiante_matricula_fk');
    
    // Eliminar la columna actual
    await queryInterface.removeColumn('inscripciones', 'estudiante_id');
    
    // Agregar la columna nuevamente con la configuración original
    await queryInterface.addColumn('inscripciones', 'estudiante_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'estudiantes',
        key: 'id'
      }
    });
  }
};

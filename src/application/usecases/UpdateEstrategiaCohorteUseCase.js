// src/application/usecases/estrategia/UpdateEstrategiaCohorteUseCase.js

class UpdateEstrategiaCohorteUseCase {
  constructor(estrategiaCohorteRepository) {
    this.estrategiaCohorteRepository = estrategiaCohorteRepository;
  }

  async execute(id, updateData) {
    try {
      console.log(`📝 UpdateEstrategiaCohorteUseCase: Actualizando estrategia ${id}`);

      // Validar ID
      if (!id) {
        throw new Error('El ID de la estrategia es requerido');
      }

      // Validar que hay datos para actualizar
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No hay datos para actualizar');
      }

      // Campos permitidos para actualizar
      const camposPermitidos = [
        'fecha_estrategia',
        'periodo_aplicacion',
        'estatus_seguimiento',
        'descripcion',
        'activa'
      ];

      // Filtrar solo los campos permitidos
      const datosActualizacion = {};
      for (const campo of camposPermitidos) {
        if (updateData[campo] !== undefined) {
          datosActualizacion[campo] = updateData[campo];
        }
      }

      if (Object.keys(datosActualizacion).length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      const estrategia = await this.estrategiaCohorteRepository.update(id, datosActualizacion);

      const estrategiaJson = estrategia.toJSON();
      
      if (estrategiaJson.cohorte) {
        estrategiaJson.cohorte_nombre = `Cohorte ${estrategiaJson.cohorte.anio_ingreso}-${estrategiaJson.cohorte.periodo_ingreso}`;
      }

      return {
        success: true,
        data: estrategiaJson,
        message: 'Estrategia actualizada exitosamente'
      };
    } catch (error) {
      console.error('❌ UpdateEstrategiaCohorteUseCase: Error:', error);
      throw error;
    }
  }
}

module.exports = UpdateEstrategiaCohorteUseCase;
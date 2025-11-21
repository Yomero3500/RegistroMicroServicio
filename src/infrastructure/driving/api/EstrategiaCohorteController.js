// src/infrastructure/driving/api/EstrategiaCohorteController.js

class EstrategiaCohorteController {
  constructor(
    createEstrategiaUseCase,
    getEstrategiasUseCase,
    getEstrategiaByIdUseCase,
    getEstrategiasByCohorteUseCase,
    updateEstrategiaUseCase,
    deleteEstrategiaUseCase,
    getCohortesUseCase
  ) {
    this.createEstrategiaUseCase = createEstrategiaUseCase;
    this.getEstrategiasUseCase = getEstrategiasUseCase;
    this.getEstrategiaByIdUseCase = getEstrategiaByIdUseCase;
    this.getEstrategiasByCohorteUseCase = getEstrategiasByCohorteUseCase;
    this.updateEstrategiaUseCase = updateEstrategiaUseCase;
    this.deleteEstrategiaUseCase = deleteEstrategiaUseCase;
    this.getCohortesUseCase = getCohortesUseCase;
  }

  /**
   * Crear nueva estrategia
   * POST /estrategias
   */
  async createEstrategia(req, res, next) {
    try {
      console.log('📝 EstrategiaCohorteController: Creando estrategia...');
      console.log('Body:', req.body);
      
      // Obtener ID del usuario desde el token/sesión
      // En este ejemplo usamos un valor por defecto, deberías obtenerlo de req.user
      const estrategiaData = {
        ...req.body,
        id_usuario_creador: req.body.id_usuario_creador
      };
      
      const result = await this.createEstrategiaUseCase.execute(estrategiaData);
      
      console.log('✅ Estrategia creada exitosamente');
      res.status(201).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error al crear estrategia:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al crear estrategia'
      });
    }
  }

  /**
   * Obtener todas las estrategias (con filtros opcionales)
   * GET /estrategias?cohorte_id=xxx&estatus=pendiente&activa=true
   */
  async getEstrategias(req, res, next) {
    try {
      console.log('🔍 EstrategiaCohorteController: Obteniendo estrategias...');
      console.log('Query params:', req.query);
      
      const filters = {};
      
      if (req.query.cohorte_id) {
        filters.cohorte_id = req.query.cohorte_id;
      }
      
      if (req.query.estatus) {
        filters.estatus_seguimiento = req.query.estatus;
      }
      
      if (req.query.activa !== undefined) {
        filters.activa = req.query.activa === 'true';
      }
      
      const result = await this.getEstrategiasUseCase.execute(filters);
      
      console.log(`✅ ${result.total} estrategias obtenidas`);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error al obtener estrategias:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estrategias'
      });
    }
  }

  /**
   * Obtener estrategia por ID
   * GET /estrategias/:id
   */
  async getEstrategiaById(req, res, next) {
    try {
      const { id } = req.params;
      
      console.log(`🔍 EstrategiaCohorteController: Obteniendo estrategia con ID: ${id}`);
      
      const result = await this.getEstrategiaByIdUseCase.execute(id);
      
      console.log('✅ Estrategia encontrada');
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error:', error);
      
      const statusCode = error.message.includes('No se encontró') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener estrategia'
      });
    }
  }

  /**
   * Obtener estrategias de un cohorte específico
   * GET /estrategias/cohorte/:cohorteId
   */
  async getEstrategiasByCohorte(req, res, next) {
    try {
      const { cohorteId } = req.params;
      
      console.log(`🔍 EstrategiaCohorteController: Obteniendo estrategias del cohorte: ${cohorteId}`);
      
      const result = await this.getEstrategiasByCohorteUseCase.execute(cohorteId);
      
      console.log(`✅ ${result.total} estrategias del cohorte obtenidas`);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estrategias del cohorte'
      });
    }
  }

  /**
   * Actualizar estrategia
   * PUT /estrategias/:id
   */
  async updateEstrategia(req, res, next) {
    try {
      const { id } = req.params;
      
      console.log(`📝 EstrategiaCohorteController: Actualizando estrategia ${id}...`);
      console.log('Body:', req.body);
      
      const result = await this.updateEstrategiaUseCase.execute(id, req.body);
      
      console.log('✅ Estrategia actualizada exitosamente');
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error:', error);
      
      const statusCode = error.message.includes('No se encontró') ? 404 : 400;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar estrategia'
      });
    }
  }

  /**
   * Eliminar estrategia
   * DELETE /estrategias/:id
   */
  async deleteEstrategia(req, res, next) {
    try {
      const { id } = req.params;
      
      console.log(`🗑️ EstrategiaCohorteController: Eliminando estrategia ${id}...`);
      
      const result = await this.deleteEstrategiaUseCase.execute(id);
      
      console.log('✅ Estrategia eliminada exitosamente');
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error:', error);
      
      const statusCode = error.message.includes('No se encontró') ? 404 : 500;
      
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar estrategia'
      });
    }
  }

  /**
   * Obtener todos los cohortes disponibles
   * GET /estrategias/cohortes/lista
   */
  async getCohortes(req, res, next) {
    try {
      console.log('🔍 EstrategiaCohorteController: Obteniendo cohortes disponibles...');
      
      const result = await this.getCohortesUseCase.execute();
      
      console.log(`✅ ${result.total} cohortes obtenidos`);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener cohortes'
      });
    }
  }

  /**
   * Cambiar estado de una estrategia
   * PATCH /estrategias/:id/estado
   */
  async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estatus_seguimiento } = req.body;
      
      if (!estatus_seguimiento) {
        return res.status(400).json({
          success: false,
          message: 'El estatus es requerido'
        });
      }
      
      console.log(`📝 EstrategiaCohorteController: Cambiando estado de estrategia ${id} a ${estatus_seguimiento}...`);
      
      const result = await this.updateEstrategiaUseCase.execute(id, { estatus_seguimiento });
      
      console.log('✅ Estado actualizado exitosamente');
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cambiar estado'
      });
    }
  }

  /**
   * Activar/Desactivar estrategia
   * PATCH /estrategias/:id/toggle
   */
  async toggleActiva(req, res, next) {
    try {
      const { id } = req.params;
      const { activa } = req.body;
      
      if (activa === undefined) {
        return res.status(400).json({
          success: false,
          message: 'El campo activa es requerido'
        });
      }
      
      console.log(`📝 EstrategiaCohorteController: ${activa ? 'Activando' : 'Desactivando'} estrategia ${id}...`);
      
      const result = await this.updateEstrategiaUseCase.execute(id, { activa });
      
      console.log('✅ Estrategia actualizada exitosamente');
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ EstrategiaCohorteController: Error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar estrategia'
      });
    }
  }
}

module.exports = EstrategiaCohorteController;
const EstrategiaCohorteModel = require('./models/registration/EstrategiaCohorteModel');
const CohorteModel = require('./models/registration/CohorteModel');
const { sequelize } = require('../../config/database');

class EstrategiaCohorteRepository {
  constructor() {
    this.EstrategiaCohorte = null;
    this.Cohorte = null;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      console.log('🔄 EstrategiaCohorteRepository: Inicializando modelos...');
      this.EstrategiaCohorte = EstrategiaCohorteModel.init(sequelize);
      this.Cohorte = CohorteModel.init(sequelize);
      
      // Establecer asociaciones
      EstrategiaCohorteModel.associate({ Cohorte: this.Cohorte });
      
      console.log('✅ EstrategiaCohorteRepository: Modelos inicializados');
      this.initialized = true;
    }
  }

  async create(estrategiaData) {
    try {
      await this.initialize();
      
      console.log('📝 EstrategiaCohorteRepository: Creando estrategia para cohorte:', estrategiaData.cohorte_id);
      
      // Verificar que el cohorte existe
      const cohorte = await this.Cohorte.findByPk(estrategiaData.cohorte_id);
      if (!cohorte) {
        throw new Error(`No existe el cohorte con ID: ${estrategiaData.cohorte_id}`);
      }
      
      const estrategia = await this.EstrategiaCohorte.create(estrategiaData);
      
      // Retornar con información del cohorte
      const estrategiaCompleta = await this.findById(estrategia.id_estrategia);
      
      console.log('✅ EstrategiaCohorteRepository: Estrategia creada con ID:', estrategia.id_estrategia);
      return estrategiaCompleta;
    } catch (error) {
      console.error('❌ EstrategiaCohorteRepository: Error al crear estrategia:', error);
      throw new Error(`Error al crear estrategia: ${error.message}`);
    }
  }

  async findAll(filters = {}) {
    try {
      await this.initialize();
      
      const where = {};
      
      if (filters.cohorte_id) where.cohorte_id = filters.cohorte_id;
      if (filters.estatus_seguimiento) where.estatus_seguimiento = filters.estatus_seguimiento;
      if (filters.activa !== undefined) where.activa = filters.activa;
      
      const estrategias = await this.EstrategiaCohorte.findAll({
        where,
        include: [{
          model: this.Cohorte,
          as: 'cohorte',
          attributes: ['id', 'anio_ingreso', 'periodo_ingreso', 'fecha_inicio', 'fecha_fin_ideal']
        }],
        order: [['fecha_estrategia', 'DESC']]
      });
      
      console.log(`✅ EstrategiaCohorteRepository: ${estrategias.length} estrategias encontradas`);
      return estrategias;
    } catch (error) {
      console.error('❌ EstrategiaCohorteRepository: Error al obtener estrategias:', error);
      throw new Error(`Error al obtener estrategias: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      await this.initialize();
      
      const estrategia = await this.EstrategiaCohorte.findByPk(id, {
        include: [{
          model: this.Cohorte,
          as: 'cohorte',
          attributes: ['id', 'anio_ingreso', 'periodo_ingreso', 'fecha_inicio', 'fecha_fin_ideal', 'fecha_fin_maxima']
        }]
      });
      
      if (!estrategia) {
        throw new Error(`No se encontró estrategia con ID: ${id}`);
      }
      
      return estrategia;
    } catch (error) {
      console.error('❌ EstrategiaCohorteRepository: Error al buscar estrategia:', error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      await this.initialize();
      
      const estrategia = await this.EstrategiaCohorte.findByPk(id);
      
      if (!estrategia) {
        throw new Error(`No se encontró estrategia con ID: ${id}`);
      }
      
      await estrategia.update(updateData);
      
      // Retornar con información del cohorte
      const estrategiaActualizada = await this.findById(id);
      
      console.log('✅ EstrategiaCohorteRepository: Estrategia actualizada:', id);
      return estrategiaActualizada;
    } catch (error) {
      console.error('❌ EstrategiaCohorteRepository: Error al actualizar estrategia:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.initialize();
      
      const estrategia = await this.EstrategiaCohorte.findByPk(id);
      
      if (!estrategia) {
        throw new Error(`No se encontró estrategia con ID: ${id}`);
      }
      
      await estrategia.destroy();
      
      console.log('✅ EstrategiaCohorteRepository: Estrategia eliminada:', id);
      return true;
    } catch (error) {
      console.error('❌ EstrategiaCohorteRepository: Error al eliminar estrategia:', error);
      throw error;
    }
  }

  async findByCohorteId(cohorteId) {
    try {
      await this.initialize();
      
      const estrategias = await this.EstrategiaCohorte.findAll({
        where: { 
          cohorte_id: cohorteId, 
          activa: true 
        },
        include: [{
          model: this.Cohorte,
          as: 'cohorte',
          attributes: ['id', 'anio_ingreso', 'periodo_ingreso', 'fecha_inicio']
        }],
        order: [['fecha_estrategia', 'DESC']]
      });
      
      console.log(`✅ EstrategiaCohorteRepository: ${estrategias.length} estrategias para cohorte ${cohorteId}`);
      return estrategias;
    } catch (error) {
      console.error('❌ EstrategiaCohorteRepository: Error:', error);
      throw new Error(`Error al obtener estrategias del cohorte: ${error.message}`);
    }
  }

  /**
   * Obtener todas las cohortes disponibles
   */
  async getAllCohortes() {
    try {
      await this.initialize();
      
      const cohortes = await this.Cohorte.findAll({
        attributes: ['id', 'anio_ingreso', 'periodo_ingreso', 'fecha_inicio', 'fecha_fin_ideal'],
        order: [['anio_ingreso', 'DESC'], ['periodo_ingreso', 'DESC']]
      });
      
      console.log(`✅ EstrategiaCohorteRepository: ${cohortes.length} cohortes encontradas`);
      return cohortes;
    } catch (error) {
      console.error('❌ EstrategiaCohorteRepository: Error al obtener cohortes:', error);
      throw new Error(`Error al obtener cohortes: ${error.message}`);
    }
  }
}

module.exports = EstrategiaCohorteRepository;
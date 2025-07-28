const ListMateriasUseCase = require('../../../application/usecases/ListMateriasUseCase');
const GetMateriaByIdUseCase = require('../../../application/usecases/GetMateriaByIdUseCase');
const FindMultipleMateriasUseCase = require('../../../application/usecases/FindMultipleMateriasUseCase');
const database = require('../../config/database');

class MateriasController {
  constructor() {
    this.listMateriasUseCase = new ListMateriasUseCase(database.getSequelize());
    this.getMateriaByIdUseCase = new GetMateriaByIdUseCase(database.getSequelize());
    this.findMultipleMateriasUseCase = new FindMultipleMateriasUseCase(database.getSequelize());
  }

  async listarMaterias(req, res, next) {
    try {
      const result = await this.listMateriasUseCase.execute();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMateriaById(req, res, next) {
    try {
      const { asignatura_id } = req.body;
      
      if (!asignatura_id) {
        return res.status(400).json({
          status: 'error',
          message: 'Se requiere el ID de la asignatura'
        });
      }

      const result = await this.getMateriaByIdUseCase.execute(asignatura_id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Asignatura no encontrada') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
      } else {
        next(error);
      }
    }
  }

  async findMultipleMaterias(req, res, next) {
    try {
      const { asignatura_ids } = req.body;

      if (!asignatura_ids || !Array.isArray(asignatura_ids)) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de IDs de asignaturas'
        });
      }

      const result = await this.findMultipleMateriasUseCase.execute(asignatura_ids);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MateriasController;

const moment = require('moment');

class CohorteService {
  constructor(sequelize) {
    this.sequelize = sequelize;
  }

  /**
   * Extrae la información del cohorte de una matrícula
   * @param {string} matricula - Matrícula del estudiante (formato: YYPNNN)
   * @returns {Object} Información del cohorte
   */
  extractCohorteInfo(matricula) {
    // Extraer los primeros 3 dígitos
    const cohorteId = matricula.substring(0, 3);
    
    // Extraer año y periodo
    const yearLastTwo = cohorteId.substring(0, 2);
    const periodo = parseInt(cohorteId.charAt(2));
    const fullYear = parseInt('20' + yearLastTwo);

    return {
      id: cohorteId,
      anio_ingreso: fullYear,
      periodo_ingreso: periodo
    };
  }

  /**
   * Calcula las fechas del cohorte
   * @param {number} anio - Año de ingreso
   * @param {number} periodo - Periodo (1: Enero, 3: Septiembre)
   * @returns {Object} Fechas del cohorte
   */
  calcularFechasCohorte(anio, periodo) {
    let fechaInicio;
    if (periodo === 1) {
      // Periodo de Enero
      fechaInicio = moment(`${anio}-01`);
    } else {
      // Periodo de Septiembre
      fechaInicio = moment(`${anio}-09`);
    }

    // Calcular fecha ideal (10 cuatrimestres = 40 meses)
    const fechaFinIdeal = moment(fechaInicio).add(40, 'months').endOf('month');
    
    // Calcular fecha máxima (15 cuatrimestres = 60 meses)
    const fechaFinMaxima = moment(fechaInicio).add(60, 'months').endOf('month');

    return {
      fecha_inicio: fechaInicio.toDate(),
      fecha_fin_ideal: fechaFinIdeal.toDate(),
      fecha_fin_maxima: fechaFinMaxima.toDate()
    };
  }

  /**
   * Crea o actualiza un cohorte basado en la matrícula
   * @param {string} matricula - Matrícula del estudiante
   */
  async processCohorte(matricula) {
    try {
      const { Cohorte } = this.sequelize.models;
      
      // Obtener información del cohorte de la matrícula
      const cohorteInfo = this.extractCohorteInfo(matricula);
      
      // Calcular fechas
      const fechas = this.calcularFechasCohorte(cohorteInfo.anio_ingreso, cohorteInfo.periodo_ingreso);
      
      // Crear o actualizar el cohorte
      const [cohorte, created] = await Cohorte.findOrCreate({
        where: { id: cohorteInfo.id },
        defaults: {
          ...cohorteInfo,
          ...fechas
        }
      });

      if (created) {
        console.log(`✅ Cohorte ${cohorteInfo.id} creado: Inicio ${moment(fechas.fecha_inicio).format('YYYY-MM-DD')}, Fin ideal ${moment(fechas.fecha_fin_ideal).format('YYYY-MM-DD')}`);
      } else {
        console.log(`ℹ️ Cohorte ${cohorteInfo.id} ya existe`);
      }

      return cohorte;
    } catch (error) {
      console.error('💥 Error al procesar cohorte:', error);
      throw error;
    }
  }

  /**
   * Valida si una matrícula tiene un formato válido para el cohorte
   * @param {string} matricula - Matrícula a validar
   * @returns {boolean} true si es válida
   */
  validarMatricula(matricula) {
    if (!matricula || typeof matricula !== 'string') {
      return false;
    }

    // Verificar formato básico: YYPNNN donde P debe ser 1 o 3
    const match = matricula.match(/^(\d{2})([13])\d{3}$/);
    if (!match) {
      return false;
    }

    // Extraer año y periodo
    const yearLastTwo = parseInt(match[1]);
    const periodo = parseInt(match[2]);

    // Validar que el año sea razonable (entre 2000 y el año actual + 1)
    const currentYear = new Date().getFullYear();
    const fullYear = 2000 + yearLastTwo;
    if (fullYear < 2000 || fullYear > currentYear + 1) {
      return false;
    }

    // Validar que el periodo sea 1 (Enero) o 3 (Septiembre)
    if (periodo !== 1 && periodo !== 3) {
      return false;
    }

    return true;
  }
}

module.exports = CohorteService;

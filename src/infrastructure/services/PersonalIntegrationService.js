// Servicio para integración con el microservicio de Personal
class PersonalIntegrationService {
  constructor() {
    this.personalApiUrl = 'http://localhost:3001';
  }

  /**
   * Obtener todos los tutores del microservicio de Personal
   */
  async getTutores() {
    try {
      console.log('🔍 PersonalIntegrationService: Obteniendo tutores desde:', `${this.personalApiUrl}/usuarios/listar`);
      
      const response = await fetch(`${this.personalApiUrl}/usuarios/listar`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ PersonalIntegrationService: No hay tutores registrados (404)');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filtrar solo los usuarios que son tutores
      const tutores = Array.isArray(data) ? data.filter(user => 
        user.tipo === 'Tutor' && user.estado === 'Activo'
      ) : [];
      
      console.log('✅ PersonalIntegrationService: Tutores obtenidos:', tutores.length);
      return tutores;
      
    } catch (error) {
      console.error('💥 PersonalIntegrationService: Error al obtener tutores:', error);
      // Si el microservicio no está disponible, retornar tutores por defecto
      return [
        { id: 1, nombre: 'Jose Alberto', email: 'jose.alberto@universidad.edu', tipo: 'Tutor', estado: 'Activo' },
        { id: 2, nombre: 'Mai', email: 'mai@universidad.edu', tipo: 'Tutor', estado: 'Activo' }
      ];
    }
  }

  /**
   * Obtener un tutor específico por nombre
   */
  async getTutorByName(nombreTutor) {
    try {
      const tutores = await this.getTutores();
      const tutor = tutores.find(t => 
        t.nombre.toLowerCase().includes(nombreTutor.toLowerCase())
      );
      
      if (tutor) {
        console.log(`✅ PersonalIntegrationService: Tutor encontrado: ${tutor.nombre}`);
        return tutor;
      } else {
        console.log(`ℹ️ PersonalIntegrationService: Tutor no encontrado: ${nombreTutor}`);
        return null;
      }
    } catch (error) {
      console.error('💥 PersonalIntegrationService: Error al buscar tutor:', error);
      return null;
    }
  }

  /**
   * Validar que un tutor existe en el microservicio de Personal
   */
  async validateTutor(nombreTutor) {
    const tutor = await this.getTutorByName(nombreTutor);
    return tutor !== null;
  }

  /**
   * Obtener información completa de tutores para dropdown/selector
   */
  async getTutoresForSelector() {
    try {
      const tutores = await this.getTutores();
      return tutores.map(tutor => ({
        value: tutor.nombre,
        label: tutor.nombre,
        email: tutor.email,
        id: tutor.id
      }));
    } catch (error) {
      console.error('💥 PersonalIntegrationService: Error al obtener tutores para selector:', error);
      return [
        { value: 'Jose Alberto', label: 'Jose Alberto', email: 'jose.alberto@universidad.edu', id: 1 },
        { value: 'Mai', label: 'Mai', email: 'mai@universidad.edu', id: 2 }
      ];
    }
  }

  /**
   * Verificar disponibilidad del microservicio de Personal
   */
  async checkServiceAvailability() {
    try {
      const response = await fetch(`${this.personalApiUrl}/usuarios/listar`);
      return response.ok;
    } catch (error) {
      console.warn('⚠️ PersonalIntegrationService: Microservicio de Personal no disponible');
      return false;
    }
  }
}

module.exports = PersonalIntegrationService;

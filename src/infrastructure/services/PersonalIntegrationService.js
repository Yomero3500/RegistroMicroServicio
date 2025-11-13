// Servicio para integración con el microservicio de Personal
class PersonalIntegrationService {
  constructor() {
    this.personalApiUrl = 'https://userservice-production-df93.up.railway.app';
  }

  /**
   * Obtener todos los tutores del microservicio de Personal
   */
  async getTutores() {
    try {
      console.log('🔍 PersonalIntegrationService: Obteniendo usuarios desde:', `${this.personalApiUrl}/usuarios/listar`);
      
      const response = await fetch(`${this.personalApiUrl}/usuarios/listar`);
      console.log('🔍 PersonalIntegrationService: Status de respuesta:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('ℹ️ PersonalIntegrationService: No hay usuarios registrados (404)');
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📋 PersonalIntegrationService: Datos recibidos:', data);
      
      // Filtrar solo los usuarios que son tutores y están inscritos o activos 
      const tutores = Array.isArray(data) ? data.filter(user => {
        // Verificar si el tipo incluye 'Tutor' (puede ser "Tutor Académico" o solo "Tutor")
        const esTutor = user.tipo && user.tipo.toLowerCase().includes('tutor');
        const estaActivo = user.estado === 'Inscrito' || user.estado === 'Activo';
        
        if (esTutor && estaActivo) {
          console.log(`✅ Tutor encontrado: ID=${user.id}, Nombre=${user.nombre}, Tipo=${user.tipo}`);
        }
        
        return esTutor && estaActivo;
      }) : [];
      
      console.log('✅ PersonalIntegrationService: Total de tutores inscritos:', tutores.length);
      return tutores;
      
    } catch (error) {
      console.error('💥 PersonalIntegrationService: Error al obtener tutores:', error);
      console.warn('🔄 PersonalIntegrationService: Usando tutores por defecto...');
      // Si el microservicio no está disponible, retornar tutores por defecto
      return [
        { id: 1, nombre: 'Jose Alberto García López', email: 'jose.alberto@universidad.edu', tipo: 'Tutor Académico', estado: 'Inscrito' },
        { id: 2, nombre: 'María Isabel Rodríguez', email: 'mai@universidad.edu', tipo: 'Tutor Académico', estado: 'Inscrito' }
      ];
    }
  }

  /**
   * Obtener un tutor específico por nombre (búsqueda flexible)
   */
  async getTutorByName(nombreTutor) {
    try {
      const tutores = await this.getTutores();
      
      if (!nombreTutor || nombreTutor.trim() === '') {
        console.log('⚠️ PersonalIntegrationService: Nombre de tutor vacío');
        return null;
      }
      
      const nombreBusqueda = nombreTutor.toLowerCase().trim();
      console.log(`🔍 PersonalIntegrationService: Buscando tutor con nombre: "${nombreBusqueda}"`);
      
      // Estrategias de búsqueda ordenadas por prioridad
      let tutorEncontrado = null;
      
      // 1. Coincidencia exacta
      tutorEncontrado = tutores.find(t => 
        t.nombre.toLowerCase() === nombreBusqueda
      );
      
      if (tutorEncontrado) {
        console.log(`✅ PersonalIntegrationService: Coincidencia exacta encontrada: ${tutorEncontrado.nombre}`);
        return tutorEncontrado;
      }
      
      // 2. El nombre del CSV está contenido en el nombre completo
      tutorEncontrado = tutores.find(t => 
        t.nombre.toLowerCase().includes(nombreBusqueda)
      );
      
      if (tutorEncontrado) {
        console.log(`✅ PersonalIntegrationService: Coincidencia parcial encontrada: ${tutorEncontrado.nombre} (contiene "${nombreBusqueda}")`);
        return tutorEncontrado;
      }
      
      // 3. Alguna palabra del nombre del CSV coincide con alguna palabra del nombre completo
      const palabrasBusqueda = nombreBusqueda.split(/\s+/);
      tutorEncontrado = tutores.find(t => {
        const palabrasNombre = t.nombre.toLowerCase().split(/\s+/);
        return palabrasBusqueda.some(palabraBusqueda => 
          palabrasNombre.some(palabraNombre => 
            palabraNombre.includes(palabraBusqueda) || palabraBusqueda.includes(palabraNombre)
          )
        );
      });
      
      if (tutorEncontrado) {
        console.log(`✅ PersonalIntegrationService: Coincidencia por palabras encontrada: ${tutorEncontrado.nombre} (palabras: "${nombreBusqueda}")`);
        return tutorEncontrado;
      }
      
      // 4. Si no se encontró nada, mostrar tutores disponibles para debugging
      console.log(`❌ PersonalIntegrationService: Tutor "${nombreBusqueda}" no encontrado`);
      console.log('📋 Tutores disponibles:');
      tutores.forEach(t => console.log(`  - ID: ${t.id}, Nombre: "${t.nombre}", Tipo: ${t.tipo}`));
      
      return null;
      
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
      console.log('🔍 PersonalIntegrationService: Verificando disponibilidad del microservicio...');
      const response = await fetch(`${this.personalApiUrl}/usuarios/listar`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const isAvailable = response.ok;
      console.log(`${isAvailable ? '✅' : '❌'} PersonalIntegrationService: Microservicio ${isAvailable ? 'disponible' : 'no disponible'} (status: ${response.status})`);
      return isAvailable;
    } catch (error) {
      console.warn('⚠️ PersonalIntegrationService: Microservicio de Personal no disponible:', error.message);
      return false;
    }
  }
}

module.exports = PersonalIntegrationService;

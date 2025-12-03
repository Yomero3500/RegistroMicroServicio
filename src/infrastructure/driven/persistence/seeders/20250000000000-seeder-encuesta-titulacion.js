module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 Iniciando creación de encuestas de requisitos de graduación...\n');

      // ==========================================
      // 1️⃣ ENCUESTA DE ESTANCIA 1
      // ==========================================
      const encuestaEstancia1 = await queryInterface.sequelize.query(
        `INSERT INTO encuestas (titulo, id_usuario, descripcion, tipo, fecha_creacion, updated_at, created_at) 
         VALUES (:titulo, :id_usuario, :descripcion, :tipo, :fecha, :fecha, :fecha)`,
        {
          replacements: {
            titulo: 'Estancia 1- encuesta de documentación',
            id_usuario: 'sistema',
            descripcion: 'Encuesta para registrar datos de la empresa y actividades realizadas durante la Estancia 1',
            tipo: 'empresa',
            fecha: new Date()
          }
        }
      );

      const [resultEstancia1] = await queryInterface.sequelize.query(
        `SELECT LAST_INSERT_ID() as id`
      );
      const id_encuesta_estancia1 = resultEstancia1[0].id;

      const preguntasEstancia1 = [
        // ========== DATOS GENERALES DE LA EMPRESA ==========
        { 
          title: 'Nombre completo de la Institución o Empresa', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: '¿Qué actividades realiza la empresa/institución?', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Domicilio', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Teléfono de contacto', 
          type: 'text', 
          required: true, 
          options: null 
        },

        // ========== ESTATUS DE LA ESTANCIA ==========
        { 
          title: '¿Has liberado tu Estancia 1?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí, liberada' }, 
            { value: 'No', text: 'No, aún no la he liberado' },
            { value: 'Proceso', text: 'Estoy en proceso' }
          ]) 
        },

        // ========== ACTIVIDADES REALIZADAS ==========
        { 
          title: '¿Qué actividades realizaste durante tu Estancia 1?', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Nombre del proyecto o actividad principal desarrollada', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Describe brevemente los resultados obtenidos en tu Estancia 1', 
          type: 'text', 
          required: false, 
          options: null 
        },

        // ========== PERIODO Y MODALIDAD ==========
        { 
          title: 'Periodo (Fechas en que realizaste la Estancia)', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Modalidad de la Estancia', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Presencial', text: 'Presencial' },
            { value: 'Distancia', text: 'A distancia' },
            { value: 'Mixta', text: 'Mixta' }
          ]) 
        },

        // ========== OBSERVACIONES ==========
        { 
          title: 'Observaciones adicionales', 
          type: 'text', 
          required: false, 
          options: null 
        }
      ];

      const preguntasConEncuestaEstancia1 = preguntasEstancia1.map((p) => ({
        ...p,
        id_encuesta: id_encuesta_estancia1,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('preguntas', preguntasConEncuestaEstancia1);

      console.log(`✅ Encuesta Estancia 1 creada con ${preguntasEstancia1.length} preguntas`);

      // ==========================================
      // 2️⃣ ENCUESTA DE ESTANCIA 2
      // ==========================================
      const encuestaEstancia2 = await queryInterface.sequelize.query(
        `INSERT INTO encuestas (titulo, id_usuario, descripcion, tipo, fecha_creacion, updated_at, created_at) 
         VALUES (:titulo, :id_usuario, :descripcion, :tipo, :fecha, :fecha, :fecha)`,
        {
          replacements: {
            titulo: 'Estancia 2 - encuesta de documentación',
            id_usuario: 'sistema',
            descripcion: 'Encuesta para registrar datos de la empresa y actividades realizadas durante la Estancia 2',
            tipo: 'empresa',
            fecha: new Date()
          }
        }
      );

      const [resultEstancia2] = await queryInterface.sequelize.query(
        `SELECT LAST_INSERT_ID() as id`
      );
      const id_encuesta_estancia2 = resultEstancia2[0].id;

      // Reutilizar las mismas preguntas para Estancia 2
      const preguntasConEncuestaEstancia2 = preguntasEstancia1.map((p) => {
        // Cambiar referencias de "Estancia 1" a "Estancia 2" en los títulos
        const newTitle = p.title.replace('Estancia 1', 'Estancia 2');
        return {
          ...p,
          title: newTitle,
          id_encuesta: id_encuesta_estancia2,
          created_at: new Date(),
          updated_at: new Date()
        };
      });

      await queryInterface.bulkInsert('preguntas', preguntasConEncuestaEstancia2);

      console.log(`✅ Encuesta Estancia 2 creada con ${preguntasEstancia1.length} preguntas`);

      // ==========================================
      // 3️⃣ ENCUESTA DE ESTADÍA PROFESIONAL
      // ==========================================
      const encuestaEstadia = await queryInterface.sequelize.query(
        `INSERT INTO encuestas (titulo, id_usuario, descripcion, tipo, fecha_creacion, updated_at, created_at) 
         VALUES (:titulo, :id_usuario, :descripcion, :tipo, :fecha, :fecha, :fecha)`,
        {
          replacements: {
            titulo: 'Estadía Profesional - encuesta de documentación',
            id_usuario: 'sistema',
            descripcion: 'Encuesta para registrar datos de la empresa y proyecto desarrollado durante la Estadía Profesional',
            tipo: 'empresa',
            fecha: new Date()
          }
        }
      );

      const [resultEstadia] = await queryInterface.sequelize.query(
        `SELECT LAST_INSERT_ID() as id`
      );
      const id_encuesta_estadia = resultEstadia[0].id;

      const preguntasEstadia = [
        // ========== DATOS GENERALES DE LA EMPRESA ==========
        { 
          title: 'Nombre completo de la Institución o Empresa', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: '¿Qué actividades realiza la empresa/institución?', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Domicilio', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Teléfono de contacto', 
          type: 'text', 
          required: true, 
          options: null 
        },

        // ========== ESTATUS DE LA ESTADÍA ==========
        { 
          title: '¿Has liberado tu Estadía Profesional?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí, liberada' }, 
            { value: 'No', text: 'No, aún no la he liberado' },
            { value: 'Proceso', text: 'Estoy en proceso' }
          ]) 
        },

        // ========== PROYECTO DESARROLLADO ==========
        { 
          title: 'Nombre del proyecto desarrollado en tu Estadía', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: '¿Qué actividades realizaste durante tu Estadía Profesional?', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Describe brevemente los objetivos del proyecto', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Describe brevemente los resultados obtenidos en tu Estadía', 
          type: 'text', 
          required: false, 
          options: null 
        },
        { 
          title: '¿Qué tecnologías o herramientas utilizaste en tu proyecto?', 
          type: 'text', 
          required: false, 
          options: null 
        },

        // ========== PERIODO Y MODALIDAD ==========
        { 
          title: 'Periodo (Fechas en que realizaste la Estadía)', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: 'Modalidad de la Estadía', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Presencial', text: 'Presencial' },
            { value: 'Distancia', text: 'A distancia' },
            { value: 'Mixta', text: 'Mixta' }
          ]) 
        },

        // ========== OBSERVACIONES ==========
        { 
          title: 'Observaciones adicionales', 
          type: 'text', 
          required: false, 
          options: null 
        }
      ];

      const preguntasConEncuestaEstadia = preguntasEstadia.map((p) => ({
        ...p,
        id_encuesta: id_encuesta_estadia,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('preguntas', preguntasConEncuestaEstadia);

      console.log(`✅ Encuesta Estadía Profesional creada con ${preguntasEstadia.length} preguntas`);

      // ==========================================
      // 4️⃣ ENCUESTA DE REQUISITOS DE GRADUACIÓN
      // ==========================================
      const encuestaRequisitos = await queryInterface.sequelize.query(
        `INSERT INTO encuestas (titulo, id_usuario, descripcion, tipo, fecha_creacion, updated_at, created_at) 
         VALUES (:titulo, :id_usuario, :descripcion, :tipo, :fecha, :fecha, :fecha)`,
        {
          replacements: {
            titulo: 'Requisitos de Titulación',
            id_usuario: 'sistema',
            descripcion: 'Encuesta para validar el cumplimiento de los requisitos adicionales para titulación',
            tipo: 'documento',
            fecha: new Date()
          }
        }
      );

      const [resultRequisitos] = await queryInterface.sequelize.query(
        `SELECT LAST_INSERT_ID() as id`
      );
      const id_encuesta_requisitos = resultRequisitos[0].id;

      const preguntasRequisitos = [
        // ========== REQUISITO 1: 10 Cuatrimestres ==========
        { 
          title: '¿Cuántos cuatrimestres has completado?', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: '¿Has completado los 10 cuatrimestres del plan de estudios?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí' }, 
            { value: 'No', text: 'No' }
          ]) 
        },

        // ========== REQUISITO 2: Pagos al Corriente ==========
        { 
          title: '¿Tienes pagos pendientes con la institución?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí, tengo adeudos' }, 
            { value: 'No', text: 'No, estoy al corriente' }
          ]) 
        },

        // ========== REQUISITO 3: Gastos de Titulación ==========
        { 
          title: '¿Has cubierto los gastos de titulación?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí, ya están cubiertos' }, 
            { value: 'No', text: 'No, aún no los he pagado' },
            { value: 'Parcial', text: 'Están parcialmente cubiertos' }
          ]) 
        },

        // ========== REQUISITO 4: E.FIRMA ==========
        { 
          title: '¿Tienes tu E.FIRMA (Firma Electrónica) vigente?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí, vigente' }, 
            { value: 'No', text: 'No la tengo' },
            { value: 'Vencida', text: 'La tengo pero está vencida' },
            { value: 'Tramite', text: 'En trámite' }
          ]) 
        },
        { 
          title: '¿Cuándo tramitaste tu E.FIRMA?', 
          type: 'text', 
          required: false, 
          options: null 
        },
        { 
          title: '¿Tu E.FIRMA está actualizada (no mayor a 4 años)?', 
          type: 'select', 
          required: false, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí' }, 
            { value: 'No', text: 'No' },
            { value: 'No_se', text: 'No lo sé' }
          ]) 
        },

        // ========== REQUISITO 7: Inglés Acreditado (SOLO 1 PREGUNTA) ==========
        { 
          title: '¿Has acreditado el nivel de inglés requerido?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí, acreditado' }, 
            { value: 'No', text: 'No, aún no lo acredito' },
            { value: 'Proceso', text: 'En proceso' }
          ]) 
        }
      ];

      const preguntasConEncuestaRequisitos = preguntasRequisitos.map((p) => ({
        ...p,
        id_encuesta: id_encuesta_requisitos,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('preguntas', preguntasConEncuestaRequisitos);

      console.log(`✅ Encuesta de Requisitos de Graduación creada con ${preguntasRequisitos.length} preguntas`);

      // ==========================================
      // 5️⃣ ENCUESTA DE SEGUIMIENTO ACADÉMICO
      // ==========================================
      const encuestaSeguimiento = await queryInterface.sequelize.query(
        `INSERT INTO encuestas (titulo, id_usuario, descripcion, tipo, fecha_creacion, updated_at, created_at) 
         VALUES (:titulo, :id_usuario, :descripcion, :tipo, :fecha, :fecha, :fecha)`,
        {
          replacements: {
            titulo: 'Seguimiento Académico',
            id_usuario: 'sistema',
            descripcion: 'Encuesta para dar seguimiento al progreso académico del estudiante',
            tipo: 'seguimiento',
            fecha: new Date()
          }
        }
      );

      const [resultSeguimiento] = await queryInterface.sequelize.query(
        `SELECT LAST_INSERT_ID() as id`
      );
      const id_encuesta_seguimiento = resultSeguimiento[0].id;

      const preguntasSeguimiento = [
        { 
          title: '¿En qué cuatrimestre te encuentras actualmente?', 
          type: 'text', 
          required: true, 
          options: null 
        },
        { 
          title: '¿Cuál es tu estatus académico actual?', 
          type: 'select', 
          required: true, 
          options: JSON.stringify([
            { value: 'Regular', text: 'Regular' },
            { value: 'Irregular', text: 'Irregular' },
            { value: 'Baja_temporal', text: 'Baja temporal' },
            { value: 'Egresado', text: 'Egresado' },
            { value: 'Titulado', text: 'Titulado' },
            { value: 'Sint_titulo', text: 'Sin título' }
          ]) 
        },
        { 
          title: '¿Cuántas materias llevas este cuatrimestre?', 
          type: 'text', 
          required: false, 
          options: null 
        },
        { 
          title: '¿Cuál es tu promedio general actual?', 
          type: 'text', 
          required: false, 
          options: null 
        },
        { 
          title: '¿Has reprobado alguna materia?', 
          type: 'select', 
          required: false, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí' }, 
            { value: 'No', text: 'No' }
          ]) 
        },
        { 
          title: 'Si has reprobado materias, ¿cuántas?', 
          type: 'text', 
          required: false, 
          options: null 
        },
        { 
          title: '¿Estás cursando materias recursadas?', 
          type: 'select', 
          required: false, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí' }, 
            { value: 'No', text: 'No' }
          ]) 
        },
        { 
          title: '¿Cómo calificas tu desempeño académico?', 
          type: 'select', 
          required: false, 
          options: JSON.stringify([
            { value: 'Excelente', text: 'Excelente (9-10)' },
            { value: 'Bueno', text: 'Bueno (8-8.9)' },
            { value: 'Regular', text: 'Regular (7-7.9)' },
            { value: 'Suficiente', text: 'Suficiente (6-6.9)' }
          ]) 
        },
        { 
          title: '¿Tienes materias pendientes de cuatrimestres anteriores?', 
          type: 'select', 
          required: false, 
          options: JSON.stringify([
            { value: 'Si', text: 'Sí' }, 
            { value: 'No', text: 'No' }
          ]) 
        },
        { 
          title: '¿Estás satisfecho con tu desempeño académico?', 
          type: 'select', 
          required: false, 
          options: JSON.stringify([
            { value: 'Muy_satisfecho', text: 'Muy satisfecho' },
            { value: 'Satisfecho', text: 'Satisfecho' },
            { value: 'Poco_satisfecho', text: 'Poco satisfecho' },
            { value: 'Insatisfecho', text: 'Insatisfecho' }
          ]) 
        },
        { 
          title: 'Califica del 1 al 10 tu nivel de satisfacción con el programa académico', 
          type: 'text', 
          required: false, 
          options: null 
        }
      ];

      const preguntasConEncuestaSeguimiento = preguntasSeguimiento.map((p) => ({
        ...p,
        id_encuesta: id_encuesta_seguimiento,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('preguntas', preguntasConEncuestaSeguimiento);

      console.log(`✅ Encuesta de Seguimiento Académico creada con ${preguntasSeguimiento.length} preguntas`);

      // ==========================================
      // RESUMEN FINAL
      // ==========================================
      const totalPreguntas = preguntasEstancia1.length + preguntasEstancia1.length + preguntasEstadia.length + preguntasRequisitos.length + preguntasSeguimiento.length;
      
      console.log('\n═══════════════════════════════════════');
      console.log('✅ RESUMEN DE CREACIÓN DE ENCUESTAS');
      console.log('═══════════════════════════════════════');
      console.log(`📋 Total de encuestas creadas: 5`);
      console.log(`\n   1️⃣ Estancia 1 (${preguntasEstancia1.length} preguntas)`);
      console.log(`   2️⃣ Estancia 2 (${preguntasEstancia1.length} preguntas)`);
      console.log(`   3️⃣ Estadía Profesional (${preguntasEstadia.length} preguntas)`);
      console.log(`   4️⃣ Requisitos de Graduación (${preguntasRequisitos.length} preguntas)`);
      console.log(`   5️⃣ Seguimiento Académico (${preguntasSeguimiento.length} preguntas)`);
      console.log(`\n📊 Total de preguntas creadas: ${totalPreguntas}`);
      console.log('═══════════════════════════════════════\n');

    } catch (error) {
      console.error('❌ Error en el seeder de encuestas:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DELETE FROM encuestas WHERE titulo IN (
        'Estancia 1 - encuesta de documentación',
        'Estancia 2 - encuesta de documentación',
        'Estadía Profesional - encuesta de documentación',
        'Requisitos de Titulación', 
        'Seguimiento Académico'
      )`
    );
    console.log('✅ Encuestas de requisitos eliminadas correctamente');
  }
};
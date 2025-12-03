module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // ==========================================
      // 1️⃣ ENCUESTA DE ESTILOS DE APRENDIZAJE
      // ==========================================
      const encuestaEstilos = await queryInterface.sequelize.query(
        `INSERT INTO encuestas (titulo, id_usuario, descripcion, tipo, fecha_creacion, updated_at, created_at) 
         VALUES (:titulo, :id_usuario, :descripcion, :tipo, :fecha, :fecha, :fecha)`,
        {
          replacements: {
            titulo: 'Test de Estilos de Aprendizaje',
            id_usuario: 'sistema',
            descripcion: 'Cuestionario para identificar el estilo de aprendizaje predominante (Visual, Auditivo, Kinestésico)',
            tipo: 'documento',
            fecha: new Date()
          }
        }
      );

      const [resultEstilos] = await queryInterface.sequelize.query(
        `SELECT LAST_INSERT_ID() as id`
      );
      const id_encuesta_estilos = resultEstilos[0].id;

      const preguntasEstilos = [
        { title: '¿Cuál de las siguientes actividades disfrutas más?', options: JSON.stringify([{ value: 'a', text: 'Ver películas' }, { value: 'b', text: 'Escuchar música' }, { value: 'c', text: 'Bailar con buena música' }]) },
        { title: '¿Qué programa de televisión prefieres?', options: JSON.stringify([{ value: 'a', text: 'Reportajes y documentales' }, { value: 'b', text: 'Noticias del mundo' }, { value: 'c', text: 'Cómico y de entretenimiento' }]) },
        { title: 'Cuando conversas con otra persona, tú:', options: JSON.stringify([{ value: 'a', text: 'La observas' }, { value: 'b', text: 'La escuchas atentamente' }, { value: 'c', text: 'Sueles hacer contacto físico' }]) },
        { title: 'Si pudieras adquirir uno de los siguientes artículos, ¿cuál elegirías?', options: JSON.stringify([{ value: 'a', text: 'Un televisor' }, { value: 'b', text: 'Un estéreo' }, { value: 'c', text: 'Un jacuzzi' }]) },
        { title: '¿Qué prefieres hacer un sábado por la tarde?', options: JSON.stringify([{ value: 'a', text: 'Ir al cine' }, { value: 'b', text: 'Ir a un concierto' }, { value: 'c', text: 'Actividades en casa' }]) },
        { title: '¿Qué tipo de exámenes se te facilitan más?', options: JSON.stringify([{ value: 'a', text: 'Examen escrito' }, { value: 'b', text: 'Examen oral' }, { value: 'c', text: 'Examen de opción múltiple' }]) },
        { title: '¿Cómo te orientas más fácilmente?', options: JSON.stringify([{ value: 'a', text: 'Mediante el uso de un mapa' }, { value: 'b', text: 'Pidiendo indicaciones' }, { value: 'c', text: 'A través de la intuición' }]) },
        { title: '¿En qué prefieres ocupar tu tiempo en un lugar de descanso?', options: JSON.stringify([{ value: 'a', text: 'Caminar por los alrededores' }, { value: 'b', text: 'Pensar' }, { value: 'c', text: 'Descansar' }]) },
        { title: '¿Qué te halaga más que te digan?', options: JSON.stringify([{ value: 'a', text: 'Que tienes buen aspecto' }, { value: 'b', text: 'Que tienes una conversación interesante' }, { value: 'c', text: 'Que eres muy agradable' }]) },
        { title: '¿Cuál ambiente te atrae más?', options: JSON.stringify([{ value: 'a', text: 'Una hermosa vista al océano' }, { value: 'b', text: 'Escuchar las olas del mar' }, { value: 'c', text: 'Sentir un clima agradable' }]) },
        { title: '¿De qué manera se te facilita aprender algo?', options: JSON.stringify([{ value: 'a', text: 'Escribiéndolo varias veces' }, { value: 'b', text: 'Repitiendo en voz alta' }, { value: 'c', text: 'Relacionándolo con algo divertido' }]) },
        { title: '¿A qué evento preferirías asistir?', options: JSON.stringify([{ value: 'a', text: 'A una exposición de arte' }, { value: 'b', text: 'A una conferencia' }, { value: 'c', text: 'A una reunión social' }]) },
        { title: '¿Qué influye en tu opinión de otras personas?', options: JSON.stringify([{ value: 'a', text: 'Su aspecto físico' }, { value: 'b', text: 'La sinceridad en su tono de voz' }, { value: 'c', text: 'Por la forma de estrecharte la mano' }]) },
        { title: '¿Cómo te consideras?', options: JSON.stringify([{ value: 'a', text: 'Atlético' }, { value: 'b', text: 'Intelectual' }, { value: 'c', text: 'Sociable' }]) },
        { title: '¿Qué género de películas te gustan más?', options: JSON.stringify([{ value: 'a', text: 'Acción' }, { value: 'b', text: 'Musicales' }, { value: 'c', text: 'Románticas' }]) },
        { title: '¿Cómo prefieres mantenerte en contacto con otra persona?', options: JSON.stringify([{ value: 'a', text: 'Correo electrónico' }, { value: 'b', text: 'Teléfono' }, { value: 'c', text: 'Tomando un café/té juntos' }]) },
        { title: '¿Cuál de las siguientes frases se identifican más contigo?', options: JSON.stringify([{ value: 'a', text: 'Es importante que mi automóvil esté limpio por fuera y por dentro' }, { value: 'b', text: 'Percibo hasta el más ligero ruido que hace mi automóvil' }, { value: 'c', text: 'Me gusta que mi automóvil se sienta bien al conducirlo' }]) },
        { title: '¿Cómo prefieres pasar el tiempo con tu novia o novio?', options: JSON.stringify([{ value: 'a', text: 'Mirando algo juntos' }, { value: 'b', text: 'Conversando' }, { value: 'c', text: 'Abrazándose' }]) },
        { title: 'Si no encuentras las llaves en una bolsa:', options: JSON.stringify([{ value: 'a', text: 'La buscas mirando' }, { value: 'b', text: 'Sacudes la bolsa para oír el ruido' }, { value: 'c', text: 'Buscas al tacto' }]) },
        { title: 'Cuando tratas de recordar algo, ¿cómo lo haces?', options: JSON.stringify([{ value: 'a', text: 'A través de imágenes' }, { value: 'b', text: 'A través de sonidos' }, { value: 'c', text: 'A través de emociones' }]) },
        { title: 'Si tuvieras dinero, ¿qué harías?', options: JSON.stringify([{ value: 'a', text: 'Viajar y conocer el mundo' }, { value: 'b', text: 'Adquirir un estudio de grabación' }, { value: 'c', text: 'Comprar una casa' }]) },
        { title: '¿Con qué frase te identificas más?', options: JSON.stringify([{ value: 'a', text: 'Recuerdo el aspecto de alguien, pero no su nombre' }, { value: 'b', text: 'Reconozco a las personas por su voz' }, { value: 'c', text: 'No recuerdo el aspecto de la gente' }]) },
        { title: 'Si tuvieras que quedarte en una isla desierta, ¿qué preferirías llevar contigo?', options: JSON.stringify([{ value: 'a', text: 'Algunos buenos libros' }, { value: 'b', text: 'Un radio portátil de alta frecuencia' }, { value: 'c', text: 'Golosinas y comida enlatada' }]) },
        { title: '¿Cuál de los siguientes pasatiempos prefieres?', options: JSON.stringify([{ value: 'a', text: 'Tomar fotografías' }, { value: 'b', text: 'Tocar un instrumento musical' }, { value: 'c', text: 'Actividades manuales' }]) },
        { title: '¿Cómo es tu forma de vestir?', options: JSON.stringify([{ value: 'a', text: 'Formal' }, { value: 'b', text: 'Informal' }, { value: 'c', text: 'Muy informal' }]) },
        { title: '¿Qué es lo que más te gusta de una fogata nocturna?', options: JSON.stringify([{ value: 'a', text: 'Mirar el fuego y las estrellas' }, { value: 'b', text: 'El sonido del fuego quemando la leña' }, { value: 'c', text: 'El calor del fuego y los bombones asados' }]) },
        { title: '¿Cómo se te facilita entender algo?', options: JSON.stringify([{ value: 'a', text: 'Con medios visuales' }, { value: 'b', text: 'Con explicaciones verbales' }, { value: 'c', text: 'Con actividades' }]) },
        { title: '¿Qué te distingue?', options: JSON.stringify([{ value: 'a', text: 'Ser observador' }, { value: 'b', text: 'Ser conversador' }, { value: 'c', text: 'Ser intuitivo' }]) },
        { title: '¿Qué es lo que más disfrutas de un amanecer?', options: JSON.stringify([{ value: 'a', text: 'Las tonalidades del cielo' }, { value: 'b', text: 'El canto de las aves' }, { value: 'c', text: 'La emoción de vivir un nuevo día' }]) },
        { title: 'Si pudieras elegir ¿qué preferirías ser?', options: JSON.stringify([{ value: 'a', text: 'Un gran pintor' }, { value: 'b', text: 'Un gran músico' }, { value: 'c', text: 'Un gran médico' }]) },
        { title: 'Cuando eliges tu ropa, ¿qué es lo más importante para ti?', options: JSON.stringify([{ value: 'a', text: 'Que luzca bien' }, { value: 'b', text: 'Que sea adecuada' }, { value: 'c', text: 'Que sea cómoda' }]) },
        { title: '¿Qué es lo que más disfrutas de una habitación?', options: JSON.stringify([{ value: 'a', text: 'Que esté limpia y ordenada' }, { value: 'b', text: 'Que sea silenciosa' }, { value: 'c', text: 'Que sea confortable' }]) },
        { title: '¿Qué es más sexy para ti?', options: JSON.stringify([{ value: 'a', text: 'Una iluminación tenue' }, { value: 'b', text: 'Cierto tipo de música' }, { value: 'c', text: 'El perfume' }]) },
        { title: '¿Qué tipo de espectáculo preferirías asistir?', options: JSON.stringify([{ value: 'a', text: 'Un espectáculo de magia' }, { value: 'b', text: 'Un concierto de música' }, { value: 'c', text: 'Una muestra gastronómica' }]) },
        { title: '¿Qué te atrae más de una persona?', options: JSON.stringify([{ value: 'a', text: 'Su aspecto físico' }, { value: 'b', text: 'Su conversación' }, { value: 'c', text: 'Su trato y forma de ser' }]) },
        { title: 'Cuando vas de compras, ¿en dónde pasas mucho tiempo?', options: JSON.stringify([{ value: 'a', text: 'En una librería' }, { value: 'b', text: 'En una tienda de música' }, { value: 'c', text: 'En una tienda de deportes' }]) },
        { title: '¿Cuál es tu idea de una noche romántica?', options: JSON.stringify([{ value: 'a', text: 'A la luz de las velas' }, { value: 'b', text: 'Con música romántica' }, { value: 'c', text: 'Bailando tranquilamente' }]) },
        { title: '¿Qué es lo que más disfrutas de viajar?', options: JSON.stringify([{ value: 'a', text: 'Conocer lugares nuevos' }, { value: 'b', text: 'Aprender sobre otras costumbres' }, { value: 'c', text: 'Conocer personas y hacer nuevos amigos' }]) },
        { title: 'Cuando estás en la ciudad, ¿qué es lo que más echas de menos del campo?', options: JSON.stringify([{ value: 'a', text: 'Los paisajes' }, { value: 'b', text: 'La tranquilidad' }, { value: 'c', text: 'El aire limpio y refrescante' }]) },
        { title: 'Si te ofrecieran uno de los siguientes empleos, ¿cuál elegirías?', options: JSON.stringify([{ value: 'a', text: 'Director de una revista' }, { value: 'b', text: 'Director de una estación de radio' }, { value: 'c', text: 'Director de un club deportivo' }]) }
      ];

      const preguntasConEncuestaEstilos = preguntasEstilos.map((p) => ({
        ...p,
        id_encuesta: id_encuesta_estilos,
        type: 'multiple',
        required: true,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('preguntas', preguntasConEncuestaEstilos);

      console.log(`✅ Encuesta de Estilos de Aprendizaje creada con ${preguntasEstilos.length} preguntas`);

      // ==========================================
      // 2️⃣ ENCUESTA DE DATOS DEL ESTUDIANTE
      // ==========================================
      const encuestaDatos = await queryInterface.sequelize.query(
        `INSERT INTO encuestas (titulo, id_usuario, descripcion, tipo, fecha_creacion, updated_at, created_at) 
         VALUES (:titulo, :id_usuario, :descripcion, :tipo, :fecha, :fecha, :fecha)`,
        {
          replacements: {
            titulo: 'Datos del Estudiante',
            id_usuario: 'sistema',
            descripcion: 'Formulario de registro con información personal, académica y socioeconómica del estudiante',
            tipo: 'documento',
            fecha: new Date()
          }
        }
      );

      const [resultDatos] = await queryInterface.sequelize.query(
        `SELECT LAST_INSERT_ID() as id`
      );
      const id_encuesta_datos = resultDatos[0].id;

      const preguntasDatos = [
        { title: 'Nombre completo', type: 'text', required: true, options: null },
        { title: 'Edad actual', type: 'text', required: true, options: null },
        { title: 'Matrícula', type: 'text', required: true, options: null },
        { title: 'Programa Académico', type: 'text', required: true, options: null },
        { title: 'Número de Seguridad Social (IMSS)', type: 'text', required: false, options: null },
        { title: 'Género', type: 'select', required: true, options: JSON.stringify([{ value: 'M', text: 'Masculino' }, { value: 'F', text: 'Femenino' }, { value: 'Otro', text: 'Otro' }]) },
        { title: 'Fecha de Nacimiento', type: 'text', required: false, options: null },
        { title: 'Lugar de Nacimiento', type: 'text', required: false, options: null },
        { title: 'Domicilio Actual (Foráneos)', type: 'text', required: false, options: null },
        { title: 'Teléfono de Casa', type: 'text', required: false, options: null },
        { title: 'Celular', type: 'text', required: false, options: null },
        { title: 'Email Personal', type: 'text', required: false, options: null },
        { title: 'Domicilio Familiar', type: 'text', required: false, options: null },
        { title: 'Tutor/Padre de Familia', type: 'text', required: false, options: null },
        { title: 'Email del Tutor/Padre de Familia', type: 'text', required: false, options: null },
        { title: 'Actividad deportiva/cultural que practiques', type: 'text', required: false, options: null },
        { title: 'Religión', type: 'text', required: false, options: null },
        { title: 'Padeces alguna enfermedad', type: 'select', required: false, options: JSON.stringify([{ value: 'Si', text: 'Sí' }, { value: 'No', text: 'No' }]) },
        { title: '¿Cuál es la enfermedad?', type: 'text', required: false, options: null },
        { title: 'Tienes alguna discapacidad', type: 'select', required: false, options: JSON.stringify([{ value: 'Si', text: 'Sí' }, { value: 'No', text: 'No' }]) },
        { title: 'Tipo de discapacidad', type: 'checkbox', required: false, options: JSON.stringify([{ value: 'Visual', text: 'Visual' }, { value: 'Intelectual', text: 'Intelectual' }, { value: 'Auditiva', text: 'Auditiva' }, { value: 'Fisica_Motriz', text: 'Física/Motriz' }]) },
        { title: 'Tipo de Sangre', type: 'text', required: false, options: null },
        { title: 'Alérgico a algún medicamento u otro', type: 'text', required: false, options: null },
        { title: 'Consumes sustancias tóxicas', type: 'select', required: false, options: JSON.stringify([{ value: 'Si', text: 'Sí' }, { value: 'No', text: 'No' }]) },
        { title: 'Tipo de sustancia', type: 'checkbox', required: false, options: JSON.stringify([{ value: 'Alcohol', text: 'Alcohol' }, { value: 'Cigarro', text: 'Cigarro' }, { value: 'Drogas', text: 'Drogas' }]) },
        { title: 'Preparatoria de Origen', type: 'text', required: false, options: null },
        { title: 'Promedio General', type: 'text', required: false, options: null },
        { title: 'Puntuación de Examen CENEVAL', type: 'text', required: false, options: null },
        { title: '¿Actualmente trabajas?', type: 'select', required: false, options: JSON.stringify([{ value: 'Si', text: 'Sí' }, { value: 'No', text: 'No' }]) },
        { title: '¿Dónde trabajas?', type: 'text', required: false, options: null },
        { title: '¿Cuenta con apoyo económico para sus estudios?', type: 'select', required: false, options: JSON.stringify([{ value: 'Si', text: 'Sí' }, { value: 'No', text: 'No' }]) },
        { title: '¿Con quién vives actualmente?', type: 'select', required: false, options: JSON.stringify([{ value: 'Padres', text: 'Padres' }, { value: 'Uno_padres', text: 'Uno de sus padres' }, { value: 'Solo', text: 'Solo' }, { value: 'Amigos', text: 'Amigos' }, { value: 'Pareja', text: 'Pareja' }, { value: 'Otro_familiar', text: 'Otro Familiar' }, { value: 'Otros', text: 'Otros' }]) },
        { title: 'Especificar otros (si aplica)', type: 'text', required: false, options: null }
      ];

      const preguntasConEncuestaDatos = preguntasDatos.map((p) => ({
        ...p,
        id_encuesta: id_encuesta_datos,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('preguntas', preguntasConEncuestaDatos);

      console.log(`✅ Encuesta de Datos del Estudiante creada con ${preguntasDatos.length} preguntas`);
      console.log(`✅ Total de encuestas creadas: 2`);
      console.log(`✅ Total de preguntas creadas: ${preguntasEstilos.length + preguntasDatos.length}`);

    } catch (error) {
      console.error('❌ Error en el seeder:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DELETE FROM encuestas WHERE titulo IN ('Test de Estilos de Aprendizaje', 'Datos del Estudiante')`
    );
    console.log('✅ Encuestas eliminadas');
  }
};
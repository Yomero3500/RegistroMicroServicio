'use strict';

const csv = require('csv-parser');
const { Readable } = require('stream');

class CreateBulkInscripcionUseCase {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    _parseCsv(csvContent) {
        return new Promise((resolve, reject) => {
            const results = [];
            const readableStream = Readable.from(csvContent);

            readableStream
                .pipe(csv({
                    mapHeaders: ({ header }) => header.trim().toLowerCase(),
                    mapValues: ({ value }) => value.trim()
                }))
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (error) => reject(error));
        });
    }

    async execute(tutor_id, grupo_id, csvContent) {
        let transaction;
        
        try {
            const { Estudiante, Inscripcion, Grupo } = this.sequelize.models;

            // Validar parámetros
            if (!tutor_id || !grupo_id || !csvContent) {
                throw new Error('Todos los parámetros son requeridos: tutor_id, grupo_id, csvContent');
            }

            // Validar formato UUID del tutor_id
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(tutor_id)) {
                throw new Error('El tutor_id debe ser un UUID válido');
            }

            // Iniciar transacción
            transaction = await this.sequelize.transaction();

            // Verificar que el grupo existe
            const grupo = await Grupo.findByPk(grupo_id, { transaction });
            if (!grupo) {
                throw new Error('El grupo especificado no existe');
            }

            // Parsear el CSV
            const estudiantes = await this._parseCsv(csvContent);

            // Validar estructura del CSV
            if (estudiantes.length === 0) {
                throw new Error('El archivo CSV está vacío');
            }

            console.log('Procesando CSV con', estudiantes.length, 'estudiantes');

            // Verificar que cada registro tiene los campos requeridos
            for (const est of estudiantes) {
                if (!est.matricula || !est.nombre) {
                    throw new Error('El CSV debe contener las columnas: matricula, nombre');
                }
            }

            const inscripciones = [];
            const errores = [];

            // Procesar cada estudiante
            for (const estudianteData of estudiantes) {
                try {
                    console.log('Procesando estudiante:', estudianteData);

                    // Validar datos del estudiante
                    if (!estudianteData.matricula.match(/^[0-9]{6}$/)) {
                        throw new Error('Formato de matrícula inválido. Debe ser de 6 dígitos');
                    }

                    // Buscar el estudiante por matrícula
                    const estudiante = await Estudiante.findOne({
                        where: { matricula: estudianteData.matricula },
                        transaction
                    });

                    if (!estudiante) {
                        throw new Error(`No se encontró el estudiante con la matrícula ${estudianteData.matricula}`);
                    }

                    console.log('Estudiante encontrado:', estudiante.matricula);

                    // Verificar si ya existe una inscripción para este estudiante en este grupo
                    const inscripcionExistente = await Inscripcion.findOne({
                        where: {
                            estudiante_id: estudiante.matricula,
                            grupo_id: grupo_id
                        },
                        transaction
                    });

                    if (inscripcionExistente) {
                        throw new Error(`El estudiante con matrícula ${estudianteData.matricula} ya está inscrito en este grupo`);
                    }

                    // Crear la inscripción usando la matrícula del estudiante
                    const inscripcion = await Inscripcion.create({
                        estudiante_id: estudiante.matricula,
                        grupo_id: grupo_id,
                        tutor_usuario_id: tutor_id,
                        estado: 'Inscrito'
                    }, { transaction });

                    console.log('Inscripción creada:', inscripcion.id);

                    inscripciones.push({
                        matricula: estudianteData.matricula,
                        nombre: estudiante.nombre,
                        inscripcion_id: inscripcion.id,
                        status: 'success'
                    });
                } catch (error) {
                    console.error('Error procesando estudiante:', estudianteData.matricula, error);
                    errores.push({
                        matricula: estudianteData.matricula,
                        error: error.message
                    });
                }
            }

            // Solo hacer commit si hay al menos una inscripción exitosa
            if (inscripciones.length > 0) {
                console.log('Haciendo commit de la transacción...');
                await transaction.commit();
            } else {
                console.log('No hay inscripciones exitosas, haciendo rollback...');
                await transaction.rollback();
                throw new Error('No se pudo procesar ninguna inscripción correctamente');
            }

            return {
                success: true,
                message: `${inscripciones.length} inscripciones procesadas, ${errores.length} errores`,
                data: {
                    inscripciones,
                    errores
                }
            };

        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }
}

module.exports = CreateBulkInscripcionUseCase;

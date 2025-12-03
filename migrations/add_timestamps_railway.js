/**
 * Script para agregar columnas timestamp a todas las tablas en Railway
 * Ejecutar: node migrations/add_timestamps_railway.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.railway') });
const mysql = require('mysql2/promise');

const TABLES = [
  'record_student',
  'encuestas',
  'preguntas',
  'respuestas',
  'participaciones',
  'estudiantes',
  'inscripciones',
  'grupos',
  'cohortes',
  'asignaturas',
  'token_encuesta',
  'estrategia_cohorte'
];

async function addTimestampColumns() {
  let connection;
  
  try {
    console.log('🔌 Conectando a la base de datos Railway...\n');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conectado a la base de datos\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const tableName of TABLES) {
      try {
        console.log(`📊 Procesando tabla: ${tableName}`);
        
        // Verificar si la tabla existe
        const [tableExists] = await connection.query(
          `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = ? AND table_name = ?`,
          [process.env.DB_NAME, tableName]
        );

        if (tableExists[0].count === 0) {
          console.log(`   ⏭️  Tabla ${tableName} no existe, saltando...\n`);
          continue;
        }

        // Verificar si las columnas ya existen
        const [columns] = await connection.query(
          `SELECT COLUMN_NAME FROM information_schema.columns 
           WHERE table_schema = ? AND table_name = ? 
           AND COLUMN_NAME IN ('created_at', 'updated_at')`,
          [process.env.DB_NAME, tableName]
        );

        const hasCreatedAt = columns.some(col => col.COLUMN_NAME === 'created_at');
        const hasUpdatedAt = columns.some(col => col.COLUMN_NAME === 'updated_at');

        if (hasCreatedAt && hasUpdatedAt) {
          console.log(`   ✅ ${tableName} ya tiene ambas columnas\n`);
          continue;
        }

        // Agregar columnas faltantes
        if (!hasCreatedAt || !hasUpdatedAt) {
          console.log(`   ➕ Agregando columnas faltantes a ${tableName}...`);
          
          if (!hasCreatedAt) {
            await connection.query(
              `ALTER TABLE ${tableName} 
               ADD COLUMN created_at DATETIME NULL DEFAULT NULL`
            );
            console.log(`      ✓ Columna created_at agregada`);
          }
          
          if (!hasUpdatedAt) {
            await connection.query(
              `ALTER TABLE ${tableName} 
               ADD COLUMN updated_at DATETIME NULL DEFAULT NULL`
            );
            console.log(`      ✓ Columna updated_at agregada`);
          }

          // Inicializar valores para registros existentes
          console.log(`   🔄 Inicializando valores en ${tableName}...`);
          
          // Para encuestas, usar fecha_creacion si existe
          if (tableName === 'encuestas') {
            await connection.query(
              `UPDATE ${tableName} 
               SET created_at = COALESCE(fecha_creacion, CURRENT_TIMESTAMP),
                   updated_at = CURRENT_TIMESTAMP 
               WHERE created_at IS NULL OR updated_at IS NULL`
            );
          } else {
            await connection.query(
              `UPDATE ${tableName} 
               SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
                   updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP) 
               WHERE created_at IS NULL OR updated_at IS NULL`
            );
          }

          console.log(`   ✅ Columnas agregadas a ${tableName}\n`);
        }

      } catch (tableError) {
        console.error(`   ❌ Error procesando tabla ${tableName}:`, tableError.message);
        console.log(''); // Línea en blanco
      }
    }

    // Verificación final
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 VERIFICACIÓN FINAL:\n');
    
    const [verification] = await connection.query(
      `SELECT 
         table_name as tabla,
         GROUP_CONCAT(column_name ORDER BY column_name) as columnas_timestamp
       FROM information_schema.columns
       WHERE table_schema = ?
         AND column_name IN ('created_at', 'updated_at')
       GROUP BY table_name
       ORDER BY table_name`
      , [process.env.DB_NAME]
    );

    verification.forEach(row => {
      const hasAll = row.columnas_timestamp.includes('created_at') && 
                     row.columnas_timestamp.includes('updated_at');
      const icon = hasAll ? '✅' : '⚠️';
      console.log(`${icon} ${row.tabla}: ${row.columnas_timestamp}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Proceso completado exitosamente');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar
addTimestampColumns();

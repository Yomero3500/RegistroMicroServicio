const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.railway') });
const mysql = require('mysql2/promise');

const TABLES = [
  'encuestas',
  'preguntas',
  'respuestas',
  'participaciones',
  'record_student',
  'estudiantes',
  'inscripciones',
  'grupos',
  'cohortes',
  'asignaturas',
  'tokens_encuesta',
  'estrategias_cohorte'
];

async function cleanupColumns() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conectado a Railway\n');
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

        // Verificar qué columnas timestamp tiene
        const [columns] = await connection.query(
          `SELECT COLUMN_NAME, IS_NULLABLE 
           FROM information_schema.columns 
           WHERE table_schema = ? AND table_name = ? 
           AND (COLUMN_NAME = 'createdAt' OR COLUMN_NAME = 'updatedAt' 
                OR COLUMN_NAME = 'created_at' OR COLUMN_NAME = 'updated_at')
           ORDER BY COLUMN_NAME`,
          [process.env.DB_NAME, tableName]
        );

        const hasCreatedAt = columns.some(col => col.COLUMN_NAME === 'createdAt');
        const hasUpdatedAt = columns.some(col => col.COLUMN_NAME === 'updatedAt');
        const hasCreated_at = columns.some(col => col.COLUMN_NAME === 'created_at');
        const hasUpdated_at = columns.some(col => col.COLUMN_NAME === 'updated_at');

        console.log(`   Columnas encontradas: createdAt=${hasCreatedAt}, updatedAt=${hasUpdatedAt}, created_at=${hasCreated_at}, updated_at=${hasUpdated_at}`);

        // Si tiene ambas (camelCase y snake_case), eliminar camelCase
        if (hasCreatedAt && hasCreated_at) {
          console.log(`   🗑️  Eliminando columna duplicada 'createdAt'...`);
          await connection.query(`ALTER TABLE ${tableName} DROP COLUMN createdAt`);
        }

        if (hasUpdatedAt && hasUpdated_at) {
          console.log(`   🗑️  Eliminando columna duplicada 'updatedAt'...`);
          await connection.query(`ALTER TABLE ${tableName} DROP COLUMN updatedAt`);
        }

        // Si solo tiene camelCase, renombrarlas a snake_case
        if (hasCreatedAt && !hasCreated_at) {
          console.log(`   🔄 Renombrando 'createdAt' a 'created_at'...`);
          await connection.query(`ALTER TABLE ${tableName} CHANGE createdAt created_at DATETIME NULL DEFAULT NULL`);
        }

        if (hasUpdatedAt && !hasUpdated_at) {
          console.log(`   🔄 Renombrando 'updatedAt' a 'updated_at'...`);
          await connection.query(`ALTER TABLE ${tableName} CHANGE updatedAt updated_at DATETIME NULL DEFAULT NULL`);
        }

        console.log(`   ✅ Tabla ${tableName} procesada\n`);

      } catch (tableError) {
        console.error(`   ❌ Error procesando tabla ${tableName}:`, tableError.message);
        console.log('');
      }
    }

    // Verificación final
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 VERIFICACIÓN FINAL:\n');
    
    for (const tableName of TABLES) {
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME 
         FROM information_schema.columns 
         WHERE table_schema = ? AND table_name = ? 
         AND (COLUMN_NAME LIKE '%createdAt%' OR COLUMN_NAME LIKE '%updatedAt%' 
              OR COLUMN_NAME LIKE '%created_at%' OR COLUMN_NAME LIKE '%updated_at%')
         ORDER BY COLUMN_NAME`,
        [process.env.DB_NAME, tableName]
      );

      if (columns.length > 0) {
        const columnNames = columns.map(c => c.COLUMN_NAME).join(', ');
        const hasCamelCase = columnNames.includes('createdAt') || columnNames.includes('updatedAt');
        const icon = hasCamelCase ? '⚠️' : '✅';
        console.log(`${icon} ${tableName}: ${columnNames}`);
      }
    }

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

cleanupColumns();

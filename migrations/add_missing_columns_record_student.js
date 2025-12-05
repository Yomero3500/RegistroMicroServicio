require('dotenv').config({ path: '.env.railway' });
const mysql = require('mysql2/promise');

async function addMissingColumns() {
  let connection;

  try {
    // Crear conexión
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conectado a Railway\n');

    // Columnas que faltan según el modelo
    const missingColumns = [
      {
        name: 'carrera',
        definition: 'VARCHAR(100) NOT NULL AFTER nombre'
      },
      {
        name: 'estatus_alumno',
        definition: "ENUM('Inscrito','Inactivo', 'Egresado', 'Baja Temporal', 'Baja Definitiva', 'Baja Académica') NOT NULL DEFAULT 'Inscrito' AFTER carrera"
      },
      {
        name: 'cuatrimestre_actual',
        definition: 'VARCHAR(10) NOT NULL AFTER estatus_alumno'
      },
      {
        name: 'grupo_actual',
        definition: 'VARCHAR(10) NULL AFTER cuatrimestre_actual'
      },
      {
        name: 'final',
        definition: 'INT NULL DEFAULT 0 AFTER estatus_materia'
      },
      {
        name: 'extra',
        definition: "VARCHAR(255) NULL DEFAULT 'N/A' AFTER final"
      },
      {
        name: 'estatus_cardex',
        definition: "VARCHAR(50) NULL DEFAULT 'Vigente' AFTER extra"
      },
      {
        name: 'periodo_cursado',
        definition: 'VARCHAR(50) NULL AFTER estatus_cardex'
      },
      {
        name: 'plan_estudios_clave',
        definition: 'VARCHAR(50) NULL AFTER periodo_cursado'
      },
      {
        name: 'creditos',
        definition: 'INT NULL AFTER plan_estudios_clave'
      },
      {
        name: 'tutor_academico',
        definition: 'VARCHAR(255) NULL AFTER creditos'
      },
      {
        name: 'created_at',
        definition: 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER tutor_academico'
      },
      {
        name: 'updated_at',
        definition: 'TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at'
      }
    ];

    // Verificar qué columnas ya existen
    const [existingColumns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'record_student'`,
      [process.env.DB_NAME]
    );

    const existingColumnNames = existingColumns.map(row => row.COLUMN_NAME);
    console.log('📋 Columnas existentes:', existingColumnNames, '\n');

    // Agregar columnas faltantes
    for (const column of missingColumns) {
      if (!existingColumnNames.includes(column.name)) {
        console.log(`➕ Agregando columna: ${column.name}`);
        const sql = `ALTER TABLE record_student ADD COLUMN ${column.name} ${column.definition}`;
        console.log(`   SQL: ${sql}`);
        
        try {
          await connection.execute(sql);
          console.log(`   ✅ Columna ${column.name} agregada correctamente\n`);
        } catch (error) {
          console.error(`   ❌ Error al agregar ${column.name}:`, error.message, '\n');
        }
      } else {
        console.log(`⏭️  Columna ${column.name} ya existe\n`);
      }
    }

    // Verificar columnas después de las modificaciones
    console.log('\n📊 Verificando columnas finales...\n');
    const [finalColumns] = await connection.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'record_student'
       ORDER BY ORDINAL_POSITION`,
      [process.env.DB_NAME]
    );

    console.log('Columnas en record_student:\n');
    finalColumns.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE}) - Nullable: ${col.IS_NULLABLE}, Default: ${col.COLUMN_DEFAULT || 'NULL'}`);
    });

    console.log('\n✅ Migración completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

addMissingColumns();

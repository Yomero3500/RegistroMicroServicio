require('dotenv').config({ path: '.env.railway' });
const mysql = require('mysql2/promise');

/**
 * Script opcional para agregar columna 'cohorte' a la tabla record_student
 * Esta columna mejorará el análisis de predicción de riesgo por generación
 */

async function addCohorteColumn() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Conectado a Railway\n');

    // Verificar si la columna ya existe
    console.log('🔍 Verificando si la columna "cohorte" ya existe...');
    const [existingColumns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'record_student' AND COLUMN_NAME = 'cohorte'`,
      [process.env.DB_NAME]
    );

    if (existingColumns.length > 0) {
      console.log('⏭️  La columna "cohorte" ya existe en la tabla record_student');
      console.log('No es necesario ejecutar este script.\n');
      return;
    }

    // Agregar columna cohorte
    console.log('➕ Agregando columna "cohorte" a la tabla record_student...');
    const sql = `ALTER TABLE record_student 
                 ADD COLUMN cohorte VARCHAR(20) NULL 
                 COMMENT 'Cohorte o generación del estudiante (ej: 2024-1, 2024-2)' 
                 AFTER carrera`;
    
    console.log(`   SQL: ${sql}`);
    await connection.execute(sql);
    console.log('   ✅ Columna "cohorte" agregada correctamente\n');

    // Intentar llenar algunos valores basados en cuatrimestre_actual
    console.log('📊 Intentando asignar cohortes basadas en cuatrimestre actual...');
    
    // Lógica simple: asumir que estudiantes en cuatrimestre similar son de la misma generación
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentPeriod = currentMonth >= 9 ? 2 : 1; // Sep-Dic = periodo 2, Ene-Ago = periodo 1
    
    // Actualizar estudiantes por cuatrimestre
    const updates = [
      // Estudiantes en cuatrimestre 1 (ingresaron este periodo)
      { cuatrimestre: 1, cohorte: `${currentYear}-${currentPeriod}` },
      // Estudiantes en cuatrimestre 2 (ingresaron periodo anterior)
      { cuatrimestre: 2, cohorte: currentPeriod === 1 ? `${currentYear-1}-2` : `${currentYear}-1` },
      // Estudiantes en cuatrimestre 3
      { cuatrimestre: 3, cohorte: currentPeriod === 1 ? `${currentYear-1}-1` : `${currentYear-1}-2` },
    ];

    for (const update of updates) {
      const updateSql = `UPDATE record_student 
                         SET cohorte = ? 
                         WHERE cuatrimestre_actual = ? AND cohorte IS NULL`;
      
      const [result] = await connection.execute(updateSql, [update.cohorte, update.cuatrimestre]);
      console.log(`   ✓ Asignada cohorte "${update.cohorte}" a ${result.affectedRows} estudiantes en cuatrimestre ${update.cuatrimestre}`);
    }

    // Asignar cohorte genérica a estudiantes sin cuatrimestre
    const [genericResult] = await connection.execute(
      `UPDATE record_student 
       SET cohorte = 'SIN-COHORTE' 
       WHERE cohorte IS NULL`
    );
    
    if (genericResult.affectedRows > 0) {
      console.log(`   ⚠️  Asignada cohorte "SIN-COHORTE" a ${genericResult.affectedRows} estudiantes sin cuatrimestre definido`);
    }

    console.log('\n✅ Columna cohorte agregada y valores asignados correctamente');
    
    // Mostrar estadísticas
    console.log('\n📊 Estadísticas de cohortes:');
    const [stats] = await connection.execute(
      `SELECT cohorte, COUNT(*) as total 
       FROM record_student 
       WHERE cohorte IS NOT NULL 
       GROUP BY cohorte 
       ORDER BY cohorte DESC`
    );

    console.log('\nDistribución por cohorte:');
    stats.forEach(stat => {
      console.log(`   ${stat.cohorte}: ${stat.total} estudiantes`);
    });

    console.log('\n💡 NOTA: Puedes actualizar manualmente las cohortes con:');
    console.log('   UPDATE record_student SET cohorte = "2024-1" WHERE matricula = "202401001";');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\nSi el error es de conexión, verifica que .env.railway tenga las credenciales correctas.');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar script
addCohorteColumn();

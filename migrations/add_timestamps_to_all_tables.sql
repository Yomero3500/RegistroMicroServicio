-- ========================================
-- MIGRACION: Agregar columnas timestamp a todas las tablas
-- Fecha: 2025-12-03
-- Descripcion: Agrega created_at y updated_at a tablas que no las tienen
-- ========================================

-- Tabla: record_student
ALTER TABLE record_student 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

-- Inicializar valores existentes con fecha actual
UPDATE record_student 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: encuestas
ALTER TABLE encuestas 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE encuestas 
SET created_at = COALESCE(fecha_creacion, CURRENT_TIMESTAMP), 
    updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: preguntas
ALTER TABLE preguntas 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE preguntas 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: respuestas
ALTER TABLE respuestas 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE respuestas 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: participaciones
ALTER TABLE participaciones 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE participaciones 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: estudiantes (si no tiene las columnas)
ALTER TABLE estudiantes 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE estudiantes 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: inscripciones
ALTER TABLE inscripciones 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE inscripciones 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: grupos
ALTER TABLE grupos 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE grupos 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: cohortes
ALTER TABLE cohortes 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE cohortes 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: asignaturas
ALTER TABLE asignaturas 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE asignaturas 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: token_encuesta (si existe)
ALTER TABLE token_encuesta 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE token_encuesta 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Tabla: estrategia_cohorte (si existe)
ALTER TABLE estrategia_cohorte 
ADD COLUMN IF NOT EXISTS created_at DATETIME NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL DEFAULT NULL;

UPDATE estrategia_cohorte 
SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- ========================================
-- VERIFICACION: Mostrar tablas y sus columnas timestamp
-- ========================================
SELECT 
    TABLE_NAME,
    GROUP_CONCAT(COLUMN_NAME) as timestamp_columns
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND COLUMN_NAME IN ('created_at', 'updated_at')
GROUP BY TABLE_NAME
ORDER BY TABLE_NAME;

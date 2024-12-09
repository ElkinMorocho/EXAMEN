import pool from './db.js';

// Obtener todos los estudiantes
export const getEstudiantes = async() => {
    const result = await pool.query(`
        SELECT id, cedula, nombre, apellido, sexo, 
               TO_CHAR(fecha_nacimiento, 'YYYY-MM-DD') AS fecha_nacimiento, 
               sancionado, sancion_activa_hasta
        FROM estudiantes
        ORDER BY sancionado DESC, id;
    `);
    return result.rows;
};

// Agregar un nuevo estudiante
export const addEstudiante = async(estudiante) => {
    const { cedula, nombre, apellido, sexo, fecha_nacimiento, sancionado, sancion_activa_hasta } = estudiante;
    await pool.query(`
        INSERT INTO estudiantes (cedula, nombre, apellido, sexo, fecha_nacimiento, sancionado, sancion_activa_hasta)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [cedula, nombre, apellido, sexo, fecha_nacimiento, sancionado, sancion_activa_hasta]);
};

// Actualizar un estudiante
export const updateEstudiante = async(id, estudiante) => {
    const { nombre, apellido, sexo, fecha_nacimiento, sancionado, sancion_activa_hasta } = estudiante;
    await pool.query(`
        UPDATE estudiantes 
        SET nombre = $1, apellido = $2, sexo = $3, fecha_nacimiento = $4, sancionado = $5, sancion_activa_hasta = $6
        WHERE id = $7
    `, [nombre, apellido, sexo, fecha_nacimiento, sancionado, sancion_activa_hasta, id]);
};

// Eliminar un estudiante
export const deleteEstudiante = async(id) => {
    await pool.query('DELETE FROM estudiantes WHERE id = $1', [id]);
};
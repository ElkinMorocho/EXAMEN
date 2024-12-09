import pool from './db.js';

// Función para obtener todos los préstamos
export const getPrestamos = async() => {
    try {
        const result = await pool.query('SELECT * FROM prestamos');
        return result.rows;
    } catch (err) {
        console.error("Error al obtener préstamos:", err.message);
        throw new Error('Error al obtener préstamos');
    }
};

// Verificar si el libro está disponible
export const verificarDisponibilidadLibro = async(libro_id) => {
    const result = await pool.query(`
        SELECT COUNT(*) AS prestamos_activos
        FROM prestamos
        WHERE libro_id = $1 AND devuelto = false
    `, [libro_id]);
    return result.rows[0].prestamos_activos === '0';
};

// Verificar si el estudiante está sancionado
export const verificarEstudianteSancionado = async(estudiante_id) => {
    const result = await pool.query(`
        SELECT sancionado, sancion_activa_hasta
        FROM estudiantes
        WHERE id = $1
    `, [estudiante_id]);

    // Verificar si el estudiante existe
    if (result.rows.length === 0) {
        throw new Error(`Estudiante con ID ${estudiante_id} no encontrado.`);
    }

    const estudiante = result.rows[0];
    if (estudiante.sancionado) {
        const fechaActual = new Date();
        if (estudiante.sancion_activa_hasta && new Date(estudiante.sancion_activa_hasta) > fechaActual) {
            return true;
        }
    }
    return false;
};

// Agregar un préstamo con validación del código de libro
export const addPrestamo = async(prestamo) => {
    const { estudiante_id, codigo_libro, fecha_prestamo, fecha_entrega } = prestamo;
    const libroResult = await pool.query(
        `SELECT id FROM libros WHERE codigo = $1`, [codigo_libro]
    );
    if (libroResult.rows.length === 0) {
        throw new Error(`No se encontró un libro con el código ${codigo_libro}`);
    }
    const libro_id = libroResult.rows[0].id;

    // Verificar disponibilidad del libro
    const libroDisponible = await verificarDisponibilidadLibro(libro_id);
    if (!libroDisponible) {
        throw new Error('El libro ya ha sido prestado o no está disponible');
    }

    // Verificar si el estudiante está sancionado
    const estudianteSancionado = await verificarEstudianteSancionado(estudiante_id);
    if (estudianteSancionado) {
        throw new Error('El estudiante está sancionado y no puede realizar el préstamo');
    }

    // Insertar el préstamo en la base de datos
    await pool.query(
        `INSERT INTO prestamos (estudiante_id, libro_id, fecha_prestamo, fecha_entrega)
        VALUES ($1, $2, $3, $4)`, [estudiante_id, libro_id, fecha_prestamo, fecha_entrega]
    );
};
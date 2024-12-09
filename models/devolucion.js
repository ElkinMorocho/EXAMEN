import pool from './db.js';


// Función para registrar la devolución de un libro
export const registrarDevolucion = async(prestamo_id, fecha_devolucion) => {
    try {
        await pool.query(
            `INSERT INTO devoluciones (prestamo_id, fecha_devolucion) VALUES ($1, $2)`, [prestamo_id, fecha_devolucion]
        );

        // Consultar la fecha de entrega del préstamo y el id del estudiante
        const result = await pool.query(
            `SELECT fecha_entrega, estudiante_id 
             FROM prestamos 
             WHERE id = $1`, [prestamo_id]
        );

        if (result.rows.length === 0) {
            throw new Error(`No se encontró un préstamo con ID ${prestamo_id}`);
        }

        const { fecha_entrega, estudiante_id } = result.rows[0];
        const fechaLimite = new Date(fecha_entrega);
        const fechaDevolucionDate = new Date(fecha_devolucion);

        if (fechaDevolucionDate > fechaLimite) {
            const sancionActivaHasta = new Date(fechaDevolucionDate);
            sancionActivaHasta.setDate(sancionActivaHasta.getDate() + 15);
            await pool.query(
                `UPDATE estudiantes 
                 SET sancionado = true, sancion_activa_hasta = $1 
                 WHERE id = $2`, [sancionActivaHasta, estudiante_id]
            );
        }
    } catch (err) {
        console.error("Error al registrar devolución:", err.message);
        throw new Error("Error al registrar devolución");
    }
};
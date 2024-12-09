import express from 'express';
import pool from '../models/db.js';
import { registrarDevolucion } from '../models/devolucion.js';

const router = express.Router();
// Obtener todas las devoluciones
router.get('/', async(req, res) => {
    try {
        const result = await pool.query(`
            SELECT devoluciones.prestamo_id, 
                   TO_CHAR(devoluciones.fecha_devolucion, 'YYYY-MM-DD') AS fecha_devolucion
            FROM devoluciones
            ORDER BY devoluciones.fecha_devolucion DESC;
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener devoluciones:', error.message);
        res.status(500).json({ error: 'Error al obtener devoluciones.' });
    }
});

// Ruta para registrar la devolución de un libro
router.post('/', async(req, res) => {
    try {
        const { prestamo_id, fecha_devolucion } = req.body;
        if (!prestamo_id || !fecha_devolucion) {
            return res.status(400).json({ error: "Faltan datos necesarios (prestamo_id, fecha_devolucion)" });
        }

        await registrarDevolucion(prestamo_id, fecha_devolucion);

        res.status(201).json({ message: "Devolución registrada exitosamente." });
    } catch (err) {
        console.error("Error al registrar devolución:", err.message);
        res.status(500).json({ error: err.message });
    }
});

router.patch('/prestamos/:id', async(req, res) => {
    const { id } = req.params;
    const { devuelto } = req.body;

    try {
        const query = 'UPDATE prestamos SET devuelto = $1 WHERE id = $2';
        const values = [devuelto, id];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Préstamo no encontrado' });
        }

        res.status(200).json({ message: 'Préstamo actualizado exitosamente' });

    } catch (error) {
        console.error('Error al actualizar el préstamo:', error);
        res.status(500).json({ error: 'Error al actualizar el préstamo' });
    }
});


export default router;
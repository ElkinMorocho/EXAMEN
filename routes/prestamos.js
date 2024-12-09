import express from 'express';
import pool from '../models/db.js';
import { getPrestamos, addPrestamo, verificarDisponibilidadLibro, verificarEstudianteSancionado } from '../models/prestamo.js';

const router = express.Router();

// Obtener todos los préstamos con detalles
router.get('/detallado', async(req, res) => {
    try {
        const result = await pool.query(`
          SELECT prestamos.id, 
            estudiantes.cedula AS numero_cedula, 
            libros.codigo AS codigo_libro, 
            prestamos.fecha_prestamo, 
            prestamos.fecha_entrega, 
            prestamos.devuelto 
          FROM prestamos
          JOIN estudiantes ON prestamos.estudiante_id = estudiantes.id
          JOIN libros ON prestamos.libro_id = libros.id`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error al obtener préstamos detallados:", err.message);
        res.status(500).json({ error: "Error al obtener los préstamos detallados." });
    }
});


// Agregar un nuevo préstamo
router.post('/', async(req, res) => {
    try {
        const { estudiante_id, prestamos } = req.body;

        // Verificar si el estudiante está sancionado
        const estudianteSancionado = await verificarEstudianteSancionado(estudiante_id);
        if (estudianteSancionado) {
            return res.status(400).json({ error: 'El estudiante está sancionado y no puede realizar el préstamo' });
        }

        // Procesar cada préstamo
        for (let prestamo of prestamos) {
            await addPrestamo({
                estudiante_id,
                codigo_libro: prestamo.libro_id,
                fecha_prestamo: prestamo.fecha_prestamo,
                fecha_entrega: prestamo.fecha_entrega,
            });
        }

        res.status(201).json({ message: "Préstamos registrados exitosamente." });
    } catch (err) {
        console.error("Error al registrar préstamo:", err.message);
        res.status(500).json({ error: err.message });
    }
});


// Actualizar un préstamo
router.put('/:id', async(req, res) => {
    try {
        await updatePrestamo(req.params.id, req.body);
        res.status(200).json({ message: "Préstamo actualizado exitosamente." });
    } catch (err) {
        console.error("Error al actualizar préstamo:", err.message);
        res.status(500).json({ error: "Error al actualizar préstamo." });
    }
});

export default router;
import express from 'express';
import pool from '../models/db.js';
import { getEstudiantes, addEstudiante, updateEstudiante, deleteEstudiante } from '../models/estudiante.js';

const router = express.Router();

// Obtener todos los estudiantes
router.get('/', async(req, res) => {
    try {
        const estudiantes = await getEstudiantes();
        res.status(200).json(estudiantes);
    } catch (err) {
        console.error("Error al obtener estudiantes:", err.message);
        res.status(500).json({ error: "Error al obtener estudiantes." });
    }
});

router.post('/', async(req, res) => {
    try {
        const { cedula, nombre, apellido, sexo, fecha_nacimiento } = req.body;
        if (!cedula || !nombre || !apellido || !sexo || !fecha_nacimiento) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        console.log('Datos recibidos:', { cedula, nombre, apellido, sexo, fecha_nacimiento });
        const result = await pool.query(
            `INSERT INTO estudiantes (cedula, nombre, apellido, sexo, fecha_nacimiento)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`, [cedula, nombre, apellido, sexo, fecha_nacimiento]
        );
        console.log('Estudiante insertado:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al agregar estudiante:', error.message);
        console.error(error.stack);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});



// Actualizar un estudiante
router.put('/:id', async(req, res) => {
    try {
        await updateEstudiante(req.params.id, req.body);
        res.status(200).json({ message: "Estudiante actualizado exitosamente." });
    } catch (err) {
        console.error("Error al actualizar estudiante:", err.message);
        res.status(500).json({ error: "Error al actualizar estudiante." });
    }
});

// Eliminar un estudiante
router.delete('/:id', async(req, res) => {
    try {
        await deleteEstudiante(req.params.id);
        res.status(200).json({ message: "Estudiante eliminado exitosamente." });
    } catch (err) {
        console.error("Error al eliminar estudiante:", err.message);
        res.status(500).json({ error: "Error al eliminar estudiante." });
    }
});

export default router;
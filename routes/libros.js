import express from 'express';
import pool from '../models/db.js';
const router = express.Router();

// Endpoint para obtener todos los libros
router.get('/', async(req, res) => {
    try {
        const result = await pool.query('SELECT codigo, nombre, autor, editorial, categoria, tipo, anio_publicacion FROM libros');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).json({ error: 'Error al obtener libros' });
    }
});

// Endpoint para obtener un libro por su código
router.get('/:codigo', async(req, res) => {
    const { codigo } = req.params;
    console.log('Código recibido en el servidor:', codigo);

    try {
        const result = await pool.query('SELECT codigo, nombre, autor, editorial, categoria, tipo, anio_publicacion FROM libros WHERE codigo = $1', [codigo]);

        if (result.rowCount === 0) {
            console.log('Libro no encontrado');
            return res.status(404).json({ mensaje: 'Libro no encontrado.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener el libro:', error);
        res.status(500).json({ mensaje: 'Error al obtener el libro' });
    }
});



// Endpoint para agregar un libro
router.post('/', async(req, res) => {
    const { codigo, nombre, autor, editorial, categoria, tipo, anio_publicacion } = req.body;
    if (!codigo || !nombre || !categoria || !tipo || !anio_publicacion) {
        return res.status(400).json({ error: 'Por favor, complete todos los campos obligatorios' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO libros (codigo, nombre, autor, editorial, categoria, tipo, anio_publicacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [codigo, nombre, autor, editorial, categoria, tipo, anio_publicacion]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error al insertar el libro:', error);
        if (error.code === '23505') {
            res.status(400).json({ error: 'El código del libro ya existe' });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
});

// Endpoint para actualizar los datos de un libro
router.put('/:codigo', async(req, res) => {
    const { codigo } = req.params;
    const { nombre, autor, editorial, categoria, tipo, anio_publicacion } = req.body;

    try {
        if (!nombre || !autor || !editorial || !categoria || !tipo || !anio_publicacion) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios: nombre, autor, editorial, categoria, tipo, anio_publicacion.',
            });
        }
        const query = `
        UPDATE Libros
        SET nombre = $1, autor = $2, editorial = $3, categoria = $4, tipo = $5, anio_publicacion = $6
        WHERE codigo = $7
        RETURNING *;
      `;
        const values = [nombre, autor, editorial, categoria, tipo, anio_publicacion, codigo];

        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ mensaje: 'Libro no encontrado.' });
        }

        res.status(200).json({
            mensaje: 'Libro actualizado con éxito.',
            libro: result.rows[0],
        });
    } catch (error) {
        console.error('Error al actualizar el libro:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
    }
});

// Endpoint para eliminar un libro
router.delete('/:codigo', async(req, res) => {
    const { codigo } = req.params;

    try {
        const query = `
            DELETE FROM libros
            WHERE codigo = $1
            RETURNING *;
        `;

        const values = [codigo];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Libro no encontrado.' });
        }

        res.json({ message: 'Libro eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar el libro:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
});

export default router;
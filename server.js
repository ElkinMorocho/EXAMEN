import express from 'express';
import cors from 'cors';
import pool from './models/db.js';
import librosRouter from './routes/libros.js';
import estudiantesRouter from './routes/estudiantes.js';
import prestamosRouter from './routes/prestamos.js';
import devolucionesRouter from './routes/devoluciones.js';

const app = express();

// Verificar la conexión a la base de datos
pool.connect()
    .then(() => console.log('Conexión a la base de datos establecida correctamente'))
    .catch((error) => console.error('Error de conexión a la base de datos:', error.message));

app.use(cors());

app.use(express.json());

// Registrar las rutas
app.use('/libros', librosRouter);
app.use('/estudiantes', estudiantesRouter);
app.use('/prestamos', prestamosRouter);
app.use('/devoluciones', devolucionesRouter);
app.use('/api/devoluciones', devolucionesRouter);


// Definir el puerto en el que el servidor escuchará las solicitudes
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
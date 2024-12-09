async function fetchLibros() {
    const response = await fetch('http://localhost:3000/libros');
    if (!response.ok) throw new Error('Error al cargar libros');
    return response.json();
}
const API_URL = 'http://localhost:3000';

async function cargarTablaPrestamos() {
    try {
        const response = await fetch(`${API_URL}/prestamos/detallado`);
        if (!response.ok) {
            throw new Error('Error al cargar préstamos');
        }
        const prestamos = await response.json();

        const tbody = document.getElementById('tablaPrestamosBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        prestamos.forEach((prestamo: any) => {
            const fechaPrestamo = new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES'); // Formato dd/mm/yyyy
            const fechaEntrega = new Date(prestamo.fecha_entrega).toLocaleDateString('es-ES'); // Formato dd/mm/yyyy
            const devuelto = prestamo.devuelto ? 'Sí' : 'No';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${prestamo.id}</td>
                <td>${prestamo.numero_cedula}</td>
                <td>${prestamo.codigo_libro}</td>
                <td>${fechaPrestamo}</td>
                <td>${fechaEntrega}</td>
                <td>${devuelto}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar la tabla de préstamos:', error);
    }
}


// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarTablaPrestamos);

async function fetchEstudiantes() {
    const response = await fetch('http://localhost:3000/estudiantes');
    if (!response.ok) throw new Error('Error al cargar estudiantes');
    return response.json();
}


async function enviarPrestamos(prestamos: any[]) {
    const response = await fetch('http://localhost:3000/prestamos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prestamos }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al realizar el préstamo');
    }
    return response.json();
}

// Función para cargar libros y estudiantes en el formulario
async function inicializarFormularioPrestamos() {
    await cargarLibrosParaPrestamos();
    await cargarEstudiantesParaPrestamos();
}

async function cargarLibrosParaPrestamos() {
    try {
        const libros = await fetchLibros();
        const response = await fetch(`${API_URL}/prestamos/detallado`);
        if (!response.ok) throw new Error('Error al cargar préstamos');
        const prestamos = await response.json();

        const librosPrestados = new Set(prestamos.filter((p: any) => !p.devuelto).map((p: any) => p.libro_id));

        const selectLibros = document.getElementById('selectLibros') as HTMLSelectElement;
        if (!selectLibros) return;

        selectLibros.innerHTML = '<option value="" disabled>Seleccione uno o más libros</option>';
        libros.forEach((libro: any) => {
            if (!librosPrestados.has(libro.codigo)) {
                const option = document.createElement('option');
                option.value = libro.codigo;
                option.textContent = `(${libro.codigo}) ${libro.nombre}`;
                selectLibros.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error al cargar libros:', error.message);
    }
}


async function cargarEstudiantesParaPrestamos() {
    try {
        const estudiantes = await fetchEstudiantes();
        const selectEstudiantes = document.getElementById('selectEstudiantes') as HTMLSelectElement;
        if (!selectEstudiantes) return;

        selectEstudiantes.innerHTML = '<option value="">Seleccione un estudiante</option>';
        estudiantes.forEach((estudiante: any) => {
            const sancionado = estudiante.sancionado && 
                               estudiante.sancion_activa_hasta && 
                               new Date(estudiante.sancion_activa_hasta) > new Date();

            if (!sancionado) {
                const option = document.createElement('option');
                option.value = estudiante.id;
                option.textContent = `${estudiante.nombre} ${estudiante.apellido}`;
                selectEstudiantes.appendChild(option);
            }
        });
    } catch (error) {
        console.error('Error al cargar estudiantes:', error.message);
    }
}

// Manejo del envío del formulario
document.getElementById('formPrestamo')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const estudianteId = (document.getElementById('selectEstudiantes') as HTMLSelectElement).value;
        const fechaPrestamo = (document.getElementById('fechaPrestamo') as HTMLInputElement).value;
        const fechaEntrega = (document.getElementById('fechaEntrega') as HTMLInputElement).value;
        const selectLibros = document.getElementById('selectLibros') as HTMLSelectElement;
        const librosSeleccionados: string[] = Array.from(selectLibros.selectedOptions).map((option) => option.value);
        if (!estudianteId || librosSeleccionados.length === 0 || !fechaPrestamo || !fechaEntrega) {
            alert('Por favor, complete todos los campos antes de enviar.');
            return;
        }
        const prestamos = librosSeleccionados.map((codigoLibro) => ({
            libro_id: codigoLibro,
            fecha_prestamo: fechaPrestamo,
            fecha_entrega: fechaEntrega,
        }));

        const data = {
            estudiante_id: parseInt(estudianteId, 10),
            prestamos,
        };

        const response = await fetch('http://localhost:3000/prestamos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error desconocido al registrar el préstamo');
        }

        alert('Préstamo(s) registrado(s) exitosamente.');
        inicializarFormularioPrestamos();
    } catch (error) {
        console.error('Error al registrar préstamo:', error.message);
        alert(`Error: ${error.message}`);
    }
});
inicializarFormularioPrestamos();

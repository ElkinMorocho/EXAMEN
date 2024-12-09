// Función para cargar las devoluciones
async function cargarDevoluciones() {
    try {
        const response = await fetch('http://localhost:3000/devoluciones');
        const devoluciones = await response.json();

        const tabla = document.getElementById('tablaDevoluciones') as HTMLTableElement;
        const tbody = tabla.querySelector('tbody');

        if (!tbody) {
            console.error("No se encontró el <tbody> en la tabla de devoluciones.");
            return;
        }
        tbody.innerHTML = '';
        if (devoluciones.length === 0) {
            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');
            celdaVacia.colSpan = 2;
            celdaVacia.textContent = 'No hay devoluciones registradas.';
            filaVacia.appendChild(celdaVacia);
            tbody.appendChild(filaVacia);
        } else {
            devoluciones.forEach((devolucion) => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td class="border border-gray-300 px-4 py-2">${devolucion.prestamo_id}</td>
                    <td class="border border-gray-300 px-4 py-2">${devolucion.fecha_devolucion}</td>
                `;
                tbody.appendChild(fila);
            });
        }
    } catch (error) {
        console.error('Error al cargar las devoluciones:', error);
    }
}
document.addEventListener('DOMContentLoaded', cargarDevoluciones);

// Función para registrar una devolución
async function registrarDevolucion(prestamoId: number, fechaDevolucion: string) {
    try {
        const response = await fetch('http://localhost:3000/devoluciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prestamo_id: prestamoId, fecha_devolucion: fechaDevolucion }),
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('mensajeExito')!.textContent = result.message;
            document.getElementById('mensajeError')!.textContent = '';

            cargarDevoluciones();
            actualizarPrestamo(prestamoId);

        } else {
            document.getElementById('mensajeError')!.textContent = result.error || 'Error al registrar la devolución';
            document.getElementById('mensajeExito')!.textContent = '';
        }
    } catch (error) {
        document.getElementById('mensajeError')!.textContent = error.message;
        document.getElementById('mensajeExito')!.textContent = '';
    }
}

async function actualizarPrestamo(prestamoId: number) {
    try {
        const response = await fetch(`http://localhost:3000/devoluciones/prestamos/${prestamoId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ devuelto: true })
        });        
        if (!response.ok) {
            throw new Error('Error al actualizar el préstamo');
        }

    } catch (error) {
        console.error('Error al actualizar el préstamo:', error);
    }
}


// Manejar el formulario de devolución
document.getElementById('formDevolucion')?.addEventListener('submit', (e) => {
    e.preventDefault();

    const prestamoId = (document.getElementById('prestamoId') as HTMLInputElement).value;
    const fechaDevolucion = (document.getElementById('fechaDevolucion') as HTMLInputElement).value;

    if (!prestamoId || !fechaDevolucion) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    registrarDevolucion(parseInt(prestamoId), fechaDevolucion);
});



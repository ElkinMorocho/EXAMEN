const apiUrl = 'http://localhost:3000/estudiantes';

// Obtener referencias a elementos del DOM
let estudiantesTable: HTMLElement;
let estudianteForm: HTMLFormElement;

// Función para cargar estudiantes
async function cargarEstudiantes() {
    try {
        const response = await fetch(apiUrl);
        const estudiantes = await response.json();

        if (!estudiantesTable) {
            console.error('No se encontró la tabla de estudiantes en el DOM.');
            return;
        }

        estudiantesTable.innerHTML = '';
        estudiantes.forEach((estudiante, index) => {
            const row = document.createElement('tr');

            // Formatear los valores según los requisitos
            const sancionadoTexto = estudiante.sancionado ? 'SÍ' : 'NO';
            const sancionActivaFecha = estudiante.sancion_activa_hasta ? estudiante.sancion_activa_hasta.split('T')[0] : '';

            row.innerHTML = `
                <td class="border-b p-2">${index + 1}</td> <!-- Mostrar índice dinámico -->
                <td class="border-b p-2">${estudiante.cedula}</td>
                <td class="border-b p-2">${estudiante.nombre}</td>
                <td class="border-b p-2">${estudiante.apellido}</td>
                <td class="border-b p-2">${estudiante.sexo}</td>
                <td class="border-b p-2">${estudiante.fecha_nacimiento}</td>
                <td class="border-b p-2">${sancionadoTexto}</td>
                <td class="border-b p-2">${sancionActivaFecha}</td>
                <td class="border-b p-2">
                    <button class="bg-red-500 text-white px-2 py-1 rounded" id="delete-${estudiante.id}">Eliminar</button>
                </td>
            `;
            estudiantesTable.appendChild(row);

            document.getElementById(`delete-${estudiante.id}`)?.addEventListener('click', () => {
                eliminarEstudiante(estudiante.id);
            });
        });
    } catch (error) {
        console.error('Error al cargar los estudiantes:', error);
    }
}

async function agregarEstudiante(event: Event) {
    event.preventDefault();
    const cedula = (document.querySelector('#cedula') as HTMLInputElement)?.value.trim();
    const nombre = (document.querySelector('#nombre') as HTMLInputElement)?.value.trim();
    const apellido = (document.querySelector('#apellido') as HTMLInputElement)?.value.trim();
    const sexo = (document.querySelector('#sexo') as HTMLSelectElement)?.value.trim();
    const fechaNacimiento = (document.querySelector('#fechaNacimiento') as HTMLInputElement)?.value.trim();

    if (!cedula || !nombre || !apellido || !sexo || !fechaNacimiento) {
        alert('Todos los campos son obligatorios');
        return;
    }
    const estudiante = {
        cedula,
        nombre,
        apellido,
        sexo,
        fecha_nacimiento: fechaNacimiento
    };

    console.log('Datos del estudiante:', estudiante); 

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(estudiante),
        });
        if (response.ok) {
            alert('Estudiante agregado correctamente');
            cargarEstudiantes();
        } else {
            const errorData = await response.json();
            console.error('Error del servidor:', errorData); 
            alert(`Error al agregar estudiante: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error al agregar estudiante:', error);
        alert('Error al agregar estudiante');
    }
}

async function eliminarEstudiante(id: number) {
    try {
        await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        cargarEstudiantes();
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        alert('Error al eliminar estudiante');
    }
}

// Inicialización y configuración de eventos
document.addEventListener('DOMContentLoaded', () => {
    estudiantesTable = document.getElementById('estudiantes-table') as HTMLElement;
    estudianteForm = document.getElementById('estudiante-form') as HTMLFormElement;

    if (!estudiantesTable || !estudianteForm) {
        console.error('No se encontraron elementos necesarios en el DOM. Verifica los IDs de los elementos.');
        return;
    }

    cargarEstudiantes();
    estudianteForm.onsubmit = agregarEstudiante;
});

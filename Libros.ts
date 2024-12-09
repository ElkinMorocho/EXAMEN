document.addEventListener('DOMContentLoaded', cargarLibros);

async function cargarLibros() {
    try {
        const response = await fetch('http://localhost:3000/libros');
        if (!response.ok) throw new Error('Error al obtener los libros');

        const libros = await response.json();
        const tablaLibros = document.getElementById('tablaLibros') as HTMLTableSectionElement;

        if (!tablaLibros) {
            console.error('El elemento con ID "tablaLibros" no existe en el DOM.');
            return;
        }

        tablaLibros.innerHTML = '';

        libros.forEach((libro: any) => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', libro.codigo);

            row.innerHTML = `
                <td class="border border-gray-300 px-4 py-2">${libro.codigo}</td>
                <td class="border border-gray-300 px-4 py-2">${libro.nombre}</td>
                <td class="border border-gray-300 px-4 py-2">${libro.autor}</td>
                <td class="border border-gray-300 px-4 py-2">${libro.editorial}</td>
                <td class="border border-gray-300 px-4 py-2">${libro.categoria}</td>
                <td class="border border-gray-300 px-4 py-2">${libro.tipo}</td>
                <td class="border border-gray-300 px-4 py-2">${libro.anio_publicacion}</td>
                <td class="border border-gray-300 px-4 py-2">
                    <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onclick="editarLibro('${libro.codigo}')">Editar</button>
                    <button class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-2" onclick="eliminarLibro('${libro.codigo}')">Eliminar</button>
                </td>
            `;

            tablaLibros.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar los libros:', error);
    }
}

(window as any).editarLibro = editarLibro;
(window as any).eliminarLibro = eliminarLibro;

async function agregarLibro(event: Event) {
    event.preventDefault();

    const codigo = (document.getElementById('codigo') as HTMLInputElement).value;
    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const autor = (document.getElementById('autor') as HTMLInputElement).value;
    const editorial = (document.getElementById('editorial') as HTMLInputElement).value;
    const categoria = (document.getElementById('categoria') as HTMLInputElement).value;
    const tipo = (document.getElementById('tipo') as HTMLInputElement).value;
    const anio_publicacion = parseInt((document.getElementById('anio_publicacion') as HTMLInputElement).value);

    const libro = { codigo, nombre, autor, editorial, categoria, tipo, anio_publicacion };

    try {
        const response = await fetch('http://localhost:3000/libros', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(libro),
        });

        if (!response.ok) throw new Error('Error al guardar el libro');

        alert('Libro guardado exitosamente');

        (document.getElementById('formAgregarLibro') as HTMLFormElement).reset();

        cargarLibros();
    } catch (error) {
        console.error(error);
        alert('Error al guardar el libro');
    }
}

document.getElementById('btnCerrarModal')?.addEventListener('click', () => {
    document.getElementById('modalAgregarLibro')?.classList.add('hidden');
});

document.getElementById('btnCancelar')?.addEventListener('click', () => {
    document.getElementById('modalAgregarLibro')?.classList.add('hidden');
});


async function editarLibro(codigo: string) {
    console.log('Codigo del libro:', codigo);
    try {
        const response = await fetch(`http://localhost:3000/libros/${codigo}`);
        if (!response.ok) throw new Error('Error al obtener los datos del libro');
        
        const libro = await response.json();
        console.log(libro);

        // Rellenar el formulario con los datos
        (document.getElementById('codigoEditar') as HTMLInputElement).value = libro.codigo;
        (document.getElementById('nombreEditar') as HTMLInputElement).value = libro.nombre;
        (document.getElementById('autorEditar') as HTMLInputElement).value = libro.autor;
        (document.getElementById('editorialEditar') as HTMLInputElement).value = libro.editorial;
        (document.getElementById('categoriaEditar') as HTMLInputElement).value = libro.categoria;
        (document.getElementById('tipoEditar') as HTMLInputElement).value = libro.tipo;
        (document.getElementById('anioEditar') as HTMLInputElement).value = libro.anio_publicacion;

        document.getElementById('modalEditarLibro')?.classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar el libro para editar:', error);
    }
}

async function modificarLibro(event: Event) {
    event.preventDefault();

    const codigo = (document.getElementById('codigoEditar') as HTMLInputElement).value;
    const nombre = (document.getElementById('nombreEditar') as HTMLInputElement).value;
    const autor = (document.getElementById('autorEditar') as HTMLInputElement).value;
    const editorial = (document.getElementById('editorialEditar') as HTMLInputElement).value;
    const categoria = (document.getElementById('categoriaEditar') as HTMLInputElement).value;
    const tipo = (document.getElementById('tipoEditar') as HTMLInputElement).value;
    const anio_publicacion = parseInt((document.getElementById('anioEditar') as HTMLInputElement).value);

    const libro = { nombre, autor, editorial, categoria, tipo, anio_publicacion };

    try {
        const response = await fetch(`http://localhost:3000/libros/${codigo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(libro),
        });

        if (!response.ok) throw new Error('Error al modificar el libro');

        alert('Libro modificado exitosamente');

        // Actualizar únicamente la fila del libro modificado
        const fila = document.querySelector(`tr[data-id='${codigo}']`);
        if (fila) {
            fila.innerHTML = `
                <td class="border border-gray-300 px-4 py-2">${codigo}</td>
                <td class="border border-gray-300 px-4 py-2">${nombre}</td>
                <td class="border border-gray-300 px-4 py-2">${autor}</td>
                <td class="border border-gray-300 px-4 py-2">${editorial}</td>
                <td class="border border-gray-300 px-4 py-2">${categoria}</td>
                <td class="border border-gray-300 px-4 py-2">${tipo}</td>
                <td class="border border-gray-300 px-4 py-2">${anio_publicacion}</td>
                <td class="border border-gray-300 px-4 py-2">
                    <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" onclick="editarLibro('${codigo}')">Editar</button>
                    <button class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded ml-2" onclick="eliminarLibro('${codigo}')">Eliminar</button>
                </td>
            `;
        }

        document.getElementById('modalEditarLibro')?.classList.add('hidden');
    } catch (error) {
        console.error('Error al modificar el libro:', error);
        alert('Error al modificar el libro');
    }
}

document.getElementById('btnCerrarModalEditar')?.addEventListener('click', () => {
    document.getElementById('modalEditarLibro')?.classList.add('hidden');
});

document.getElementById('btnCancelarEditar')?.addEventListener('click', () => {
    document.getElementById('modalEditarLibro')?.classList.add('hidden');
});

async function eliminarLibro(codigo: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este libro?')) return;

    try {
        const response = await fetch(`http://localhost:3000/libros/${codigo}`, {
            method: 'DELETE',
        });

        if (!response.ok) throw new Error('Error al eliminar el libro');

        alert('Libro eliminado exitosamente');
        cargarLibros();
    } catch (error) {
        console.error('Error al eliminar el libro:', error);
        alert('Error al eliminar el libro');
    }
}
document.getElementById('formAgregarLibro')?.addEventListener('submit', agregarLibro);
document.getElementById('formEditarLibro')?.addEventListener('submit', modificarLibro);

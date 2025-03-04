const btnAgregar = document.getElementById('btnAgregar');
const messageDiv = document.getElementById('message');

function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message';
    messageDiv.classList.add(type, 'show');
}

function clearMessage() {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
}

function clearForm() {
    document.getElementById('dni').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('fechaNacimiento').value = '';
}

async function checkDniExists(dni) {
    try {
        const response = await fetch(`http://localhost:3000/person/${dni}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.status === 204) {
            return false; // DNI no existe
        }
        return true; // DNI existe
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error al verificar el DNI');
    }
}

async function addPerson(personData) {
    try {
        const response = await fetch('http://localhost:3000/person', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(personData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Persona agregada correctamente', 'success');
            clearForm(); // Limpiamos el formulario después de un envío exitoso
            return true;
        } else {
            showMessage(data.message || 'Error al agregar la persona', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al agregar la persona', 'error');
        return false;
    }
}

btnAgregar.addEventListener('click', async () => {
    clearMessage();

    // Obtener valores
    const dni = document.getElementById('dni').value.trim();
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;

    // Validar campos
    if (!dni || !nombre || !apellido || !fechaNacimiento) {
        showMessage('Todos los campos son obligatorios', 'error');
        return;
    }

    try {
        // Verificar si el DNI ya existe
        const dniExists = await checkDniExists(dni);
        
        if (dniExists) {
            showMessage('Ya existe una persona con ese DNI', 'error');
            return;
        }

        // Agregar la persona
        const personData = {
            dni: parseInt(dni),
            nombre,
            apellido,
            fecha_nacimiento: fechaNacimiento
        };

        await addPerson(personData);

    } catch (error) {
        showMessage(error.message, 'error');
    }
}); 
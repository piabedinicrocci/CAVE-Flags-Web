const initExperimentButton = document.getElementById('initExperiment');
const messageDiv = document.getElementById('message');

// Función para mostrar mensaje
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message';
    messageDiv.classList.add(type, 'show');
}

// Función para limpiar mensaje
function clearMessage() {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
}

async function updateDniInDatabase(dni) {
    try {
        const response = await fetch(`http://localhost:3000/config/dni/${dni}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('DNI actualizado correctamente', 'success');
            return true;
        } else {
            showMessage('Error al actualizar el DNI', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error al actualizar el DNI', 'error');
        return false;
    }
}

initExperimentButton.addEventListener('click', async () => {
    const dniInput = document.getElementById('dni');
    // const repeticionesInput = document.getElementById('repeticiones');

    // Limpiar mensaje previo
    clearMessage();

    // Validar DNI
    if (!dniInput.value.trim()) {
        showMessage('Debe ingresar un DNI.', 'error');
        return;
    }

    // Validar repeticiones
    /*if (!repeticionesInput.value.trim() || parseInt(repeticionesInput.value) < 1) {
        showMessage('Debe ingresar un número válido de repeticiones.', 'error');
        return;
    }*/

    await updateDniInDatabase(parseInt(dniInput.value));

    // Aquí puedes agregar la lógica para iniciar el experimento
    showMessage('Experimento iniciado correctamente.', 'success');
}); 
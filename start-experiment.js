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

initExperimentButton.addEventListener('click', () => {
    const dniInput = document.getElementById('dni');
    const repeticionesInput = document.getElementById('repeticiones');

    // Limpiar mensaje previo
    clearMessage();

    // Validar DNI
    if (!dniInput.value.trim()) {
        showMessage('Debe ingresar un DNI.', 'error');
        return;
    }

    // Validar repeticiones
    if (!repeticionesInput.value.trim() || parseInt(repeticionesInput.value) < 1) {
        showMessage('Debe ingresar un número válido de repeticiones.', 'error');
        return;
    }

    // Aquí puedes agregar la lógica para iniciar el experimento
    showMessage('Experimento iniciado correctamente.', 'success');
}); 
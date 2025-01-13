const flagsContainer = document.getElementById('flagsContainer');
const addFlagButton = document.getElementById('addFlag');
const sendExperimentButton = document.getElementById('sendExperiment');
const messageDiv = document.getElementById('message');

// Función para mostrar mensaje
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message'; // Reset clases
    messageDiv.classList.add(type, 'show');
}

// Función para limpiar mensaje
function clearMessage() {
    messageDiv.textContent = '';
    messageDiv.className = 'message';
}

// Función para crear una nueva fila de bandera
function createFlagRow() {
  const flagRow = document.createElement('div');
  flagRow.className = 'flag-row';

  flagRow.innerHTML = `
    <select class="color form-select">
      <option selected disabled>Seleccionar color</option>
      <option value="azul">Azul</option>
      <option value="rojo">Rojo</option>
    </select>
    <input type="number" class="positionX" placeholder="X" required />
    <input type="number" class="positionZ" placeholder="Z" required />
    <button class="deleteFlag">×</button>
  `;

  flagRow.querySelector('.deleteFlag').addEventListener('click', () => {
    flagRow.remove();
  });

  return flagRow;
}

// Agregar una fila inicial al cargar la página
window.onload = () => {
  const initialFlag = createFlagRow();
  flagsContainer.appendChild(initialFlag);
};

// Agregar nueva bandera al hacer clic en "Agregar bandera"
addFlagButton.addEventListener('click', () => {
  const newFlag = createFlagRow();
  flagsContainer.appendChild(newFlag);
});

// Función para descargar un archivo JSON
function downloadJSON(filename, jsonData) {
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Enviar experimento
sendExperimentButton.addEventListener('click', () => {
  const rows = document.querySelectorAll('.flag-row');
  let isValid = true;

  // Limpiar mensaje previo
  clearMessage();

  // Validar escenario seleccionado
  const scenarioSelect = document.getElementById('scenario');
  if (!scenarioSelect.value || scenarioSelect.value === '') {
    showMessage('Debe seleccionar un escenario.', 'error');
    return;
  }

  // Validar que haya al menos una bandera
  if (rows.length === 0) {
    showMessage('Debe agregar al menos una bandera antes de enviar.', 'error');
    return;
  }

  // Validar que todos los campos estén llenos y que no haya posición X y Z en (0,0)
  rows.forEach((row) => {
    const positionXInput = row.querySelector('.positionX');
    const positionZInput = row.querySelector('.positionZ');
    const positionX = parseFloat(positionXInput.value);
    const positionZ = parseFloat(positionZInput.value);

    // Validación de campos vacíos
    if (!positionXInput.value.trim() || !positionZInput.value.trim()) {
      isValid = false;
      positionXInput.style.borderColor = 'red';
      positionZInput.style.borderColor = 'red';
      showMessage('Los campos de posición X y Z son requeridos.', 'error');
    } else {
      positionXInput.style.borderColor = '';
      positionZInput.style.borderColor = '';
    }

    // Validación de posiciones (0,0)
    if (positionX === 0 && positionZ === 0) {
      isValid = false;
      positionXInput.style.borderColor = 'red';
      positionZInput.style.borderColor = 'red';
      showMessage('Una bandera no puede estar en la posición (0,0).', 'error');
    }
  });

  if (!isValid) {
    return;
  }

  // Generar el JSON si es válido
  const experiment = {
    scenes: [
      {
        id: 0,
        environment: scenarioSelect.value,
        prefabs: [],
        steps: []
      }
    ]
  };

  rows.forEach((row, index) => {
    const colorSelect = row.querySelector('.color');
    const positionXInput = row.querySelector('.positionX');
    const positionZInput = row.querySelector('.positionZ');

    const modelName = colorSelect.value === 'azul' ? 'FlagBlue' : 'FlagRed';
    const positionX = parseFloat(positionXInput.value);
    const positionZ = parseFloat(positionZInput.value);

    experiment.scenes[0].prefabs.push({ modelName, positionX, positionZ });
    experiment.scenes[0].steps.push({ target: index, action: 0 });
  });

  // Descargar el archivo JSON
  downloadJSON('experiment.json', experiment);

  // Mostrar mensaje de éxito
  showMessage('Formulario enviado correctamente. El archivo experiment.json se ha descargado.', 'success');
});

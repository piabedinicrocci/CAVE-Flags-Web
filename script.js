const flagsContainer = document.getElementById('flagsContainer');
const addFlagButton = document.getElementById('addFlag');
const sendExperimentButton = document.getElementById('sendExperiment');
const messageDiv = document.getElementById('message');
const startExperimentButton = document.getElementById('startExperiment');

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

// Reemplazar la función downloadJSON por sendToDatabase
async function sendToDatabase(experimentData) {
    try {
        const response = await fetch('save_experiment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(experimentData)
        });

        const result = await response.json();
        
        if (result.success) {
            showMessage('Experimento guardado correctamente en la base de datos.', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        showMessage('Error al guardar el experimento: ' + error.message, 'error');
    }
}

// Enviar experimento
sendExperimentButton.addEventListener('click', async () => {
  const rows = document.querySelectorAll('.flag-row');
  let isValid = true;

  // Limpiar mensaje previo
  clearMessage();

  // Validar DNI
  const dniInput = document.getElementById('dni');
  if (!dniInput.value.trim()) {
    showMessage('Debe ingresar un DNI.', 'error');
    return;
  }

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
    const colorSelect = row.querySelector('.color');
    const positionXInput = row.querySelector('.positionX');
    const positionZInput = row.querySelector('.positionZ');
    const positionX = parseFloat(positionXInput.value);
    const positionZ = parseFloat(positionZInput.value);

      // Validación del color
      if (!colorSelect.value || colorSelect.value === 'Seleccionar color') {
        isValid = false;
        colorSelect.style.borderColor = 'red';
        showMessage('Debe seleccionar un color para todas las banderas.', 'error');
    } else {
        colorSelect.style.borderColor = '';
    }

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

  // Generar el objeto de datos
  const experiment = {
    dni: parseInt(dniInput.value),
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

  // Enviar datos a la base de datos
  await sendToDatabase(experiment);
});



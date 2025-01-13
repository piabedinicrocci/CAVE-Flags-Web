const flagsContainer = document.getElementById('flagsContainer');
const addFlagButton = document.getElementById('addFlag');
const sendExperimentButton = document.getElementById('sendExperiment');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');
const positionErrorMessage = document.getElementById('position-error-message'); // Mensaje para campos requeridos

// Función para crear una nueva fila de bandera
function createFlagRow() {
  const flagRow = document.createElement('div');
  flagRow.className = 'flag-row';

  flagRow.innerHTML = `
    <select class="color form-select" id="color">
      <option selected>Color</option>
      <option value="azul">Azul</option>
      <option value="rojo">Rojo</option>
    </select>
    <input type="number" class="positionX" placeholder="Posición X" required />
    <input type="number" class="positionZ" placeholder="Posición Z" required />
    <button class="deleteFlag btn btn-outline-danger">X</button>
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

  // Limpiar mensajes previos
  errorMessage.textContent = '';
  positionErrorMessage.textContent = ''; // Limpiar mensaje de campos requeridos
  successMessage.textContent = '';

  // Validar que haya al menos una bandera
  if (rows.length === 0) {
    errorMessage.textContent = 'Debe agregar al menos una bandera antes de enviar.';
    errorMessage.style.marginTop = '10px';
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
      positionErrorMessage.textContent = 'Los campos de posición X y Z son requeridos.';
      positionErrorMessage.style.marginTop = '10px';
    } else {
      positionXInput.style.borderColor = '';
      positionZInput.style.borderColor = '';
    }

    // Validación de posiciones (0,0)
    if (positionX === 0 && positionZ === 0) {
      isValid = false;
      positionXInput.style.borderColor = 'red';
      positionZInput.style.borderColor = 'red';
      errorMessage.textContent = 'Una bandera no puede estar en la posición (0,0).';
      errorMessage.style.marginTop = '10px';
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
        environment: document.getElementById('scenario').value,
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
  successMessage.textContent = 'Formulario enviado correctamente. El archivo experiment.json se ha descargado.';
});

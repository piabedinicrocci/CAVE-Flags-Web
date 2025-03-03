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

async function sendToDatabase(dni, flags) {
  try {
      const response = await fetch('http://localhost:3000/learning', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              dni: dni,
              flags: flags
          })
      });

      const data = await response.json();

      if (data.success) {
          showMessage('Experimento guardado correctamente', 'success');
          document.getElementById('startExperiment').style.display = 'block';
          return true;
      } else {
          showMessage('Error al guardar el experimento', 'error');
          return false;
      }
  } catch (error) {
      console.error('Error:', error);
      showMessage('Error al guardar el experimento', 'error');
      return false;
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

  // Validar que haya al menos una bandera
  if (rows.length === 0) {
      showMessage('Debe agregar al menos una bandera antes de enviar.', 'error');
      return;
  }

  // Construcción del array de banderas
  const flags = [];

  rows.forEach((row) => {
      const colorSelect = row.querySelector('.color');
      const positionXInput = row.querySelector('.positionX');
      const positionZInput = row.querySelector('.positionZ');
      const positionX = parseFloat(positionXInput.value);
      const positionZ = parseFloat(positionZInput.value);

      // Validar selección de color
      if (!colorSelect.value || colorSelect.value === 'Seleccionar color') {
          isValid = false;
          colorSelect.style.borderColor = 'red';
          showMessage('Debe seleccionar un color para todas las banderas.', 'error');
      } else {
          colorSelect.style.borderColor = '';
      }

      // Validar campos vacíos
      if (!positionXInput.value.trim() || !positionZInput.value.trim()) {
          isValid = false;
          positionXInput.style.borderColor = 'red';
          positionZInput.style.borderColor = 'red';
          showMessage('Los campos de posición X y Z son requeridos.', 'error');
      } else {
          positionXInput.style.borderColor = '';
          positionZInput.style.borderColor = '';
      }

      // Validar posiciones (0,0)
      if (positionX === 0 && positionZ === 0) {
          isValid = false;
          positionXInput.style.borderColor = 'red';
          positionZInput.style.borderColor = 'red';
          showMessage('Una bandera no puede estar en la posición (0,0).', 'error');
      }

      if (isValid) {
          // Asignar ID de bandera según el color
          const id_bandera = colorSelect.value === 'azul' ? 2 : 1;

          flags.push({
              id_bandera: id_bandera,
              dni: parseInt(dniInput.value), // Agregar el DNI a cada bandera
              positionX: positionX,
              positionZ: positionZ
          });
      }
  });

  if (!isValid) {
      return;
  }

  // Enviar datos al backend
  await sendToDatabase(parseInt(dniInput.value), flags);
});




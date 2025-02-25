<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");


// Configuración de la base de datos
$host = "mysql-vrmarket-pladema-ef62.d.aivencloud.com";
$port = 26116;
$user = "avnadmin";
$password = "AVNS_BD6D-d03halBr0cMHzd";
$database = "cave";

try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$database", $user, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener datos del POST
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Verificar que el DNI existe en la tabla PERSONA
    $stmt = $conn->prepare("SELECT dni FROM PERSONA WHERE dni = ?");
    $stmt->execute([$data['dni']]);
    $persona = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$persona) {
        throw new Exception("No se encontró una persona con el DNI proporcionado");
    }

    foreach ($data['scenes'][0]['prefabs'] as $prefab) {
        // Obtener el ID de la bandera según su color
        $stmt = $conn->prepare("SELECT id FROM BANDERA WHERE color = ?");
        $color = $prefab['modelName'] === 'FlagBlue' ? 'azul' : 'rojo';
        $stmt->execute([$color]);
        $bandera = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$bandera) {
            throw new Exception("No se encontró la bandera de color $color");
        }

        // Insertar el registro de aprendizaje con el ID de la bandera y el DNI
        $stmt = $conn->prepare("INSERT INTO APRENDIZAJE (id_bandera, dni, posicionX, posicionZ, fecha) VALUES (?, ?, ?, ?, NOW())");
        $stmt->execute([
            $bandera['id'],
            $data['dni'],
            $prefab['positionX'],
            $prefab['positionZ']
        ]);
    }

    echo json_encode(['success' => true, 'message' => 'Datos guardados correctamente']);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar los datos: ' . $e->getMessage()]);
}
?> 
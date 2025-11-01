<?php
// api/login.php - Handles user authentication

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'ibanking_db';
$username = 'root';
$password = '';

try {
    // Create database connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['username']) || !isset($input['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Username and password are required'
        ]);
        exit();
    }

    $inputUsername = trim($input['username']);
    $inputPassword = $input['password'];

    // Fetch user from database
    $stmt = $pdo->prepare("
        SELECT 
            customer_id,
            student_id,
            username,
            password_hash,
            full_name,
            phone_number,
            email,
            available_balance,
            program
        FROM customer 
        WHERE username = :username
    ");

    $stmt->execute(['username' => $inputUsername]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify user exists
    if (!$user) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
        exit();
    }

    // Verify password using password_verify for Argon2id hashes
    if (password_verify($inputPassword, $user['password_hash'])) {
        // Remove password hash from response
        unset($user['password_hash']);

        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Store user info in session
        $_SESSION['user_id'] = $user['customer_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['logged_in'] = true;

        // Generate a simple token
        $token = bin2hex(random_bytes(32));
        $_SESSION['token'] = $token;

        // Return success response
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    } else {
        // Invalid password
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);
    }

} catch (PDOException $e) {
    // Database connection error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // General error
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>
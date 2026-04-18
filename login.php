<?php
/* ============================================================
   E-Commerce Platform — Login Handler (Server-Side)
   WAD Homework L2 2025/2026 — UMBB
   ============================================================
   Purpose: Authenticate user against the 'account' table in MySQL.
   - Accepts POST request with login and password
   - Verifies credentials against the database
   - Starts a PHP session on successful login
   - Returns JSON response
   ============================================================ */

// Start PHP session to track authenticated user
session_start();

// Set response content type to JSON
header('Content-Type: application/json');

// Allow CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// ── Database Connection Configuration ──
// Adjust these values to match your local XAMPP/WAMP setup
$db_host = 'localhost';     // Database host
$db_user = 'root';          // MySQL username (default for XAMPP)
$db_pass = '';              // MySQL password (empty by default in XAMPP)
$db_name = 'ecommerce_db'; // Database name (created by db_setup.sql)

// ── Only accept POST requests ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.'
    ]);
    exit;
}

// ── Read input data ──
// Support both form-encoded and JSON request body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    // Fallback to form-encoded POST data
    $input = $_POST;
}

$login    = isset($input['login'])    ? trim($input['login'])    : '';
$password = isset($input['password']) ? trim($input['password']) : '';

// ── Validate input ──
if (empty($login) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Login and password are required.'
    ]);
    exit;
}

// ── Connect to MySQL database ──
try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    // Set charset to UTF-8
    $conn->set_charset('utf8mb4');

    // ── Query the account table for matching credentials ──
    // Using prepared statements to prevent SQL injection
    $stmt = $conn->prepare("SELECT id, login FROM account WHERE login = ? AND password = ?");
    $stmt->bind_param("ss", $login, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        // ── Credentials are valid — start session ──
        $user = $result->fetch_assoc();

        // Store user info in session
        $_SESSION['user_id']    = $user['id'];
        $_SESSION['user_login'] = $user['login'];
        $_SESSION['logged_in']  = true;

        // Look up customer info linked to this account
        $custStmt = $conn->prepare("SELECT customer_id, name, email FROM customer WHERE account_id = ?");
        $custStmt->bind_param("i", $user['id']);
        $custStmt->execute();
        $custResult = $custStmt->get_result();

        $customer = null;
        if ($custResult->num_rows === 1) {
            $customer = $custResult->fetch_assoc();
            $_SESSION['customer_id']   = $customer['customer_id'];
            $_SESSION['customer_name'] = $customer['name'];
        }

        $custStmt->close();

        // Return success response
        echo json_encode([
            'success'  => true,
            'message'  => 'Login successful.',
            'user'     => [
                'login'       => $user['login'],
                'customer_id' => $customer ? $customer['customer_id'] : null,
                'name'        => $customer ? $customer['name'] : null
            ]
        ]);
    } else {
        // ── Invalid credentials ──
        echo json_encode([
            'success' => false,
            'message' => 'Invalid login or password.'
        ]);
    }

    // Clean up
    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    // ── Database error ──
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

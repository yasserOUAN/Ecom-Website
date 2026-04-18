<?php
/* ============================================================
   E-Commerce Platform — Save Order Handler
   WAD Homework L2 2025/2026 — UMBB
   ============================================================
   Purpose: Save completed orders to the 'orders' table in MySQL.
   - Accepts POST request with JSON order data
   - Links order to the correct customer in the orders table
   - Inserts one row per cart item
   - Returns JSON response with success/failure
   ============================================================ */

// Start session to identify the customer
session_start();

// Set response content type to JSON
header('Content-Type: application/json');

// Allow CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Database Connection Configuration ──
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'ecommerce_db';

// ── Only accept POST requests ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.'
    ]);
    exit;
}

// ── Read JSON request body ──
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['items']) || !is_array($input['items'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid order data. Expected JSON with "items" array.'
    ]);
    exit;
}

// ── Determine customer ID ──
// Priority: session > lookup by login from request
$customer_id = null;

if (isset($_SESSION['customer_id'])) {
    // Use session customer ID if available
    $customer_id = $_SESSION['customer_id'];
}

// ── Connect to MySQL database ──
try {
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    // Set charset
    $conn->set_charset('utf8mb4');

    // ── If no session customer_id, look up by login name ──
    if (!$customer_id && isset($input['customer_login'])) {
        $loginStmt = $conn->prepare(
            "SELECT c.customer_id FROM customer c 
             INNER JOIN account a ON c.account_id = a.id 
             WHERE a.login = ?"
        );
        $loginStmt->bind_param("s", $input['customer_login']);
        $loginStmt->execute();
        $loginResult = $loginStmt->get_result();

        if ($loginResult->num_rows === 1) {
            $row = $loginResult->fetch_assoc();
            $customer_id = $row['customer_id'];
        } else {
            // Default to customer_id 1 if login not found
            $customer_id = 1;
        }

        $loginStmt->close();
    }

    // Fallback: default customer ID if nothing else works
    if (!$customer_id) {
        $customer_id = 1;
    }

    // ── Insert each cart item as a separate order row ──
    $insertStmt = $conn->prepare(
        "INSERT INTO orders (customer_id, product_id, quantity, order_date, total_price) 
         VALUES (?, ?, ?, NOW(), ?)"
    );

    $ordersInserted = 0;
    $errors = [];

    foreach ($input['items'] as $item) {
        // Validate required fields for each item
        if (!isset($item['product_id']) || !isset($item['quantity']) || !isset($item['total_price'])) {
            $errors[] = "Skipped item: missing required fields.";
            continue;
        }

        $product_id  = intval($item['product_id']);
        $quantity    = intval($item['quantity']);
        $total_price = floatval($item['total_price']);

        // Bind parameters and execute
        $insertStmt->bind_param("iiid", $customer_id, $product_id, $quantity, $total_price);

        if ($insertStmt->execute()) {
            $ordersInserted++;
        } else {
            $errors[] = "Failed to insert product_id $product_id: " . $insertStmt->error;
        }
    }

    $insertStmt->close();
    $conn->close();

    // ── Return response ──
    if ($ordersInserted > 0) {
        echo json_encode([
            'success'         => true,
            'message'         => "$ordersInserted order(s) saved successfully.",
            'orders_inserted' => $ordersInserted,
            'customer_id'     => $customer_id,
            'errors'          => $errors
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No orders were saved.',
            'errors'  => $errors
        ]);
    }

} catch (Exception $e) {
    // ── Database error ──
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
?>

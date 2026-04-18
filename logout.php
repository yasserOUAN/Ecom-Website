<?php
/* ============================================================
   E-Commerce Platform — Logout Handler
   WAD Homework L2 2025/2026 — UMBB
   ============================================================
   Purpose: End the user's session and protect the customer account.
   - Destroys all session data
   - Clears session cookie
   - Redirects to the login page (index.html)
   ============================================================ */

// Start the session so we can destroy it
session_start();

// ── Clear all session variables ──
$_SESSION = array();

// ── Delete the session cookie if it exists ──
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),        // Cookie name
        '',                    // Empty value
        time() - 42000,        // Expired timestamp
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

// ── Destroy the session ──
session_destroy();

// ── Redirect to login page ──
header('Location: index.html');
exit;
?>

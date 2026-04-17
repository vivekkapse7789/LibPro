<?php
/* --- 1. CONFIGURATION --- */
// Force the browser to treat this as a JSON data feed
header('Content-Type: application/json');

// Error Reporting (Turn off for production, but helpful for debugging)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Connection using 127.0.0.1 (Often faster than 'localhost' on some XAMPP setups)
$conn = new mysqli("127.0.0.1", "root", "", "library_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database Connection Failed"]);
    exit;
}

/* --- 2. ACTION HANDLER --- */
$action = $_GET['action'] ?? '';

switch ($action) {

    // --- FETCH ALL BOOKS ---
    case 'fetch':
        $res = $conn->query("SELECT * FROM books ORDER BY id DESC");
        $books = $res->fetch_all(MYSQLI_ASSOC);
        echo json_encode($books ? $books : []);
        break;

    // --- ADD NEW BOOK ---
    case 'add':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $t = $_POST['title'] ?? '';
            $a = $_POST['author'] ?? '';
            $c = $_POST['category'] ?? '';

            // We explicitly set 'Available' and leave borrower/dates as NULL
            $stmt = $conn->prepare("INSERT INTO books (title, author, category, status) VALUES (?, ?, ?, 'Available')");
            $stmt->bind_param("sss", $t, $a, $c);
            
            if ($stmt->execute()) {
                echo json_encode(["status" => "success"]);
            } else {
                echo json_encode(["status" => "error", "message" => $stmt->error]);
            }
        }
        break;

    // --- ISSUE / BORROW BOOK ---
    case 'borrow':
        $id = (int)($_GET['id'] ?? 0);
        $name = $_GET['name'] ?? 'Vivek Kapase';
        $date = $_GET['date'] ?? '';

        $stmt = $conn->prepare("UPDATE books SET status='Borrowed', borrower_name=?, return_date=? WHERE id=?");
        $stmt->bind_param("ssi", $name, $date, $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error"]);
        }
        break;

    // --- RETURN BOOK ---
    case 'return':
        $id = (int)($_GET['id'] ?? 0);

        // Resetting status and clearing borrower info
        $stmt = $conn->prepare("UPDATE books SET status='Available', borrower_name=NULL, issue_date=NULL, return_date=NULL WHERE id=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error"]);
        }
        break;

    // --- DELETE BOOK ---
    case 'delete':
        $id = (int)($_GET['id'] ?? 0);

        $stmt = $conn->prepare("DELETE FROM books WHERE id=?");
        $stmt->bind_param("i", $id);
        
        if ($stmt->execute()) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid Action"]);
        break;
}

/* --- 3. CLEANUP --- */
$conn->close();
exit; // Ensure no accidental whitespace is sent after JSON
?>
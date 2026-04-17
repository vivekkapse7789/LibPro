/**
 * LibPro | Digital Library Archive Logic
 * Handles: Stats, Quick Add, Registration, Borrowing, Returning, and Filtering.
 */

// --- 1. Global State Management ---
// Initializing with sample data so the Borrowed Archive is visible immediately.
let libraryVault = [
    { id: 101, title: 'Clean Code', author: 'Robert Martin', category: 'Tech', status: 'Available', borrower: '', date: '' },
    { id: 102, title: '1984', author: 'George Orwell', category: 'Fiction', status: 'Borrowed', borrower: 'Vivek Kapase', date: '15/04/2026' },
    { id: 103, title: 'Steve Jobs', author: 'Walter Isaacson', category: 'History', status: 'Available', borrower: '', date: '' }
];

// --- 2. Core Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderLibrary();
    setupEventListeners();
});

function setupEventListeners() {
    // Handle the Registration Form submission
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const author = document.getElementById('author').value;
            const category = document.getElementById('category').value;

            addBookToVault(title, author, category);
            bookForm.reset();
            
            // Auto-scroll to inventory to see the new entry
            window.location.hash = 'inventory-page';
        });
    }
}

// --- 3. Rendering Engine ---
function renderLibrary() {
    const inventoryBody = document.getElementById('inventoryBody');
    const borrowedBody = document.getElementById('borrowedBody');
    const countTotal = document.getElementById('countTotal');
    const countBorrowed = document.getElementById('countBorrowed');

    // Clear current table contents
    inventoryBody.innerHTML = '';
    borrowedBody.innerHTML = '';

    let borrowedCount = 0;

    libraryVault.forEach(book => {
        // Build Action Button (Borrow or Return)
        const actionBtn = book.status === 'Available' 
            ? `<button class="nav-cta" style="padding: 6px 16px; font-size: 11px; cursor:pointer; border:none;" onclick="initiateBorrow(${book.id})">Borrow</button>`
            : `<button style="background: var(--accent); color: white; border: none; padding: 6px 16px; border-radius: 50px; font-size: 11px; cursor:pointer;" onclick="returnBook(${book.id})">Return</button>`;

        // A. Update Main Inventory
        const row = `
            <tr class="fade-in">
                <td><strong>${book.title}</strong></td>
                <td>${book.author}</td>
                <td><span class="badge-category">${book.category}</span></td>
                <td><span class="badge ${book.status}">${book.status}</span></td>
                <td>${actionBtn}</td>
            </tr>`;
        inventoryBody.innerHTML += row;

        // B. Update Borrowed Archive (Only if status is Borrowed)
        if (book.status === 'Borrowed') {
            borrowedCount++;
            const borrowedRow = `
                <tr class="fade-in">
                    <td style="color: var(--danger); font-weight: 600;">${book.title}</td>
                    <td>${book.borrower}</td>
                    <td>active@session.local</td>
                    <td>${book.date}</td>
                    <td><span class="badge Borrowed">OUT</span></td>
                </tr>`;
            borrowedBody.innerHTML += borrowedRow;
        }
    });

    // Update Global Stats in Hero Section
    if (countTotal) countTotal.innerText = libraryVault.length;
    if (countBorrowed) countBorrowed.innerText = borrowedCount;
}

// --- 4. Logic Functions ---

// Add a new book (via Form or Quick Add)
function addBookToVault(title, author, category) {
    const newBook = {
        id: Date.now(), // Unique ID based on timestamp
        title: title,
        author: author,
        category: category,
        status: 'Available',
        borrower: '',
        date: ''
    };

    libraryVault.push(newBook);
    renderLibrary();
}

// Quick Add function for the 6 grid cards
function quickAdd(title, author, category) {
    addBookToVault(title, author, category);
    alert(`"${title}" has been added to your vault!`);
}

// Borrowing Logic
function initiateBorrow(id) {
    const borrowerName = prompt("Enter the name of the borrower:");
    
    if (borrowerName && borrowerName.trim() !== "") {
        const index = libraryVault.findIndex(b => b.id === id);
        if (index !== -1) {
            libraryVault[index].status = 'Borrowed';
            libraryVault[index].borrower = borrowerName;
            libraryVault[index].date = new Date().toLocaleDateString();
            renderLibrary();
        }
    }
}

// Returning Logic
function returnBook(id) {
    const index = libraryVault.findIndex(b => b.id === id);
    if (index !== -1) {
        libraryVault[index].status = 'Available';
        libraryVault[index].borrower = '';
        libraryVault[index].date = '';
        renderLibrary();
    }
}

// Search/Filter Functionality
function filterInventory() {
    const input = document.getElementById('searchInput').value.toUpperCase();
    const rows = document.getElementById('inventoryBody').getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const title = cells[0].textContent || cells[0].innerText;
        const author = cells[1].textContent || cells[1].innerText;
        
        if (title.toUpperCase().indexOf(input) > -1 || author.toUpperCase().indexOf(input) > -1) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}
// Add this inside your setupEventListeners() or at the end of the script
const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('fbName').value;
        const rating = document.getElementById('fbRating').value;
        const message = document.getElementById('fbMessage').value;

        // For localhost, we'll log it and show a success message
        console.log("Feedback Received:", { name, rating, message });
        
        alert(`Thank you, ${name}! Your feedback (${rating} stars) has been sent to the vault administrators.`);
        
        feedbackForm.reset();
    });
}

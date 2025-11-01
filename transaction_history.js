// transaction_history.js - Handles transaction history display

// Global variables
let currentUser = null;
let transactions = [];
let currentTransaction = null;

// Initialize page on load
document.addEventListener('DOMContentLoaded', function () {
    // Check if user is logged in
    const userData = sessionStorage.getItem('user');

    if (!userData) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }

    // Parse and store user data
    currentUser = JSON.parse(userData);

    // Load user information
    loadUserInformation();

    // Load transactions
    loadTransactions();
});

// Load user information into header
function loadUserInformation() {
    document.getElementById('headerUserName').textContent = currentUser.full_name;
    document.getElementById('headerBalance').textContent = formatCurrency(currentUser.available_balance);
}

// Load transactions from backend (or simulate)
async function loadTransactions() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const transactionsList = document.getElementById('transactionsList');

    // Show loading state
    loadingState.style.display = 'block';
    emptyState.style.display = 'none';
    transactionsList.innerHTML = '';

    try {
        // Simulate API call to fetch transactions
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get transactions (in production, call actual API)
        const result = await fetchTransactions();

        transactions = result.transactions;

        // Hide loading state
        loadingState.style.display = 'none';

        if (transactions.length === 0) {
            // Show empty state
            emptyState.style.display = 'block';
        } else {
            // Display transactions
            displayTransactions(transactions);
        }

    } catch (error) {
        console.error('Error loading transactions:', error);
        loadingState.style.display = 'none';
        emptyState.style.display = 'block';
    }
}

// Fetch transactions from backend (simulated)
async function fetchTransactions() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Sample transactions based on database structure
    // In production, replace with actual API call
    const sampleTransactions = [
        {
            transaction_id: '425d76e7-fe39-4270-b89a-49ebc9e34b94',
            payer_id: currentUser.customer_id,
            payer_name: currentUser.full_name,
            receiver_id: '523K0077',
            receiver_name: 'Saw Baw Mu Thaw',
            amount: 2500000,
            status: 'COMPLETED',
            initiated_at: '2025-09-28T17:26:00',
            completed_at: '2025-09-28T17:26:15',
            debt_id: 1,
            semester: 'SEMESTER 1',
            academic_year: '2025-2026'
        },
        {
            transaction_id: '4c858d24-d045-4027-8c4a-8a8d7efe28d4',
            payer_id: currentUser.customer_id,
            payer_name: currentUser.full_name,
            receiver_id: '523K0034',
            receiver_name: 'Saw Harry',
            amount: 2500000,
            status: 'COMPLETED',
            initiated_at: '2025-09-28T17:15:00',
            completed_at: '2025-09-28T17:15:12',
            debt_id: 2,
            semester: 'SEMESTER 2',
            academic_year: '2025-2026'
        }
    ];

    // Only return transactions for current user
    const userTransactions = sampleTransactions.filter(
        txn => txn.payer_id === currentUser.customer_id
    );

    // Sort by date (newest first)
    userTransactions.sort((a, b) =>
        new Date(b.completed_at) - new Date(a.completed_at)
    );

    return {
        success: true,
        transactions: userTransactions
    };
}

// Display transactions in the list
function displayTransactions(transactions) {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';

    transactions.forEach(transaction => {
        const transactionItem = createTransactionItem(transaction);
        transactionsList.appendChild(transactionItem);
    });
}

// Create transaction item element
function createTransactionItem(transaction) {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    item.onclick = () => showTransactionDetail(transaction);

    const statusClass = transaction.status.toLowerCase();
    const statusText = transaction.status;

    item.innerHTML = `
        <div class="transaction-header">
            <div>
                <div class="transaction-title">Tuition payment for ${transaction.receiver_name}</div>
                <div class="transaction-details">
                    <div class="transaction-info">
                        <strong>Student:</strong> ${transaction.receiver_name}
                    </div>
                    <div class="transaction-info">
                        <strong>Date:</strong> ${formatDateTime(transaction.completed_at)}
                    </div>
                    <div class="transaction-id">
                        ID: ${transaction.transaction_id}
                    </div>
                </div>
            </div>
            <div>
                <div class="transaction-amount">-${formatCurrency(transaction.amount)}</div>
                <div class="transaction-status ${statusClass}">${statusText}</div>
            </div>
        </div>
    `;

    return item;
}

// Show transaction detail modal
function showTransactionDetail(transaction) {
    currentTransaction = transaction;

    // Populate modal with transaction details
    document.getElementById('detailTxnId').textContent = transaction.transaction_id;
    document.getElementById('detailStatus').textContent = transaction.status;
    document.getElementById('detailDateTime').textContent = formatDateTime(transaction.completed_at);

    document.getElementById('detailPayer').textContent = transaction.payer_name;
    document.getElementById('detailStudentId').textContent = transaction.receiver_id;
    document.getElementById('detailStudentName').textContent = transaction.receiver_name;
    document.getElementById('detailAmount').textContent = formatCurrency(transaction.amount);

    document.getElementById('detailSemester').textContent = transaction.semester;
    document.getElementById('detailAcademicYear').textContent = transaction.academic_year;

    // Show modal
    document.getElementById('detailModal').style.display = 'block';
}

// Close detail modal
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
    currentTransaction = null;
}

// Refresh transactions
async function refreshTransactions() {
    const refreshBtn = document.querySelector('.refresh-btn');
    const originalHTML = refreshBtn.innerHTML;

    try {
        // Disable button and show loading
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span class="loading-spinner-large" style="width: 18px; height: 18px; border-width: 3px; margin: 0 8px 0 0;"></span> Refreshing...';

        // Reload transactions
        await loadTransactions();

    } catch (error) {
        console.error('Refresh error:', error);
    } finally {
        // Restore button
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = originalHTML;
    }
}

// Download receipt (placeholder function)
function downloadReceipt() {
    if (!currentTransaction) {
        alert('No transaction selected');
        return;
    }

    // Create receipt content
    const receiptContent = `
===========================================
        TUITION PAYMENT RECEIPT
===========================================

Transaction ID: ${currentTransaction.transaction_id}
Date: ${formatDateTime(currentTransaction.completed_at)}
Status: ${currentTransaction.status}

-------------------------------------------
PAYER INFORMATION
-------------------------------------------
Name: ${currentTransaction.payer_name}

-------------------------------------------
STUDENT INFORMATION
-------------------------------------------
Student ID: ${currentTransaction.receiver_id}
Student Name: ${currentTransaction.receiver_name}

-------------------------------------------
PAYMENT DETAILS
-------------------------------------------
Semester: ${currentTransaction.semester}
Academic Year: ${currentTransaction.academic_year}
Amount: ${formatCurrency(currentTransaction.amount)}

-------------------------------------------
This is an official receipt for tuition payment.
Generated on: ${formatDateTime(new Date().toISOString())}
===========================================
    `;

    // Create blob and download
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${currentTransaction.transaction_id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Show success message
    alert('Receipt downloaded successfully!');
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);

    const dateOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const dateStr = date.toLocaleDateString('en-GB', dateOptions);
    const timeStr = date.toLocaleTimeString('en-GB', timeOptions);

    return `${timeStr} ${dateStr}`;
}

// Logout function
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeDetailModal();
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', function (event) {
    // Close modal with Escape key
    if (event.key === 'Escape') {
        const modal = document.getElementById('detailModal');
        if (modal.style.display === 'block') {
            closeDetailModal();
        }
    }

    // Refresh with F5 or Ctrl+R (but use custom refresh)
    if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        refreshTransactions();
    }
});
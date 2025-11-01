// payment_form.js - Handles tuition payment form logic

// Global variables
let currentUser = null;
let currentStudent = null;
let otpTimerInterval = null;

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

    // Load user information into the page
    loadUserInformation();

    // Setup form event listeners
    setupEventListeners();
});

// Load user information into header and payer section
function loadUserInformation() {
    // Header information
    document.getElementById('headerUserName').textContent = currentUser.full_name;
    document.getElementById('headerBalance').textContent = formatCurrency(currentUser.available_balance);

    // Payer information section
    document.getElementById('payerName').textContent = currentUser.full_name;
    document.getElementById('payerPhone').textContent = currentUser.phone_number;
    document.getElementById('payerEmail').textContent = currentUser.email;
    document.getElementById('payerBalance').textContent = formatCurrency(currentUser.available_balance);
}

// Setup event listeners
function setupEventListeners() {
    // Student ID input - enable lookup button when valid
    const studentIdInput = document.getElementById('studentId');
    studentIdInput.addEventListener('input', function () {
        const lookupBtn = document.querySelector('.lookup-btn');
        lookupBtn.disabled = this.value.trim().length < 7;
    });

    // Form submission
    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener('submit', function (e) {
        e.preventDefault();
        handlePaymentConfirmation();
    });

    // OTP input - auto-format
    const otpInput = document.getElementById('otpCode');
    otpInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// Lookup student by ID
async function lookupStudent() {
    const studentId = document.getElementById('studentId').value.trim();

    if (!studentId || studentId.length < 7) {
        showMessage('Please enter a valid student ID', 'error');
        return;
    }

    const lookupBtn = document.querySelector('.lookup-btn');
    const originalText = lookupBtn.textContent;

    try {
        // Show loading state
        lookupBtn.disabled = true;
        lookupBtn.innerHTML = '<span class="loading-spinner"></span>Looking up...';

        // Simulate API call (replace with actual API endpoint)
        // For demo, we'll use the database structure to simulate response
        const response = await simulateStudentLookup(studentId);

        if (response.success) {
            currentStudent = response.data;
            displayStudentInformation(response.data);
            showMessage('Student information retrieved successfully!', 'success');

            // Enable confirm button
            document.getElementById('confirmBtn').disabled = false;
        } else {
            showMessage(response.message || 'Student not found or no pending tuition debt', 'error');
            hideStudentInformation();
            document.getElementById('confirmBtn').disabled = true;
        }

    } catch (error) {
        console.error('Lookup error:', error);
        showMessage('Failed to retrieve student information. Please try again.', 'error');
        hideStudentInformation();
        document.getElementById('confirmBtn').disabled = true;
    } finally {
        // Restore button
        lookupBtn.disabled = false;
        lookupBtn.innerHTML = originalText;
    }
}

// Simulate student lookup (replace with actual API call)
async function simulateStudentLookup(studentId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Sample data matching the database structure
    const sampleStudents = {
        '523K0077': {
            student_id: '523K0077',
            full_name: 'Saw Baw Mu Thaw',
            program: 'Software Engineering',
            tuition: {
                debt_id: 1,
                amount: 2500000,
                semester: 'SEMESTER 1',
                academic_year: '2025-2026',
                due_date: '2025-12-30',
                status: 'UNPAID'
            }
        },
        '523K0034': {
            student_id: '523K0034',
            full_name: 'Saw Harry',
            program: 'Software Engineering',
            tuition: {
                debt_id: 2,
                amount: 2500000,
                semester: 'SEMESTER 2',
                academic_year: '2025-2026',
                due_date: '2025-12-30',
                status: 'UNPAID'
            }
        }
    };

    if (sampleStudents[studentId]) {
        return {
            success: true,
            data: sampleStudents[studentId]
        };
    } else {
        return {
            success: false,
            message: 'Student ID not found or no pending tuition debt'
        };
    }
}

// Display student information
function displayStudentInformation(student) {
    document.getElementById('studentName').textContent = student.full_name;
    document.getElementById('studentProgram').textContent = student.program;
    document.getElementById('tuitionAmount').textContent = formatCurrency(student.tuition.amount);
    document.getElementById('semester').textContent = student.tuition.semester;
    document.getElementById('academicYear').textContent = student.tuition.academic_year;
    document.getElementById('dueDate').textContent = formatDate(student.tuition.due_date);

    // Show the student details section
    document.getElementById('studentDetails').style.display = 'block';
}

// Hide student information
function hideStudentInformation() {
    document.getElementById('studentDetails').style.display = 'none';
    currentStudent = null;
}

// Handle payment confirmation
function handlePaymentConfirmation() {
    // Validate that student information is loaded
    if (!currentStudent) {
        showMessage('Please lookup student information first', 'error');
        return;
    }

    // Validate balance
    const tuitionAmount = currentStudent.tuition.amount;
    const availableBalance = currentUser.available_balance;

    if (tuitionAmount > availableBalance) {
        showMessage('Insufficient balance. Please top up your account.', 'error');
        return;
    }

    // Show OTP modal
    openOtpModal();
}

// Open OTP Modal
function openOtpModal() {
    const modal = document.getElementById('otpModal');
    const otpEmailSpan = document.getElementById('otpEmail');
    const otpInput = document.getElementById('otpCode');
    const otpError = document.getElementById('otpError');

    // Set email in modal
    otpEmailSpan.textContent = currentUser.email;

    // Clear previous input and errors
    otpInput.value = '';
    otpError.style.display = 'none';

    // Show modal
    modal.style.display = 'block';

    // Start OTP timer (5 minutes)
    startOtpTimer(300);

    // Simulate sending OTP (in real app, call API here)
    console.log('OTP sent to:', currentUser.email);

    // For demo purposes, log the OTP (in production, this would be sent via email)
    const mockOtp = Math.floor(100000 + Math.random() * 900000);
    console.log('Mock OTP:', mockOtp);
}

// Close OTP Modal
function closeOtpModal() {
    const modal = document.getElementById('otpModal');
    modal.style.display = 'none';

    // Clear timer
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
    }
}

// Start OTP timer
function startOtpTimer(seconds) {
    // Clear any existing timer
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
    }

    let timeRemaining = seconds;
    const timerDisplay = document.getElementById('otpTimer');

    otpTimerInterval = setInterval(function () {
        const minutes = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;

        timerDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

        if (timeRemaining <= 0) {
            clearInterval(otpTimerInterval);
            timerDisplay.textContent = 'EXPIRED';
            showOtpError('OTP has expired. Please request a new one.');
        }

        timeRemaining--;
    }, 1000);
}

// Verify OTP and complete payment
async function verifyOtp() {
    const otpCode = document.getElementById('otpCode').value.trim();
    const otpError = document.getElementById('otpError');

    // Validate OTP input
    if (!otpCode || otpCode.length !== 6) {
        showOtpError('Please enter a valid 6-digit OTP code');
        return;
    }

    // Hide previous errors
    otpError.style.display = 'none';

    try {
        // Simulate OTP verification (replace with actual API call)
        const verificationResult = await simulateOtpVerification(otpCode);

        if (verificationResult.success) {
            // Close modal
            closeOtpModal();

            // Process payment
            await processPayment();
        } else {
            showOtpError(verificationResult.message || 'Invalid OTP code');
        }

    } catch (error) {
        console.error('OTP verification error:', error);
        showOtpError('Verification failed. Please try again.');
    }
}

// Simulate OTP verification
async function simulateOtpVerification(otpCode) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, accept any 6-digit code
    // In production, verify against backend
    if (otpCode.length === 6 && /^\d+$/.test(otpCode)) {
        return { success: true };
    } else {
        return { success: false, message: 'Invalid OTP code' };
    }
}

// Process payment
async function processPayment() {
    try {
        showMessage('Processing payment...', 'info');

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In production, call actual payment API
        const paymentResult = await simulatePaymentProcessing();

        if (paymentResult.success) {
            // Update user balance
            currentUser.available_balance -= currentStudent.tuition.amount;
            sessionStorage.setItem('user', JSON.stringify(currentUser));

            // Show success message
            showSuccessPage();
        } else {
            showMessage('Payment failed. Please try again.', 'error');
        }

    } catch (error) {
        console.error('Payment error:', error);
        showMessage('Payment processing failed. Please try again.', 'error');
    }
}

// Simulate payment processing
async function simulatePaymentProcessing() {
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        success: true,
        transaction_id: 'TXN' + Date.now()
    };
}

// Show success page
function showSuccessPage() {
    // Create success overlay
    const successHtml = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
                    background: rgba(0, 0, 0, 0.8); z-index: 3000; 
                    display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 50px; border-radius: 20px; 
                        text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="font-size: 60px; color: #48bb78; margin-bottom: 20px;">✓</div>
                <h2 style="font-size: 28px; color: #2d3748; margin-bottom: 15px;">Payment Successful!</h2>
                <p style="font-size: 16px; color: #718096; margin-bottom: 30px;">
                    Tuition payment of <strong>${formatCurrency(currentStudent.tuition.amount)}</strong>
                    for student <strong>${currentStudent.full_name}</strong> has been completed successfully.
                </p>
                <p style="font-size: 14px; color: #718096; margin-bottom: 30px;">
                    A confirmation email has been sent to <strong>${currentUser.email}</strong>
                </p>
                <button onclick="returnToPaymentPage()" 
                        style="padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                               color: white; border: none; border-radius: 12px; font-size: 16px; 
                               font-weight: 600; cursor: pointer;">
                    Make Another Payment
                </button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', successHtml);
}

// Return to payment page
function returnToPaymentPage() {
    location.reload();
}

// Reset form
function resetForm() {
    // Clear student ID input
    document.getElementById('studentId').value = '';

    // Hide student details
    hideStudentInformation();

    // Disable confirm button
    document.getElementById('confirmBtn').disabled = true;

    // Clear messages
    const messageBox = document.getElementById('messageBox');
    messageBox.style.display = 'none';

    // Reset current student
    currentStudent = null;
}

// Show message
function showMessage(message, type = 'info') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Show OTP error
function showOtpError(message) {
    const otpError = document.getElementById('otpError');
    otpError.textContent = message;
    otpError.style.display = 'block';
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Logout function
function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('otpModal');
    if (event.target === modal) {
        closeOtpModal();
    }
};
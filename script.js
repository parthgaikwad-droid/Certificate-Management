// =============================================
// Certificate Management System - Vanilla JavaScript
// =============================================

/*
  DATA STRUCTURE:
  certificates = [
    {
      id: "CERT-2026-0001",
      recipientName: "Student Name",
      courseName: "Course Name",
      issueDate: "YYYY-MM-DD",
      grade: "Grade/Performance",
      createdAt: timestamp
    }
  ]
*/

// =============================================
// 1. STATE & SETUP
// =============================================

const CERT_KEY = 'certificates_v1';
let certificates = [];

// DOM Elements (cache for performance)
const form = document.getElementById('certificate-form');
const tableBody = document.getElementById('certificate-table');
const searchInput = document.getElementById('search-input');
const courseFilter = document.getElementById('course-filter');
const modal = document.getElementById('certificate-modal');
const closeBtn = modal.querySelector('.close-btn');
const certificatePreview = document.getElementById('certificate-preview');

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
  // Load from LocalStorage first
  loadFromLocalStorage();
  // Render initial table
  renderCertificates(certificates);
  // Set up event listeners
  setupEventListeners();
});

// =============================================
// 2. LOCALSTORAGE HELPERS
// =============================================

/**
 * Load certificates from browser LocalStorage
 * - Uses JSON.parse to deserialize stored array
 * - Initializes with mock data if storage is empty or invalid
 */
function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem(CERT_KEY);
    if (stored) {
      certificates = JSON.parse(stored);
      // Ensure certificates is always an array
      if (!Array.isArray(certificates)) {
        certificates = [certificates];
      }
    } else {
      // Initialize with 2-3 mock certificates if storage is empty
      certificates = generateMockCertificates();
      saveToLocalStorage();
    }
  } catch (error) {
    console.error('Error loading from LocalStorage:', error);
    certificates = generateMockCertificates();
    saveToLocalStorage();
  }
}

/**
 * Save certificates array to browser LocalStorage
 * - Uses JSON.stringify to serialize the array
 * - Stores under key 'certificates_v1'
 */
function saveToLocalStorage() {
  try {
    localStorage.setItem(CERT_KEY, JSON.stringify(certificates));
    // Re-render after saving to ensure persistence
    renderCertificates(certificates);
  } catch (error) {
    console.error('Error saving to LocalStorage:', error);
  }
}

/**
 * Generate 2-3 mock certificate data for initial display
 * @returns {Array} Array of certificate objects
 */
function generateMockCertificates() {
  const mocks = [
    {
      id: 'CERT-2026-0001',
      recipientName: 'Alice Johnson',
      courseName: 'Computer Science Fundamentals',
      issueDate: '2026-01-15',
      grade: 'A+',
      createdAt: new Date().toISOString()
    },
    {
      id: 'CERT-2026-0002',
      recipientName: 'Bob Smith',
      courseName: 'Mathematics Excellence',
      issueDate: '2026-02-20',
      grade: 'First Class',
      createdAt: new Date().toISOString()
    },
    {
      id: 'CERT-2026-0003',
      recipientName: 'Carol Williams',
      courseName: 'Physics Research Project',
      issueDate: '2026-03-10',
      grade: 'Distinction',
      createdAt: new Date().toISOString()
    }
  ];
  return mocks;
}

// =============================================
// 3. CERTIFICATE ID GENERATION
// =============================================

/**
 * Generate a short unique certificate ID in format: CERT-2026-XXXX
 * Uses a simple counter-based approach with local storage tracking
 * @returns {string} Unique certificate ID
 */
function generateCertificateId() {
  // Get the highest existing numeric suffix
  let maxNum = 0;

  certificates.forEach(cert => {
    // Extract number from ID like "CERT-2026-0001"
    const match = cert.id.match(/CERT-2026-(\d+)$/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) {
        maxNum = num;
      }
    }
  });

  // Increment and format with leading zeros
  const newNum = maxNum + 1;
  const formatted = newNum.toString().padStart(4, '0');

  return `CERT-2026-${formatted}`;
}

// =============================================
// 4. ADD CERTIFICATE
// =============================================

/**
 * Handle form submission: validate, create certificate object, add to state, save
 * @param {Event} e - Form submit event
 */
function addCertificate(e) {
  e.preventDefault();

  // Get form values
  const recipientName = document.getElementById('recipient-name').value.trim();
  const courseName = document.getElementById('course-name').value.trim();
  const issueDate = document.getElementById('issue-date').value;
  const grade = document.getElementById('grade').value.trim() || 'Pass';
  const certId = document.getElementById('certificate-id').value.trim();

  // Validate required fields
  if (!recipientName || !courseName || !issueDate) {
    alert('Please fill in all required fields (Recipient Name, Course Name, Issue Date).');
    return;
  }

  // Use provided ID or generate a new one
  const finalId = certId && !certificates.some(c => c.id === certId)
    ? certId
    : generateCertificateId();

  // Create certificate object
  const newCertificate = {
    id: finalId,
    recipientName,
    courseName,
    issueDate,
    grade,
    // Add timestamp for sort/filter reference
    createdAt: new Date().toISOString()
  };

  // Add to state array
  certificates.push(newCertificate);

  // Persist to LocalStorage
  saveToLocalStorage();

  // Reset form
  form.reset();
  updateAutoIdDisplay();

  // Success feedback
  alert(`Certificate "${recipientName}" issued successfully with ID: ${finalId}`);
}

/**
 * Update the auto-generated ID display in the form
 */
function updateAutoIdDisplay() {
  const autoIdSpan = document.getElementById('auto-id');
  if (autoIdSpan) {
    autoIdSpan.textContent = generateCertificateId().replace('CERT-2026-', 'CERT-2026-');
  }
}

// =============================================
// 5. RENDER CERTIFICATES
// =============================================

/**
 * Dynamically generate table rows from certificates array
 * Uses document.createElement for DOM manipulation (viva-exam friendly)
 * @param {Array} list - Array of certificate objects to render
 */
function renderCertificates(list) {
  // Clear existing table rows (except header)
  tableBody.innerHTML = '';

  // Sort by issue date descending (newest first)
  const sorted = [...list].sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

  sorted.forEach((cert, index) => {
    const tr = document.createElement('tr');

    // Format date for display (DD/MM/YYYY)
    const dateObj = new Date(cert.issueDate);
    const formattedDate = `${dateObj.getDate()} / ${dateObj.getMonth() + 1} / ${dateObj.getFullYear()}`;

    tr.innerHTML = `
      <td style="width: 120px;">${cert.id}</td>
      <td>${cert.recipientName}</td>
      <td>${cert.courseName}</td>
      <td>${formattedDate}</td>
      <td style="color: #667eea; font-weight: 500;">${cert.grade}</td>
      <td>
        <button class="action-btn view" onclick="openModal('${cert.id}')">View/Verify</button>
        <button class="action-btn delete" onclick="deleteCertificate('${cert.id}')">Delete</button>
        <button class="action-btn print" onclick="printCertificate('${cert.id}')">Print</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// =============================================
// 6. SEARCH & FILTER
// =============================================

/**
 * Search and filter certificates based on user input
 * Uses Array.filter() and Array.includes() for real-time matching
 * Triggered on: search input event + course filter change
 */
function searchAndFilter() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCourse = courseFilter.value.trim().toLowerCase();

  // Apply both search and filter using single pass
  const filtered = certificates.filter(cert => {
    // Search by recipient name or certificate ID (case-insensitive)
    const matchesSearch = cert.recipientName.toLowerCase().includes(searchTerm) ||
                          cert.id.toLowerCase().includes(searchTerm);

    // Filter by course (empty string means no filter)
    const matchesCourse = !selectedCourse || cert.courseName.toLowerCase().includes(selectedCourse);

    return matchesSearch && matchesCourse;
  });

  renderCertificates(filtered);
}

// =============================================
// 7. DELETE CERTIFICATE
// =============================================

/**
 * Remove a certificate by ID with user confirmation
 * - Uses confirm() dialog for safety
 * - Updates LocalStorage after deletion
 * @param {string} id - Certificate ID to delete
 */
function deleteCertificate(id) {
  // Ask for confirmation
  if (!confirm(`Are you sure you want to delete the certificate for "${id}"?`)) {
    return;
  }

  // Filter out the certificate with matching ID
  certificates = certificates.filter(cert => cert.id !== id);

  // Persist changes
  saveToLocalStorage();

  // Re-render table
  renderCertificates(certificates);

  // Success message
  alert('Certificate record deleted successfully.');
}

// =============================================
// 8. MODAL FUNCTIONALITY
// =============================================

/**
 * Open the certificate preview modal for a specific certificate ID
 * @param {string} id - Certificate ID to display
 */
function openModal(id) {
  // Find the certificate in state
  const cert = certificates.find(c => c.id === id);

  if (!cert) {
    alert('Certificate not found!');
    return;
  }

  // Populate modal content
  document.getElementById('preview-recipient').textContent = cert.recipientName;
  document.getElementById('preview-course').textContent = cert.courseName;

  const dateObj = new Date(cert.issueDate);
  document.getElementById('preview-date').innerHTML = `
    Issue Date: ${dateObj.toLocaleDateString()}
  `;
  document.getElementById('preview-grade').innerHTML = `
    Grade: ${cert.grade}
  `;
  document.getElementById('preview-id').innerHTML = `
    Certificate ID: ${cert.id}
  `;

  // Show modal
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

/**
 * Close the certificate preview modal
 */
function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
}

// Close modal when clicking the 'x' button
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

/**
 * Print the current certificate modal content
 * Uses window.print() for browser print dialog
 * @param {string} id - Certificate ID to print
 */
function printCertificate(id) {
  const cert = certificates.find(c => c.id === id);

  if (!cert) {
    alert('Certificate not found!');
    return;
  }

  // Populate a hidden print version or use the existing modal
  // For now, populate and immediately print
  document.getElementById('preview-recipient').textContent = cert.recipientName;
  document.getElementById('preview-course').textContent = cert.courseName;

  const dateObj = new Date(cert.issueDate);
  document.getElementById('preview-date').innerHTML = `
    Issue Date: ${dateObj.toLocaleDateString()}
  `;
  document.getElementById('preview-grade').innerHTML = `
    Grade: ${cert.grade}
  `;
  document.getElementById('preview-id').innerHTML = `
    Certificate ID: ${cert.id}
  `;

  // Trigger print
  window.print();
}

// =============================================
// 9. EVENT LISTENERS SETUP
// =============================================

/**
 * Set up all event listeners for the application
 * - Form submit: addCertificate
 * - Search input: real-time search/filter
 * - Course filter: dropdown change
 */
function setupEventListeners() {
  // Form submit
  form.addEventListener('submit', addCertificate);

  // Search input - real-time filtering (debounced naturally by user typing)
  searchInput.addEventListener('input', searchAndFilter);

  // Course filter change
  courseFilter.addEventListener('change', searchAndFilter);
}

// =============================================
// 10. EXPORT FOR TESTING/DEBUGGING
// =============================================

// Expose some functions globally for easy debugging in console
window.CertificateSystem = {
  generateCertificateId,
  addCertificate,
  renderCertificates,
  deleteCertificate,
  searchAndFilter,
  openModal,
  closeModal,
  saveToLocalStorage,
  loadFromLocalStorage
};

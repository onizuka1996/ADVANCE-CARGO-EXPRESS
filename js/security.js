// Security utilities
const SecurityUtils = {
    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Validate file type and size
    validateFile(file, allowedTypes, maxSize) {
        if (!file) return false;
        
        // Check file type
        const fileType = file.type.toLowerCase();
        if (!allowedTypes.includes(fileType)) {
            alert('ประเภทไฟล์ไม่ถูกต้อง กรุณาอัพโหลดไฟล์ที่กำหนดเท่านั้น');
            return false;
        }

        // Check file size (convert maxSize from MB to bytes)
        const maxBytes = maxSize * 1024 * 1024;
        if (file.size > maxBytes) {
            alert(`ขนาดไฟล์ต้องไม่เกิน ${maxSize}MB`);
            return false;
        }

        return true;
    },

    // Rate limiting for form submission
    setupRateLimit(formId, maxAttempts, timeWindow) {
        const form = document.getElementById(formId);
        if (!form) return;

        let attempts = 0;
        let lastAttemptTime = 0;

        form.addEventListener('submit', (e) => {
            const now = Date.now();
            
            // Reset attempts if time window has passed
            if (now - lastAttemptTime > timeWindow) {
                attempts = 0;
            }

            // Check if max attempts reached
            if (attempts >= maxAttempts) {
                e.preventDefault();
                alert('คุณส่งฟอร์มบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง');
                return false;
            }

            attempts++;
            lastAttemptTime = now;
        });
    },

    // CSRF Token management
    setupCSRFProtection() {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('csrfToken', token);
        
        // Add token to all forms
        document.querySelectorAll('form').forEach(form => {
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = 'csrf_token';
            tokenInput.value = token;
            form.appendChild(tokenInput);
        });
    }
};

// Initialize security measures
document.addEventListener('DOMContentLoaded', () => {
    // Setup CSRF protection
    SecurityUtils.setupCSRFProtection();

    // Setup rate limiting for job application form (max 3 attempts per 5 minutes)
    SecurityUtils.setupRateLimit('jobApplicationForm', 3, 5 * 60 * 1000);

    // Add input validation to forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
            inputs.forEach(input => {
                input.value = SecurityUtils.sanitizeInput(input.value);
            });
        });
    });

    // Setup file upload validation
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            SecurityUtils.validateFile(file, allowedTypes, 5); // 5MB max size
        });
    });
});

export default SecurityUtils;

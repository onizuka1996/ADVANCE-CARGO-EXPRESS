import SecurityUtils from './security.js';

// Export the form initialization function
export function initializeForm() {
    console.log('Initializing form...'); // Debug log
    const form = document.getElementById('jobApplicationForm');
    if (!form) {
        console.error('Form not found!');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submitted'); // Debug log
        
        // Get form data and sanitize inputs
        const formData = {
            fullName: SecurityUtils.sanitizeInput(document.getElementById('fullName').value),
            phone: SecurityUtils.sanitizeInput(document.getElementById('phone').value),
            age: SecurityUtils.sanitizeInput(document.getElementById('age').value),
            province: SecurityUtils.sanitizeInput(document.getElementById('province').value),
            occupation: SecurityUtils.sanitizeInput(document.getElementById('occupation').value),
            workHistory: SecurityUtils.sanitizeInput(document.getElementById('workHistory').value),
            contact: SecurityUtils.sanitizeInput(document.getElementById('contact').value)
        };

        console.log('Form data:', formData); // Debug log

        // Handle file uploads with validation
        const photoInput = document.getElementById('photo');
        const resumeInput = document.getElementById('resume');
        const photo = photoInput.files[0];
        const resume = resumeInput.files[0];

        // Validate files
        const allowedImageTypes = ['image/jpeg', 'image/png'];
        const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (photo && !SecurityUtils.validateFile(photo, allowedImageTypes, 5)) {
            return;
        }
        if (resume && !SecurityUtils.validateFile(resume, allowedDocTypes, 5)) {
            return;
        }
        
        // Create message text for Telegram
        const messageText = `
    ใบสมัครงานใหม่
    ชื่อ-นามสกุล: ${formData.fullName}
    เบอร์โทร: ${formData.phone}
    อายุ: ${formData.age}
    จังหวัด: ${formData.province}
    ตำแหน่ง: ${formData.occupation === 'full-time' ? 'พนักงานประจำ' : 'พนักงานพาร์ทไทม์'}
    ประวัติการทำงาน: ${formData.workHistory}
    ช่องทางติดต่อ: ${formData.contact}
        `;

        try {
            console.log('Sending to Telegram...'); // Debug log
            console.log('Using token:', window.CONFIG.BOT_TOKEN); // Debug log (remove in production)
            console.log('Using chat ID:', window.CONFIG.CHAT_ID); // Debug log (remove in production)

            // First send the text message
            const messageResponse = await fetch(`https://api.telegram.org/bot${window.CONFIG.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: window.CONFIG.CHAT_ID,
                    text: messageText,
                    parse_mode: 'HTML'
                })
            });

            if (!messageResponse.ok) {
                const errorData = await messageResponse.json();
                console.error('Telegram API Error:', errorData); // Debug log
                throw new Error(`Failed to send message to Telegram: ${errorData.description}`);
            }

            // Send the resume if it exists
            if (resume) {
                const resumeData = new FormData();
                resumeData.append('document', resume);
                resumeData.append('chat_id', window.CONFIG.CHAT_ID);
                resumeData.append('caption', `เรซูเม่ของ ${formData.fullName}`);

                const resumeResponse = await fetch(`https://api.telegram.org/bot${window.CONFIG.BOT_TOKEN}/sendDocument`, {
                    method: 'POST',
                    body: resumeData
                });

                if (!resumeResponse.ok) {
                    const errorData = await resumeResponse.json();
                    console.error('Telegram API Error (Resume):', errorData); // Debug log
                    throw new Error(`Failed to send resume to Telegram: ${errorData.description}`);
                }
            }

            // Then send the photo if it exists
            if (photo) {
                const photoData = new FormData();
                photoData.append('photo', photo);
                photoData.append('chat_id', window.CONFIG.CHAT_ID);
                photoData.append('caption', `รูปถ่ายของ ${formData.fullName}`);

                const photoResponse = await fetch(`https://api.telegram.org/bot${window.CONFIG.BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: photoData
                });

                if (!photoResponse.ok) {
                    const errorData = await photoResponse.json();
                    console.error('Telegram API Error (Photo):', errorData); // Debug log
                    throw new Error(`Failed to send photo to Telegram: ${errorData.description}`);
                }
            }

            // Show success message
            alert('ส่งใบสมัครเรียบร้อยแล้ว ทางเราจะติดต่อกลับโดยเร็วที่สุด');
            form.reset();
        } catch (error) {
            console.error('Error:', error); // Debug log
            alert('เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง');
        }
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
});

document.getElementById('jobApplicationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        age: document.getElementById('age').value,
        province: document.getElementById('province').value,
        occupation: document.getElementById('occupation').value,
        workHistory: document.getElementById('workHistory').value,
        contact: document.getElementById('contact').value
    };

    // Handle file uploads
    const photoInput = document.getElementById('photo');
    const resumeInput = document.getElementById('resume');
    const photo = photoInput.files[0];
    const resume = resumeInput.files[0];
    
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

    // Telegram bot configuration
    const BOT_TOKEN = '7759410116:AAHisFHNSz-xRzl6BV9PPopwzJUz5oJl7_M';
    const CHAT_ID = '-4781908207'; // Updated group chat ID

    try {
        // First send the text message
        const messageResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: messageText,
                parse_mode: 'HTML'
            })
        });

        if (!messageResponse.ok) {
            throw new Error('Failed to send message to Telegram');
        }

        // Send the resume if it exists
        if (resume) {
            const resumeData = new FormData();
            resumeData.append('document', resume);
            resumeData.append('chat_id', CHAT_ID);
            resumeData.append('caption', `เรซูเม่ของ ${formData.fullName}`);

            const resumeResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                method: 'POST',
                body: resumeData
            });

            if (!resumeResponse.ok) {
                throw new Error('Failed to send resume to Telegram');
            }
        }

        // Then send the photo if it exists
        if (photo) {
            const photoData = new FormData();
            photoData.append('photo', photo);
            photoData.append('chat_id', CHAT_ID);
            photoData.append('caption', `รูปถ่ายของ ${formData.fullName}`);

            const photoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: photoData
            });

            if (!photoResponse.ok) {
                throw new Error('Failed to send photo to Telegram');
            }
        }

        // Show success message
        alert('ส่งใบสมัครเรียบร้อยแล้ว ทางเราจะติดต่อกลับโดยเร็วที่สุด');
        this.reset();
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการส่งใบสมัคร กรุณาลองใหม่อีกครั้ง');
    }
});

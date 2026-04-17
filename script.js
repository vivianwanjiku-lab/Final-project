// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Get the appointment form element
    const appointmentForm = document.querySelector('.appointment-form');
    
    // Initialize appointments array from localStorage or create empty array
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Display today's date as min date for the date picker
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Set default time to 09:00 AM
    const timeInput = document.getElementById('time');
    if (timeInput) {
        timeInput.value = '09:00';
    }
    
    // Handle form submission
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const doctor = document.getElementById('doctor').value;
            
            // Validate form
            if (!validateForm(name, email, phone, date, time, doctor)) {
                return;
            }
            
            // Check if the selected time slot is available
            if (!isTimeSlotAvailable(date, time, doctor)) {
                showNotification('This time slot is already booked. Please choose another time.', 'error');
                return;
            }
            
            // Create appointment object
            const appointment = {
                id: Date.now(),
                name: name,
                email: email,
                phone: phone,
                date: date,
                time: time,
                doctor: doctor,
                doctorName: getDoctorName(doctor),
                bookedAt: new Date().toISOString(),
                status: 'confirmed'
            };
            
            // Add to appointments array
            appointments.push(appointment);
            
            // Save to localStorage
            localStorage.setItem('appointments', JSON.stringify(appointments));
            
            // Show success message
            showNotification('Appointment booked successfully! Check your email for confirmation.', 'success');
            
            // Reset form
            appointmentForm.reset();
            
            // Reset to default values
            if (dateInput) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                dateInput.value = tomorrow.toISOString().split('T')[0];
            }
            if (timeInput) timeInput.value = '09:00';
            
            // Send confirmation email (simulated)
            sendConfirmationEmail(name, email, doctor, date, time);
            
            // Log to console for debugging
            console.log('Appointment booked:', appointment);
            console.log('Total appointments:', appointments.length);
        });
    }
    
    // Form validation function
    function validateForm(name, email, phone, date, time, doctor) {
        // Check if all fields are filled
        if (!name || !email || !phone || !date || !time || !doctor) {
            showNotification('Please fill in all fields.', 'error');
            return false;
        }
        
        // Validate name (at least 2 characters, only letters and spaces)
        const nameRegex = /^[A-Za-z\s]{2,}$/;
        if (!nameRegex.test(name)) {
            showNotification('Please enter a valid name (at least 2 characters, letters only).', 'error');
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return false;
        }
        
        // Validate phone number (Kenyan format or international)
        const phoneRegex = /^(\+254|0)[7-9][0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('Please enter a valid phone number (e.g., 0712345678 or +254712345678).', 'error');
            return false;
        }
        
        // Validate date (not in the past)
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showNotification('Please select a future date.', 'error');
            return false;
        }
        
        return true;
    }
    
    // Check if time slot is available
    function isTimeSlotAvailable(date, time, doctor) {
        // Get all appointments for the same doctor on the same date and time
        const conflictingAppointment = appointments.find(app => 
            app.date === date && 
            app.time === time && 
            app.doctor === doctor
        );
        
        return !conflictingAppointment;
    }
    
    // Get doctor's full name from value
    function getDoctorName(doctorValue) {
        const doctors = {
            'dr-smith': 'Dr. Smith',
            'dr-jones': 'Dr. Jones',
            'dr-brown': 'Dr. Brown'
        };
        return doctors[doctorValue] || doctorValue;
    }
    
    // Show notification to user
    function showNotification(message, type) {
        // Check if notification container exists, if not create it
        let notificationContainer = document.querySelector('.notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
            
            // Add styles for notification container
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '9999';
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✓' : '✗'}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Style the notification
        notification.style.backgroundColor = type === 'success' ? '#4caf50' : '#f44336';
        notification.style.color = 'white';
        notification.style.padding = '15px 20px';
        notification.style.marginBottom = '10px';
        notification.style.borderRadius = '8px';
        notification.style.display = 'flex';
        notification.style.justifyContent = 'space-between';
        notification.style.alignItems = 'center';
        notification.style.minWidth = '300px';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        notification.style.animation = 'slideInRight 0.3s ease';
        
        // Add to container
        notificationContainer.appendChild(notification);
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'white';
        closeBtn.style.fontSize = '20px';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.marginLeft = '15px';
        
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Simulate sending confirmation email
    function sendConfirmationEmail(name, email, doctor, date, time) {
        // This is a simulation - in a real application, you would send this to a backend API
        console.log(`Sending confirmation email to ${email}...`);
        
        // Format date for display
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const emailContent = `
            Dear ${name},
            
            Your appointment has been confirmed!
            
            Appointment Details:
            - Doctor: ${getDoctorName(doctor)}
            - Date: ${formattedDate}
            - Time: ${time}
            
            Please arrive 15 minutes before your scheduled time.
            
            Thank you for choosing Appointment Scheduler!
            
            Best regards,
            Appointment Scheduler Team
        `;
        
        console.log('Email content:', emailContent);
        
        // In a real application, you would make an API call here
        // For demo purposes, we'll just log it
        showNotification(`Confirmation sent to ${email}`, 'success');
    }
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification {
            animation: slideInRight 0.3s ease;
        }
        
        .notification-removing {
            animation: slideOutRight 0.3s ease;
        }
        
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        /* Real-time validation styles */
        .form-group input.invalid,
        .form-group select.invalid {
            border-color: #f44336;
        }
        
        .form-group input.valid,
        .form-group select.valid {
            border-color: #4caf50;
        }
        
        .validation-message {
            font-size: 0.85rem;
            margin-top: 5px;
            color: #f44336;
        }
    `;
    document.head.appendChild(style);
    
    // Add real-time validation to form inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const nameRegex = /^[A-Za-z\s]{2,}$/;
            if (nameRegex.test(this.value)) {
                this.classList.add('valid');
                this.classList.remove('invalid');
                removeValidationMessage(this);
            } else {
                this.classList.add('invalid');
                this.classList.remove('valid');
                showValidationMessage(this, 'Name must be at least 2 characters (letters only)');
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(this.value)) {
                this.classList.add('valid');
                this.classList.remove('invalid');
                removeValidationMessage(this);
            } else {
                this.classList.add('invalid');
                this.classList.remove('valid');
                showValidationMessage(this, 'Enter a valid email address');
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const phoneRegex = /^(\+254|0)[7-9][0-9]{8}$/;
            if (phoneRegex.test(this.value)) {
                this.classList.add('valid');
                this.classList.remove('invalid');
                removeValidationMessage(this);
            } else {
                this.classList.add('invalid');
                this.classList.remove('valid');
                showValidationMessage(this, 'Enter valid Kenyan phone number (e.g., 0712345678)');
            }
        });
    }
    
    function showValidationMessage(input, message) {
        let validationMsg = input.parentNode.querySelector('.validation-message');
        if (!validationMsg) {
            validationMsg = document.createElement('div');
            validationMsg.className = 'validation-message';
            input.parentNode.appendChild(validationMsg);
        }
        validationMsg.textContent = message;
    }
    
    function removeValidationMessage(input) {
        const validationMsg = input.parentNode.querySelector('.validation-message');
        if (validationMsg) {
            validationMsg.remove();
        }
    }
    
    // Add functionality to view appointments (optional feature)
    function displayAppointmentsSummary() {
        const appointmentCount = appointments.length;
        console.log(`Total appointments booked: ${appointmentCount}`);
        
        // You can add a feature to display appointments in a modal or separate section
        if (appointmentCount > 0) {
            const lastAppointment = appointments[appointments.length - 1];
            console.log('Last appointment:', lastAppointment);
        }
    }
    
    // Display summary on load
    displayAppointmentsSummary();
    
    // Add keyboard shortcut for form submission (Ctrl+Enter)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (appointmentForm) {
                e.preventDefault();
                const submitEvent = new Event('submit');
                appointmentForm.dispatchEvent(submitEvent);
            }
        }
    });
    
    // Add smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.navbar a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Display available time slots dynamically (optional enhancement)
    const doctorSelect = document.getElementById('doctor');
    if (doctorSelect) {
        doctorSelect.addEventListener('change', function() {
            const selectedDoctor = this.value;
            const selectedDate = document.getElementById('date').value;
            if (selectedDoctor && selectedDate) {
                updateAvailableTimeSlots(selectedDoctor, selectedDate);
            }
        });
    }
    
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            const selectedDate = this.value;
            const selectedDoctor = doctorSelect ? doctorSelect.value : '';
            if (selectedDoctor && selectedDate) {
                updateAvailableTimeSlots(selectedDoctor, selectedDate);
            }
        });
    }
    
    function updateAvailableTimeSlots(doctor, date) {
        // Get all booked times for this doctor on this date
        const bookedTimes = appointments
            .filter(app => app.doctor === doctor && app.date === date)
            .map(app => app.time);
        
        const timeInput = document.getElementById('time');
        if (timeInput && bookedTimes.includes(timeInput.value)) {
            showNotification('This time slot is already booked. Please choose another time.', 'warning');
        }
    }
    
    // Function to cancel appointment (can be extended)
    window.cancelAppointment = function(appointmentId) {
        const index = appointments.findIndex(app => app.id === appointmentId);
        if (index !== -1) {
            appointments.splice(index, 1);
            localStorage.setItem('appointments', JSON.stringify(appointments));
            showNotification('Appointment cancelled successfully.', 'success');
            return true;
        }
        return false;
    };
    
    console.log('Appointment Scheduler initialized successfully!');
});
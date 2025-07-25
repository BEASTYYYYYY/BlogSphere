// config/emailTransporter.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create a transporter using SMTP
// For Gmail, you would typically use an App Password if 2-Step Verification is enabled.
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,    // Your "noreply" email address
        pass: process.env.EMAIL_APP_PASS // Your generated App Password for Gmail
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    }
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.error('Nodemailer Transporter Error:', error);
    } else {
        console.log('Nodemailer Transporter ready to send emails');
    }
});

export default transporter;
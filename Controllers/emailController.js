import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendReport = async (req, res) => {
  try {
    // Check if files or body data is present
    if (!req.file && !req.body.file) {
      return res.status(400).json({ success: false, message: 'No report file provided' });
    }

    const { clientEmail, campaignName, message } = req.body;

    if (!clientEmail) {
      return res.status(400).json({ success: false, message: 'Client email is required' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: clientEmail,
        subject: `Campaign Report: ${campaignName}`,
        text: message || `Please find attached the report for campaign: ${campaignName}`,
        attachments: []
    };

    // Check for email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing EMAIL_USER or EMAIL_PASS in environment variables');
      return res.status(500).json({ success: false, message: 'Server email configuration missing' });
    }

    // Handle file attachment
    if (req.file) {
        // If uploaded via multer
        mailOptions.attachments.push({
            filename: req.file.originalname,
            path: req.file.path
        });
    } else {
        console.log('No file in request');
    }

    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully', info.messageId);
    if (nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    }

    // Cleanup file if uploaded via multer locally
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
            if(err) console.error("Error deleting temp file:", err);
        });
    }

    res.status(200).json({ success: true, message: 'Report sent successfully' });

  } catch (error) {
    console.error('Email send error details:', error);
    
    if (error.responseCode === 535) {
        return res.status(401).json({ 
            success: false, 
            message: 'Email authentication failed. Please check your App Password.' 
        });
    }

    res.status(500).json({ 
        success: false, 
        message: 'Failed to send email', 
        error: error.message 
    });
  }
};

const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve the HTML site from /public folder

// ---- MONGODB SCHEMA ----
const contactSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     { type: String },
  company:   { type: String },
  service:   { type: String },
  message:   { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ---- NODEMAILER (Gmail) SETUP ----
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // your Gmail address
    pass: process.env.GMAIL_APP_PASS   // Gmail App Password (not your login password)
  }
});

// ---- CONTACT FORM ENDPOINT ----
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  try {
    // 1. Save to MongoDB
    const newContact = new Contact({ name, email, phone, company, service, message });
    await newContact.save();

    // 2. Send email notification to the business Gmail
    await transporter.sendMail({
      from: `"Website Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Enquiry from ${name} | Vijaya Varma & Co`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Name</strong></td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Email</strong></td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Phone</strong></td><td style="padding:8px;border:1px solid #ddd">${phone || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Company</strong></td><td style="padding:8px;border:1px solid #ddd">${company || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Service Interested In</strong></td><td style="padding:8px;border:1px solid #ddd">${service || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Message</strong></td><td style="padding:8px;border:1px solid #ddd">${message}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd"><strong>Submitted At</strong></td><td style="padding:8px;border:1px solid #ddd">${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</td></tr>
        </table>
      `
    });

    // 3. Send auto-reply to the person who submitted
    await transporter.sendMail({
      from: `"Vijaya Varma & Co" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting Vijaya Varma & Co`,
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to <strong>Vijaya Varma & Co</strong>. We have received your enquiry and our team will get back to you within 1-2 business days.</p>
        <p>For urgent matters, please call us at <strong>+91 9493774466</strong> or <strong>0884-2367464</strong>.</p>
        <br>
        <p>Warm regards,<br><strong>Vijaya Varma & Co</strong><br>Marine Cargo Surveyors<br>Kakinada & Visakhapatnam</p>
      `
    });

    res.json({ success: true, message: 'Your message has been sent successfully!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error. Please try again later.' });
  }
});

// ---- CONNECT MONGODB & START SERVER ----
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT || 3000}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));

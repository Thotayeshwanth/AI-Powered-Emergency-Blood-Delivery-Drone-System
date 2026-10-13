import { query } from '../config/database.js';
import { sendContactEmails } from '../services/emailService.js';

export async function submitContact(req, res) {
  try {
    const { fullName, email, organizationName, organizationType, subject, message, consent } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const result = await query(
      `INSERT INTO contact_inquiries 
       (full_name, email, organization_name, organization_type, subject, message, consent_given, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        email,
        organizationName,
        organizationType,
        subject,
        message,
        consent !== undefined ? Boolean(consent) : true,
        ipAddress
      ]
    );

    // Send emails asynchronously
    sendContactEmails({
      fullName,
      email,
      organizationName,
      organizationType,
      subject,
      message
    }).catch((e) => console.error('Contact email sending error:', e.message));

    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully. A confirmation email has been dispatched to your inbox.',
      inquiryId: result.insertId
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

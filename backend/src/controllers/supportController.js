import { askGemini } from '../services/geminiSupportService.js';
import { query } from '../config/database.js';

export const handleChat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.'
      });
    }

    const trimmed = message.trim();
    if (trimmed.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message must not exceed 1000 characters.'
      });
    }

    const botReply = await askGemini(trimmed, conversationHistory || []);

    return res.json({
      success: true,
      reply: botReply,
      source: process.env.GEMINI_API_KEY ? 'lifedrone-ai-service' : 'lifedrone-engine',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Support Chat Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process support chat request.'
    });
  }
};

export const handleCallbackRequest = async (req, res) => {
  try {
    const { name, phone, hospitalOrBank, urgency, reason } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and contact phone number are required.'
      });
    }

    // Save as contact inquiry / callback request in MySQL
    await query(
      `INSERT INTO contact_inquiries (full_name, email, organization_name, organization_type, subject, message, is_consent_given)
       VALUES (?, ?, ?, 'Hospital', ?, ?, TRUE)`,
      [
        name.trim(),
        `${phone.replace(/\D/g, '')}@telecom.lifedrone.local`,
        hospitalOrBank || 'Direct Hotline Caller',
        `[URGENT CALLBACK] ${urgency || 'HIGH'} - ${phone}`,
        `Urgent callback requested for LifeDrone operations.\nPhone: ${phone}\nOrganization: ${hospitalOrBank || 'N/A'}\nReason: ${reason || 'Immediate dispatch support requested'}`
      ]
    );

    return res.json({
      success: true,
      message: 'Callback request registered with LifeDrone 24/7 Command Desk. An operations officer will contact you within 2 minutes.'
    });
  } catch (error) {
    console.error('[Support Callback Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register callback request.'
    });
  }
};

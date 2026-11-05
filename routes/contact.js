const router = require('express').Router();
const db = require('../lib/db');
const { sendLeadMail } = require('../lib/email');

router.post('/', async (req, res) => {
  try {
    const { name = '', email = '', phone = '', subject = '', message = '' } = req.body || {};
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      return res.status(400).json({ error: 'Name, email, phone and message are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email.' });
    if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) return res.status(400).json({ error: 'Invalid phone number.' });

    const lead = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject.trim() || null,
      message: message.trim(),
      status: 'new',
    };
    await db.saveContact(lead);
    console.log('[lead] New contact saved →', JSON.stringify(lead));
    sendLeadMail('AGREXA lead: ' + (lead.subject || 'New enquiry'), lead); // async, never blocks the reply
    // WhatsApp Business API integration point:
    // if (process.env.WHATSAPP_TOKEN) await notifySalesOnWhatsApp(lead);
    res.json({ ok: true, message: 'Thank you! Our team will contact you within 24 hours.' });
  } catch (err) {
    console.error('[contact]', err);
    res.status(500).json({ error: 'Could not save your details. Please call us at 90147 91483.' });
  }
});

module.exports = router;

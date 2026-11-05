// Optional email notification for contact & dealer leads.
// Enabled only when SMTP_HOST/SMTP_USER/SMTP_PASS are configured.
// Zero config needed to run the site — leads are always saved to the DB.
let transporter = null;

function init() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  try {
    // Lazy require so the app runs even if nodemailer is not installed
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    });
    console.log('[email] SMTP ready →', user);
  } catch (err) {
    console.warn('[email] nodemailer not available — email notifications disabled:', err.message);
  }
  return transporter;
}

/**
 * Sends a lead notification email. Resolves silently when SMTP is not
 * configured — never blocks lead saving.
 */
async function sendLeadMail(subject, lead) {
  if (!transporter) init();
  if (!transporter) return { skipped: true };
  const to = process.env.LEAD_MAIL_TO || 'mgowthamreddy2008@gmail.com';
  const body = [
    `Name:    ${lead.name}`,
    `Email:   ${lead.email}`,
    `Phone:   ${lead.phone}`,
    `Subject: ${lead.subject || '-'}`,
    '',
    lead.message,
    '',
    `— AGREXA website lead (${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`,
  ].join('\n');
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"AGREXA Website" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: body,
    });
    console.log('[email] lead notification sent:', info.messageId);
    return { ok: true, id: info.messageId };
  } catch (err) {
    console.error('[email] send failed:', err.message);
    return { error: err.message };
  }
}

module.exports = { sendLeadMail };

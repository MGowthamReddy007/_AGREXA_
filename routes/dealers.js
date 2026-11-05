const router = require('express').Router();
const db = require('../lib/db');

router.get('/dealers', async (req, res) => {
  try {
    const dealers = await db.getDealers();
    res.json({ dealers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dealers — dealer/distributor enquiry (becomes a dealer lead)
router.post('/dealers', async (req, res) => {
  try {
    const { name = '', place = '', phone = '', message = '' } = req.body || {};
    if (!name.trim() || !phone.trim()) return res.status(400).json({ error: 'Name and phone are required.' });
    await db.saveDealerEnquiry({ name: name.trim(), place: place.trim() || null, phone: phone.trim(), message: message.trim() || null, status: 'new' });
    console.log('[dealer-lead]', JSON.stringify(req.body));
    res.json({ ok: true, message: 'Enquiry received. Our dealer team will call you shortly.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

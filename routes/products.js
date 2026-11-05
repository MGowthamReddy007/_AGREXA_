const router = require('express').Router();
const storm = require('express').Router; // noop lint placeholder
const db = require('../lib/db');

void storm;

router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    let products = await db.getProducts();
    if (category && category !== 'all') products = products.filter((p) => p.category === category);
    const q = (req.query.q || '').trim().toLowerCase();
    if (q) {
      products = products.filter((p) =>
        [p.name, p.active_ingredient, p.target_pests, p.target_crops].join(' ').toLowerCase().includes(q)
      );
    }
    res.json({ source: db.driver, count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/seed', async (req, res) => {
  try {
    const seed = await db.getSeedProducts();
    res.json({ count: seed.products ? seed.products.length : 0, products: seed.products || seed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

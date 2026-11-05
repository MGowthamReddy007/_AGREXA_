require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const productsRoutes = require('./routes/products');
const contactRoutes = require('./routes/contact');
const pestFinderRoutes = require('./routes/pest-finder');
const dealerRoutes = require('./routes/dealers');
const db = require('./lib/db');
const { listModels } = require('./lib/ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '500kb' }));

app.use('/api/products', productsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api', dealerRoutes);
app.use('/api', pestFinderRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const pages = (slug, title, description, extra = {}) =>
  (req, res) =>
    res.render(slug, {
      slug, title, description,
      metaKeywords: extra.metaKeywords || '',
      ogType: extra.ogType || 'website',
      ...extra,
    });

app.get('/', pages('index', 'Protecting Crops, Sustaining Futures', 'AGREXA — trusted pesticides, biopesticides and eco-friendly crop protection for farmers and dealers in Jogulamba Gadwal, Telangana and Andhra Pradesh.'));
app.get('/about', pages('about', 'About Us', 'AGREXA delivers effective, safe and eco-friendly plant protection with dealer support across Telangana and Andhra Pradesh.'));
app.get('/products', pages('products', 'Product Portfolio', 'Insecticides, herbicides, fungicides and biopesticides from AGREXA — active ingredients, target pests, dosages and pack sizes.', { metaKeywords: 'insecticides, herbicides, fungicides, biopesticides' }));
app.get('/products/:id', async (req, res) => {
  try {
    const all = await db.getProducts();
    const product = all.find((p) => p.id === req.params.id);
    if (!product) return res.redirect('/products');
    res.render('product', {
      slug: 'product', title: product.name, ogType: 'product',
      description: `${product.name} — ${product.active_ingredient}. Targets: ${product.target_pests}.`,
      metaKeywords: product.target_crops,
      product, all,
    });
  } catch { res.redirect('/products'); }
});
app.get('/crop-solutions', pages('crop-solutions', 'Crop Solutions', 'Crop-specific pest guides, seasonal calendars and IPM strategies for rice, cotton, chilli, groundnut, maize, jowar, red gram and vegetables.'));
app.get('/safety', pages('safety', 'Safety & Compliance', 'Safe handling, storage and disposal of pesticides, PPE guidance, residue management and Indian regulations.'));
app.get('/pest-finder', pages('pest-finder', 'AI Pest Finder', 'Describe symptoms + crop; get pest identification, severity, dosage protocol, safety steps and IPM plan. Free engine, LLM optional.'));
app.get('/resources', pages('resources', 'Farmer Resources', 'Pest identification gallery, FAQs, training & workshops and the AGREXA dealer locator.'));
app.get('/contact', pages('contact', 'Contact Us', 'Call, WhatsApp, email or visit AGREXA in Jogulamba Gadwal. Phone 90147 91483, email mgowthamreddy2008@gmail.com.'));
app.get('/blog', pages('blog', 'News & Blog', 'AGREXA field notes: new formulations, research collaborations and farmer success stories.'));
app.get('/dealer', (req, res) => res.render('dealer', {
  slug: 'dealer', title: 'Become a Dealer', description: 'Apply for an AGREXA dealership — consistent supply, honest margins, farmer-first support.',
  metaKeywords: 'pesticide dealership Telangana, distributorship Andhra Pradesh',
}));

// clean-URL fallback for stray .html requests
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), () => res.status(404).send('Not found'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  const dbStr = process.env.SUPABASE_URL ? 'Supabase' : 'local JSON files';
  const llm = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY;
  void listModels;
  console.log(`AGREXA live on http://localhost:${PORT}`);
  console.log(`  Storage: ${dbStr}`);
  console.log(`  Pest Finder brain: ${llm ? 'LLM API' : 'built-in agronomy engine (set an API key in .env for LLM)'}`);
});

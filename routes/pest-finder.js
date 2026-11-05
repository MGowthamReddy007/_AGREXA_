const router = require('express').Router();
const db = require('../lib/db');
const { askLLM, listModels } = require('../lib/ai');
const { diagnose } = require('../lib/engine');

// GET /api/models — which AI models are configured (client shows them in the selector)
router.get('/models', (req, res) => {
  const models = listModels().filter((m) => m.available);
  res.json({
    models,
    engine_available: true,
    note: 'Always-on built-in agronomy engine is used when no LLM is configured.',
  });
});

// POST /api/pest-finder — the multi-model AI recommendation endpoint
router.post('/pest-finder', async (req, res) => {
  try {
    const { crop = 'all', symptoms = '', pest = '', language = 'en', model = '' } = req.body || {};
    if (!symptoms.trim() || symptoms.trim().length < 8) {
      return res.status(400).json({ error: 'Describe the symptoms in a few words (e.g. yellow patches starting from leaf tips).' });
    }

    const langName = { en: 'English', te: 'Telugu', hi: 'Hindi' }[language] || 'English';
    const products = await db.getProducts();
    const productHint = products
      .map((p) => `- ${p.name} | ${p.category} | active: ${p.active_ingredient} | targets: ${p.target_pests} | crops: ${p.target_crops} | dose: ${p.dosage}`)
      .join('\n');
    const cropFriendly = crop === 'all' ? 'any crop' : crop.replace(/-/g, ' ');

    const system = `You are AGREXA's senior agronomist for Telangana & Andhra Pradesh, India ( Gadwal region). You advise farmers and dealers on crop protection.
Rules:
- Recommend ONLY from AGREXA's catalogue (listed below) or IPM/ecological practices.
- Never invent registration numbers or prices. Say "contact dealer for price".
- Be specific about dosage per litre/per acre and water volume (200 L/acre standard knapsack).
- Safety is mandatory: always list PPE, pre-harvest interval and environmental cautions.
- Answer ENTIRELY in ${langName} unless technical terms have no good translation (then keep the English term in brackets).
Return JSON only, with exactly these keys:
{"pest_identified":"...","severity":"low|moderate|high|critical","confidence":"high|moderate|low","application_protocol":"...","dosage_mixing":"...","safety_precautions":"...","ipm":"...","additional_tips":"..."}
Each text value should be 2-5 sentences, farmer-friendly language directly actionable, no markdown formatting inside values.

AGREXA catalogue:
${productHint}`;

    const user = `Crop: ${cropFriendly}
Reported symptoms: ${symptoms.trim()}
${pest.trim() ? `Farmer's best guess of the pest/disease: ${pest.trim()}\n` : ''}Farmer/dealer location region: Jogulamba Gadwal, Telangana.
Identify the single most likely pest or disease, set severity, and give the complete recommendation.`;

    let result = null;
    let modelUsed = 'agrexa-agro-engine';
    let isAI = false;

    const llm = await askLLM(user, system, model);
    if (llm) {
      try {
        // LLMs like to wrap JSON in code fences — strip them
        const cleaned = llm.text.replace(/```json|```/g, '').trim();
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        const parsed = JSON.parse(cleaned.slice(start, end + 1));
        if (parsed.pest_identified) {
          result = parsed;
          modelUsed = llm.model;
          isAI = true;
        }
      } catch {
        // fall through to engine
      }
    }

    if (!result) {
      const eng = diagnose({ crop, symptoms });
      const productsById = Object.fromEntries(products.map((p) => [p.id, p]));
      result = {
        pest_identified: eng.diagnosis,
        severity: eng.severity,
        confidence: 'moderate',
        application_protocol: eng.action,
        dosage_mixing: eng.dosing,
        safety_precautions: eng.safety,
        ipm: Array.isArray(eng.ipm) ? eng.ipm.join(' • ') : String(eng.ipm),
        additional_tips: eng.tips || eng.residual,
        matched_products: (eng.product_ids || []).map((id) => ({
          id,
          name: productsById[id]?.name || id,
          category: productsById[id]?.category || '',
        })),
      };
    }

    // Save every recommendation for analytics (works with or without Supabase)
    try {
      await db.saveRecommendation({
        name: req.body.name || null,
        phone: req.body.phone || null,
        email: req.body.email || null,
        crop: crop || 'all',
        symptoms: symptoms.trim(),
        pest: result.pest_identified,
        language,
        model_used: modelUsed,
        is_ai: isAI,
        result,
      });
    } catch (saveErr) {
      console.error('[pest-finder] save failed:', saveErr.message);
    }

    res.json({ ok: true, is_ai: isAI, model_used: modelUsed, result });
  } catch (err) {
    console.error('[pest-finder]', err);
    res.status(500).json({ error: 'The advisor could not process your request. Please try again or call 90147 91483 for free expert help.' });
  }
});

module.exports = router;

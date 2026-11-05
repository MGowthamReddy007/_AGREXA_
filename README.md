# AGREXA Live — full-stack site

**Protecting Crops, Sustaining Futures.** Express + Supabase + AI Pest Finder + trilingual i18n (English / తెలుగు / हिन्दी).

## Run locally

```bash
npm install
npm start        # http://localhost:3000
```

Works **immediately with zero configuration** — pages render, APIs respond, the AI Pest Finder uses the built-in agronomy engine, and every submission/recommendation is saved to `data/*.json`.

## Go fully online

1. **Supabase (free):** create a project → SQL editor → paste `supabase/schema.sql` → copy project URL + **service_role** key.
2. `.env`:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJ...
   ```
3. **AI models (optional):** add any key to `.env`:
   - `GROQ_API_KEY` (free tier, console.groq.com)
   - `GEMINI_API_KEY` (free tier, aistudio.google.com)
   - `OPENAI_API_KEY` (`gpt-4o`) / `ANTHROPIC_API_KEY` (`claude-sonnet-4`) / `DEEPSEEK_API_KEY`
   - The Pest Finder shows configured models in its picker; built-in engine stays as the always-on fallback.

## Pages

`/` home · `/about` · `/products` (search + filter) · `/products/:id` detail · `/crop-solutions` · `/safety` · `/pest-finder` · `/resources` (pest gallery, FAQ, training, dealer locator) · `/contact` (form → DB + console log) · `/blog` · `/dealer` (enquiry → DB).

## APIs

| Endpoint | Method | What it does |
|---|---|---|
| `/api/products` | GET | Product list (optional `?category=` `&q=`) |
| `/api/contact` | POST | Saves contact lead (Supabase or JSON), logs to console |
| `/api/dealers` | GET/POST | Dealer list / dealer enquiry lead |
| `/api/models` | GET | AI models available (keys present?) |
| `/api/pest-finder` | POST | 8-point recommendation (LLM or engine), saved to DB |

## Pest Finder answer format (all 8 sections)

`pest_identified` · `severity` · `confidence` · `application_protocol` · `dosage_mixing` · `safety_precautions` · `ipm` · `additional_tips` (+ `matched_products` from the engine, saved verbatim as JSON in `pest_recommendations` for analytics).

## Product data

28 formulations live in `data/products.json` with real active ingredients, targets, dosages, layouts and pack sizes. `reg_no` and `price_note` carry `[CIB&RC REG NO]` / `[PRICE]` placeholders — **send the real registration numbers and MRPs and we swap them in** (no legal claims invented in the meantime).

## Design

Light agriculture palette — leaf `#2E7D32`, deep `#1B5E20`, soil `#5D4037`, white; Poppins + Noto Sans Telugu/Devanagari; furrow-line motif. Mobile-first with bottom action bar (Call / WhatsApp / AI Pest Finder) and floating WhatsApp button. `prefers-reduced-motion` respected.

## Images

See `ASSETS.md` for the photo replacement checklist.

## Deployment notes

Any Node host (Render/Railway/VPS) runs `npm start`. For WhatsApp Business API: send/notify hooks are stubbed in `routes/contact.js` — wire `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` when ready. Instagram link already wired in footer.

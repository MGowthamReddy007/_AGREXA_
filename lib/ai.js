// Provider-agnostic LLM adapter for the AI Pest Finder.
// Tries configured providers in order; returns null if none configured so the
// local agronomy engine can take over. All providers become OpenAI-compatible
// JSON chat calls, except Anthropic and Gemini which use their native APIs.
const e = (k) => process.env[k] || '';

const providers = [
  { id: 'gpt-4o',            name: 'OpenAI GPT-4o',      key: () => e('OPENAI_API_KEY'),      run: runOpenAI },
  { id: 'claude-sonnet-4',   name: 'Claude Sonnet 4',    key: () => e('ANTHROPIC_API_KEY'),  run: runClaude },
  { id: 'gemini-2.5-pro',    name: 'Gemini 2.5 Pro',     key: () => e('GEMINI_API_KEY'),     run: runGemini },
  { id: 'deepseek-chat',     name: 'DeepSeek',           key: () => e('DEEPSEEK_API_KEY'),   run: runOpenAI },
  { id: 'groq-oss-120b',     name: 'Groq GPT-OSS 120B',  key: () => e('GROQ_API_KEY'),       run: runOpenAI },
  { id: 'free-openrouter',   name: 'OpenRouter (free)',  key: () => e('OPENROUTER_API_KEY'), run: runOpenAI },
];

const ROUTES = {
  'gpt-4o':            { url: 'https://api.openai.com/v1/chat/completions',        model: 'gpt-4o',                       kinds: 'openai' },
  'deepseek-chat':     { url: 'https://api.deepseek.com/chat/completions',          model: 'deepseek-chat',                kinds: 'openai' },
  'groq-oss-120b':     { url: 'https://api.groq.com/openai/v1/chat/completions',    model: 'openai/gpt-oss-120b',          kinds: 'openai' },
  'free-openrouter':   { url: 'https://openrouter.ai/api/v1/chat/completions',      model: 'meta-llama/llama-3.3-70b-instruct:free', kinds: 'openai' },
};

async function runOpenAI(prompt, system, provider) {
  const r = ROUTES[provider.id];
  const res = await fetch(r.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.key()}`,
    },
    body: JSON.stringify({
      model: r.model,
      temperature: 0.4,
      max_tokens: 2200,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${provider.name} HTTP ${res.status}`);
  const j = await res.json();
  return j.choices[0].message.content;
}

async function runClaude(prompt, system, provider) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.key(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2400,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
  const j = await res.json();
  return j.content[0].text;
}

async function runGemini(prompt, system, provider) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${provider.key()}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: system }] },
        generationConfig: { temperature: 0.4, maxOutputTokens: 2400 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
  const j = await res.json();
  return j.candidates[0].content.parts.map((p) => p.text).join('');
}

function listModels() {
  return providers.map((p) => ({ id: p.id, name: p.name, available: !!p.key() }));
}

async function askLLM(prompt, system, preferred) {
  for (const p of providers) {
    if (!p.key()) continue;
    if (preferred && p.id !== preferred) continue;
    try {
      const text = await p.run(prompt, system, p);
      return { text, model: p.id };
    } catch (err) {
      console.error(`[ai] ${p.id} failed:`, err.message);
      if (preferred) return null;
    }
  }
  return null;
}

module.exports = { askLLM, listModels };

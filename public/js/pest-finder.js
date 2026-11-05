// AI Pest Finder front-end: model selector load + 8-section result rendering
(async function () {
  const form = document.getElementById('pf-form');
  const out = document.getElementById('pf-out');
  const picker = document.getElementById('model-picker');
  const btn = document.getElementById('pf-btn');
  if (!form) return;

  // Load configured LLM models from server
  try {
    const { models } = await (await fetch('/api/models')).json();
    if (models && models.length) {
      picker.querySelector('em, .free-note');
      const builtIn = document.createElement('label');
      builtIn.innerHTML = '<input type="radio" name="model" value="" checked>⚡ Built-in agro engine <em style="color:var(--ink-2);font-style:normal">— instant, free, always on</em>';
      picker.prepend(builtIn);
      picker.firstElementChild.classList.add('on');
      models.forEach((m) => {
        const l = document.createElement('label');
        l.innerHTML = `<input type="radio" name="model" value="${m.id}">🧠 ${m.name} <em style="color:var(--ink-2);font-style:normal">— deepest reasoning</em>`;
        picker.appendChild(l);
      });
      picker.addEventListener('change', (e) => {
        picker.querySelectorAll('label').forEach((l) => l.classList.toggle('on', l.contains(e.target)));
      });
    }
  } catch { /* picker stays engine-only */ }

  function bar(r) {
    const map = { low: ['sev on-low', '🟢 Low'], moderate: ['sev on-mod', '🟡 Moderate'], high: ['sev on-high', '🔴 High'], critical: ['sev on-high', '🚨 Critical'] };
    const [cls, label] = map[r.severity] || map.moderate;
    return (['low', 'moderate', 'high', 'critical']).map((s) =>
      `<span class="sev ${s === r.severity ? (map[s][0]) : ''}" ${s === r.severity ? 'style="cursor:default"' : ''}>${s === r.severity ? label : (map[s] ? map[s][1].replace(/^\S+\s/, '') : s)}</span>`).join('');
  }

  function block(icon, title, text) {
    return `<div class="pf-block"><h4><span class="dot"></span>${icon} ${title}</h4><p>${text}</p></div>`;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {
      crop: fd.get('crop'),
      symptoms: fd.get('symptoms'),
      pest: fd.get('pest') || '',
      language: fd.get('language'),
      model: fd.get('model') || '',
      name: fd.get('name') || '',
      phone: fd.get('phone') || '',
      email: fd.get('email') || '',
    };
    if (!payload.symptoms || payload.symptoms.trim().length < 8) {
      AGREXA.toast('Please describe symptoms in a few words first.', false);
      return;
    }
    btn.disabled = true;
    btn.querySelector('span').textContent = AGREXA.lang() === 'te' ? 'లక్షణాలు విశ్లేషిస్తున్నాం…' : AGREXA.lang() === 'hi' ? 'लक्षणों का विश्लेषण…' : 'Analyzing symptoms…';
    const old = document.getElementById('pf-result');

    const spinner = document.createElement('div');
    spinner.className = 'callout';
    spinner.innerHTML = '<h3>⏳ Preparing your report…</h3><p style="margin-top:8px">Scanning symptom patterns against the AGREXA library.</p>';
    if (old) old.remove();
    document.getElementById('pf-wait').style.display = 'none';
    out.appendChild(spinner);

    try {
      const { is_ai, model_used, result } = await AGREXA.postJSON('/api/pest-finder', payload);
      spinner.remove();
      const lang = AGREXA.lang();
      const T = {
        en: { who: 'Advisor brain:', ipm: 'IPM (Integrated Pest Management) plan', proto: 'Application protocol', dose: 'Dosage & mixing', safety: 'Safety precautions', tips: 'Additional tips', matched: 'Matched products', save: 'Report saved. Our agronomy team can follow up if you left contact details.' },
        te: { who: 'సలహా మెదడు:', ipm: 'IPM (అనుకలిత తెగులు నిర్వహణ) పథకం', proto: 'చల్లే పద్ధతి', dose: 'మోతాదు & కలపడం', safety: 'భద్రతా జాగ్రత్తలు', tips: 'అదనపు సూచనలు', matched: 'సరిపోయే ఉత్పత్తులు', save: 'రిపోర్ట్ సేవ్ అయింది. మీ సంప్రదింపు వివరాలు ఇచ్చి ఉంటే మా టీమ్ ఫాలో-అప్ చేస్తుంది.' },
        hi: { who: 'सलाहकार मस्तिष्क:', ipm: 'IPM (एकीकृत कीट प्रबंधन) योजना', proto: 'छिड़काव प्रोटोकॉल', dose: 'मात्रा & मिश्रण', safety: 'सुरक्षा सावधानियां', tips: 'अतिरिक्त सुझाव', matched: 'सज्जित उत्पाद', save: 'रिपोर्ट सेव. यदि संपर्क विवरण दिए हैं तो हमारी टीम फॉलो-अप करेगी.' },
      }[lang] || { en: {} };

      const matched = (result.matched_products || []).map((p) =>
        `<a class="card" style="padding:16px" href="/products/${p.id}"><span class="cat-tag tag-${p.category}" style="position:static;margin:0 0 8px;display:inline-block">${p.category}</span><h3 style="font-size:.98rem">${p.name}</h3></a>`).join('');

      const el = document.createElement('div');
      el.id = 'pf-result';
      el.style.display = 'grid'; el.style.gap = '16px';
      el.innerHTML = `
        <div class="pf-block" style="border-left:6px solid var(--leaf)">
          <h4><span class="dot"></span>🎯 Pest / disease identified</h4>
          <p style="font-size:1.1rem;font-weight:600;margin-bottom:6px">${result.pest_identified}</p>
          <div class="bars">${bar(result)}</div>
          <p class="form-note">${T.who} <b>${is_ai ? model_used : 'Agrexa agro engine'}</b>${result.confidence ? ' · confidence: ' + result.confidence : ''}</p>
        </div>
        ${block('🧭', T.proto, result.application_protocol)}
        ${block('⚖️', T.dose, result.dosage_mixing)}
        ${block('🧤', T.safety, result.safety_precautions)}
        ${block('🌱', T.ipm, result.ipm)}
        ${block('💡', T.tips, result.additional_tips)}
        ${matched ? `<div class="pf-block" style="background:var(--seedling);border-color:#D7E8D8"><h4><span class="dot"></span>🛒 ${T.matched}</h4><div class="pf-cards">${matched}</div></div>` : ''}
        <p class="booking-note">💾 ${T.save}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn-green btn-sm" href="https://wa.me/919014791483" target="_blank" rel="noopener">Confirm with our agronomist on WhatsApp</a>
          <button type="button" class="btn btn-line btn-sm" onclick="location.reload()">New consultation</button>
        </div>`;
      out.appendChild(el);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      AGREXA.toast('Recommendation ready.');
    } catch (err) {
      spinner.remove();
      document.getElementById('pf-wait').style.display = '';
      AGREXA.toast(err.message || 'Something went wrong. Call 90147 91483 for free help.', false);
    } finally {
      btn.disabled = false;
      btn.querySelector('span').textContent = AGREXA.lang() === 'te' ? 'సిఫార్సు పొందండి' : AGREXA.lang() === 'hi' ? 'सलाह पाएं' : 'Get Recommendation';
    }
  });
})();

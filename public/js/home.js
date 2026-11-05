// Home page: featured products + season alert from /api
(function () {
  const box = document.getElementById('featured-products');
  if (!box) return;
  const CATS = { insecticide: ['Insecticide', '🐛', 'tag-insecticide'], herbicide: ['Herbicide', '🌿', 'tag-herbicide'], fungicide: ['Fungicide', '🍄', 'tag-fungicide'], biopesticide: ['Biopesticide', '🌍', 'tag-biopesticide'] };
  const want = (box.dataset.ids || '').split(',').filter(Boolean);

  fetch('/api/products').then((r) => r.json()).then(({ products }) => {
    const picks = want.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);
    (picks.length ? picks : products.slice(0, 4)).forEach((p, i) => {
      const c = CATS[p.category] || CATS.insecticide;
      const extra = i === 0
        ? `<p class="p-desc">${p.description}</p><span class="p-pack">Pack sizes: ${p.pack_sizes}</span>`
        : '';
      const el = document.createElement('article');
      el.className = 'card p-card';
      el.innerHTML = `
        <a href="/products/${p.id}" aria-label="${p.name}"><span class="cat-tag ${c[2]}">${c[0]}</span><span class="topline" style="top:0;z-index:0"></span></a>
        <div class="body">
          <a href="/products/${p.id}"><h3>${p.name}</h3></a>
          <span class="ing">${p.active_ingredient}</span>
          ${extra}
          <span class="meta">${c[1]} ${p.target_crops.split(',')[0].trim()} · dose: ${p.dosage.split('(')[0].trim()}</span>
          <a class="card-link" style="margin-top:auto" href="/products/${p.id}">Details</a>
        </div>`;
      box.appendChild(el);
    });
  }).catch(() => {});
})();

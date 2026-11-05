// Products page: load from /api/products, client-side search + category filter
(function () {
  const API = querystring('category') || 'all';
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  const q = document.getElementById('q');
  window.PRODUCTS = [];
  const CATS = { insecticide: ['Insecticide', 'tag-insecticide', '🐛'], herbicide: ['Herbicide', 'tag-herbicide', '🌿'], fungicide: ['Fungicide', 'tag-fungicide', '🍄'], biopesticide: ['Biopesticide', 'tag-biopesticide', '🌍'] };

  function querystring(k) {
    return new URLSearchParams(location.search).get(k);
  }

  function card(p) {
    const c = CATS[p.category] || CATS.insecticide;
    const el = document.createElement('article');
    el.className = 'card p-card';
    el.innerHTML = `
      <a href="/products/${p.id}"><span class="cat-tag ${c[1]}">${c[0]}</span><span class="topline" style="top:0;z-index:0"></span></a>
      <div class="body">
        <a href="/products/${p.id}"><h3>${p.name}</h3></a>
        <span class="ing">${p.active_ingredient}</span>
        <span class="meta">${c[2]} <b>Targets:</b> ${p.target_pests}</span>
        <span class="meta">🌾 <b>Crops:</b> ${p.target_crops}</span>
        <a class="card-link" style="margin-top:auto" href="/products/${p.id}">Full details &amp; dosage</a>
      </div>`;
    return el;
  }

  function render(list, label) {
    grid.innerHTML = '';
    list.forEach((p) => grid.appendChild(card(p)));
    count.textContent = list.length + (list.length === 1 ? ' product' : ' products') + label;
    empty.style.display = list.length ? 'none' : 'block';
  }

  function apply() {
    const text = q.value.trim().toLowerCase();
    const cat = document.querySelector('#cat-filters .btn-green')?.dataset.cat || API;
    const list = window.PRODUCTS.filter((p) => (cat === 'all' || p.category === cat) &&
      (!text || [p.name, p.active_ingredient, p.target_pests, p.target_crops].join(' ').toLowerCase().includes(text)));
    render(list, list.length ? (text ? ` for “${text}”` : '') : '');
  }

  document.querySelectorAll('#cat-filters button').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#cat-filters button').forEach((o) => { o.className = 'btn btn-line btn-sm'; });
      b.className = 'btn btn-green btn-sm';
      apply();
    })
  );
  let t;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(apply, 180); });

  fetch('/api/products').then((r) => r.json()).then(({ products }) => {
    window.PRODUCTS = products;
    if (API !== 'all') {
      const b = document.querySelector(`button[data-cat="${API}"]`);
      if (b) { document.querySelectorAll('#cat-filters button').forEach((o) => (o.className = 'btn btn-line btn-sm')); b.className = 'btn btn-green btn-sm'; }
    }
    apply();
  });
})();

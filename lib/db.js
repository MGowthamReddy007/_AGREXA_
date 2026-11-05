// Storage: Supabase when SUPABASE_URL + SUPABASE_SERVICE_KEY are set,
// otherwise a zero-config local JSON store (data/*.json) so the site runs immediately.
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'data');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
const supabase = url && key ? createClient(url, key) : null;

const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8')); }
  catch { return fallback; }
};
// products.json may be a bare array or wrapped as { products: [...] }
const unwrapProducts = (raw) => Array.isArray(raw) ? raw : (raw && Array.isArray(raw.products) ? raw.products : []);
const writeJson = (file, rows) => {
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(rows, null, 2));
};

module.exports = {
  driver: supabase ? 'supabase' : 'json',

  async getProducts() {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error && data && data.length) return data;
    }
    return unwrapProducts(readJson('products.json', []));
  },

  async getSeedProducts() {
    return unwrapProducts(readJson('products.json', []));
  },

  async getDealers() {
    if (supabase) {
      const { data, error } = await supabase.from('dealers').select('*');
      if (!error && data && data.length) return data;
    }
    return readJson('dealers.json', []);
  },

  async saveContact(lead) {
    if (supabase) {
      const { error } = await supabase.from('contacts').insert(lead);
      if (error) throw new Error(error.message);
      return;
    }
    const rows = readJson('contacts.json', []); rows.push({ ...lead, created_at: new Date().toISOString() });
    writeJson('contacts.json', rows);
  },

  async saveDealerEnquiry(lead) {
    if (supabase) {
      const { error } = await supabase.from('dealer_enquiries').insert(lead);
      if (error) throw new Error(error.message);
      return;
    }
    const rows = readJson('dealer_enquiries.json', []); rows.push({ ...lead, created_at: new Date().toISOString() });
    writeJson('dealer_enquiries.json', rows);
  },

  async saveRecommendation(rec) {
    if (supabase) {
      const { error } = await supabase.from('pest_recommendations').insert(rec);
      if (error) throw new Error(error.message);
      return;
    }
    const rows = readJson('pest_recommendations.json', []); rows.push({ ...rec, created_at: new Date().toISOString() });
    writeJson('pest_recommendations.json', rows);
  },
};

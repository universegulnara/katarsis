const https = require('https');
const fs = require('fs');

const GAS_URL = process.env.GAS_URL || 'ВСТАВЬТЕ_URL_ДЛЯ_GET';
const HTML_FILE = 'index.html';

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' }
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

function escReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceMarker(html, key, value) {
  const re = new RegExp(`<!--\\s*${escReg(key)}\\s*-->.*?<!--\\s*/\\s*${escReg(key)}\\s*-->`, 'gs');
  const result = html.replace(re, `<!-- ${key} -->${value}<!-- /${key} -->`);
  if (result === html) console.warn('  ⚠️  Marker not found: ' + key);
  return result;
}

function buildSectionStyles(cfg) {
  if (!cfg.sections) return '';
  const rules = [];
  for (const [name, visible] of Object.entries(cfg.sections)) {
    if (visible === false) {
      rules.push('#' + name + ',#' + name + ' .navbar__link[href="#' + name + '"],.footer__link[href="#' + name + '"]{display:none!important}');
      rules.push('.navbar__link[href="#' + name + '"],.footer__link[href="#' + name + '"]{display:none!important}');
    }
  }
  return rules.join(' ');
}

function buildFontVars(cfg) {
  if (!cfg.fonts) return '';
  const body = cfg.fonts.body || "'Inter',sans-serif";
  const heading = cfg.fonts.heading || "'Unbounded',sans-serif";
  return ':root{--font:' + body + ';--font-heading:' + heading + '}';
}

async function main() {
  console.log('📖 Reading ' + HTML_FILE + '…');
  let html = fs.readFileSync(HTML_FILE, 'utf-8');

  console.log('🌐 Fetching config from ' + GAS_URL + '…');
  const cfg = await fetchJSON(GAS_URL + '?t=' + Date.now());

  if (cfg.error) {
    console.error('❌ Config error: ' + cfg.error);
    process.exit(1);
  }
  console.log('✅ Config loaded');

  const keys = [
    'seo.title', 'seo.description', 'seo.keywords', 'seo.ogImage',
    'fonts.googleUrl',
    'contacts.address', 'contacts.phone', 'contacts.workingHours',
    'contacts.telegram', 'contacts.vk', 'contacts.whatsapp',
    'gas_url',
    'analytics.google_id', 'analytics.yandex_id'
  ];
  for (const key of keys) {
    const parts = key.split('.');
    const value = cfg[parts[0]]?.[parts[1]];
    html = replaceMarker(html, key, value != null ? String(value) : '');
  }

  const sectionStyles = buildSectionStyles(cfg);
  const fontVars = buildFontVars(cfg);
  html = replaceMarker(html, 'dynamic-styles', [fontVars, sectionStyles].filter(Boolean).join(' '));

  fs.writeFileSync(HTML_FILE, html, 'utf-8');
  console.log('✅ Saved to ' + HTML_FILE);
}

main().catch(err => {
  console.error('❌ ' + err.message);
  process.exit(1);
});

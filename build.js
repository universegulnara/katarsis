const fs = require('fs');

const GAS_URL = process.env.GAS_URL || '';
const HTML_FILE = 'index.html';

function escReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceMarker(html, key, value) {
  const re = new RegExp(`<!--\\s*${escReg(key)}\\s*-->.*?<!--\\s*/\\s*${escReg(key)}\\s*-->`, 'gs');
  const result = html.replace(re, `<!-- ${key} -->${value}<!-- /${key} -->`);
  if (result === html) console.warn('  ⚠️  Marker not found: ' + key);
  return result;
}

function buildConfigStyles(cfg) {
  const rules = [];
  if (cfg.hero?.opacity != null) {
    rules.push('.hero__image{opacity:' + cfg.hero.opacity + '}');
  }
  const socials = cfg.socials || {};
  for (const [name, visible] of Object.entries(socials)) {
    if (visible === false) {
      rules.push('[data-social="' + name + '"]{display:none!important}');
    }
  }
  return rules.join(' ');
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
  if (!GAS_URL) {
    console.error('❌ GAS_URL not set');
    process.exit(1);
  }

  console.log('📖 Reading ' + HTML_FILE + '…');
  let html = fs.readFileSync(HTML_FILE, 'utf-8');

  console.log('🌐 Fetching config from ' + GAS_URL + '…');
  const res = await fetch(GAS_URL + '?t=' + Date.now());
  if (!res.ok) {
    console.error('❌ HTTP ' + res.status);
    process.exit(1);
  }
  const cfg = await res.json();

  if (cfg.error) {
    console.error('❌ Config error: ' + cfg.error);
    process.exit(1);
  }
  console.log('✅ Config loaded');

  const keys = [
    'seo.title', 'seo.description', 'seo.keywords', 'seo.ogImage',
    'fonts.googleUrl',
    'contacts.address', 'contacts.phone', 'contacts.workingHours',
    'contacts.telegram', 'contacts.vk', 'contacts.whatsapp', 'contacts.instagram',
    'tagline.part1', 'tagline.part2',
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
  const configStyles = buildConfigStyles(cfg);
  html = replaceMarker(html, 'dynamic-styles', [fontVars, configStyles, sectionStyles].filter(Boolean).join(' '));

  fs.writeFileSync(HTML_FILE, html, 'utf-8');
  console.log('✅ Saved to ' + HTML_FILE);
}

main().catch(err => {
  console.error('❌ ' + err.message);
  process.exit(1);
});

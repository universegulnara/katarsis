const fs = require('fs');

const GAS_URL = process.env.GAS_URL || '';
const FILES = ['index.html', '404.html', 'update.html', 'privacy.html'];

function escReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceMarker(html, key, value) {
  const re = new RegExp(`<!--\\s*${escReg(key)}\\s*-->.*?<!--\\s*/\\s*${escReg(key)}\\s*-->`, 'gs');
  const result = html.replace(re, `<!-- ${key} -->${value}<!-- /${key} -->`);
  if (result === html) console.warn('  ⚠️  Marker not found: ' + key);
  return result;
}

function replaceJsMarker(html, key, value) {
  const re = new RegExp(`/\\*\\s*${escReg(key)}\\s*\\*/.*?/\\*\\s*/\\s*${escReg(key)}\\s*\\*/`, 'gs');
  const result = html.replace(re, `/* ${key} */${value}/* /${key} */`);
  if (result === html) console.warn('  ⚠️  JS marker not found: ' + key);
  return result;
}

function replaceMarkerHref(html, key, url) {
  const outRe = new RegExp(`(<!--\\s*${escReg(key)}\\s*--><a[^]*?href=")([^"]*)(")`, 'gs');
  let r = html.replace(outRe, '$1' + url + '$3');
  if (r !== html) return r;
  const inRe = new RegExp(`(href=")\\s*<!--\\s*${escReg(key)}\\s*-->.*?<!--\\s*\\/\\s*${escReg(key)}\\s*-->\\s*(")`, 'gs');
  r = html.replace(inRe, `$1${url}$2`);
  if (r !== html) return r;
  console.warn('  ⚠️  Href marker not found: ' + key);
  return html;
}

function replaceTitleMarker(html, key, value) {
  const outRe = new RegExp(`(<!--\\s*${escReg(key)}\\s*-->)\\s*<title>.*?<\\/title>\\s*(<!--\\s*\\/\\s*${escReg(key)}\\s*-->)`, 'gs');
  let r = html.replace(outRe, `$1<title>${value}</title>$2`);
  if (r !== html) return r;
  const inRe = new RegExp(`<title>\\s*<!--\\s*${escReg(key)}\\s*-->.*?<!--\\s*\\/\\s*${escReg(key)}\\s*-->\\s*<\\/title>`, 'gs');
  r = html.replace(inRe, `<!-- ${key} --><title>${value}</title><!-- /${key} -->`);
  if (r !== html) return r;
  console.warn('  ⚠️  Title marker not found: ' + key);
  return html;
}

function replaceMarkerAttr(html, key, value, attr) {
  const outRe = new RegExp(`(<!--\\s*${escReg(key)}\\s*--><[^]*?${attr}=")([^"]*)(")`, 'gs');
  let r = html.replace(outRe, '$1' + value + '$3');
  if (r !== html) return r;
  const inRe = new RegExp(`(${attr}=")\\s*<!--\\s*${escReg(key)}\\s*-->.*?<!--\\s*\\/\\s*${escReg(key)}\\s*-->\\s*(")`, 'gs');
  r = html.replace(inRe, `$1${value}$2`);
  if (r !== html) return r;
  console.warn('  ⚠️  Attr marker not found: ' + key + ' [' + attr + ']');
  return html;
}

function buildConfigStyles(cfg) {
  const rules = [];
  if (cfg.hero?.opacity != null) {
    rules.push('.hero__image{opacity:' + cfg.hero.opacity + '}');
  }
  const socials = cfg.socials || {};
  for (const [name, visible] of Object.entries(socials)) {
    if (visible === false || visible === 'FALSE') {
      rules.push('[data-social="' + name + '"]{display:none!important}');
    }
  }
  return rules.join(' ');
}

function buildSectionStyles(cfg) {
  if (!cfg.sections) return '';
  const rules = [];
  for (const [name, visible] of Object.entries(cfg.sections)) {
    if (visible === false || visible === 'FALSE') {
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

function buildDesignStyles(cfg) {
  const vars = cfg.design || {};
  const map = {
    bgDark: '--bg-dark', bgDarker: '--bg-darker',
    accentPurple: '--accent-purple', accentBlue: '--accent-blue',
    accentPink: '--accent-pink', radius: '--radius'
  };
  const rules = [];
  for (const [key, cssVar] of Object.entries(map)) {
    if (vars[key] != null && vars[key] !== '') rules.push(cssVar + ':' + vars[key]);
  }
  if (rules.length === 0) return '';
  return ':root{' + rules.join(';') + '}';
}

function buildSchema(cfg) {
  const daysMap = {
    'Пн-Вс': 'Mo-Su', 'Пн-Пт': 'Mo-Fr', 'Сб-Вс': 'Sa-Su',
    'Пн': 'Mo', 'Вт': 'Tu', 'Ср': 'We', 'Чт': 'Th', 'Пт': 'Fr', 'Сб': 'Sa', 'Вс': 'Su'
  };
  let openingHours = '';
  if (cfg.contacts?.workingHours) {
    let h = cfg.contacts.workingHours;
    for (const [ru, en] of Object.entries(daysMap)) h = h.replace(ru, en);
    openingHours = h.replace(/ — /g, ' ').replace(/—/g, '-');
  }
  const url = cfg.site?.url || 'https://universegulnara.github.io/katarsis/';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: cfg.content?.heroTitle || 'Катарсис',
    description: cfg.seo?.description || 'Премиальный караоке-бар',
    url: url,
    telephone: cfg.contacts?.phone || '',
    address: { '@type': 'PostalAddress', addressLocality: 'Казань', streetAddress: cfg.contacts?.address || '', addressCountry: 'RU' },
    image: (url.endsWith('/') ? url.slice(0, -1) : url) + '/assets/og-image.png'
  };
  if (openingHours) schema.openingHours = openingHours;
  return JSON.stringify(schema, null, 2);
}

function buildConfigJson(cfg) {
  const o = {
    gasUrl: cfg.gas_url || '',
    ageRedirectUrl: cfg.content?.ageRedirectUrl || '',
    eventAlert: cfg.content?.eventAlert || '',
    formSending: cfg.content?.formSending || '',
    formError: cfg.content?.formError || ''
  };
  return JSON.stringify(o);
}

async function processFile(file, cfg) {
  console.log('📖 ' + file + '…');
  let html = fs.readFileSync(file, 'utf-8');

  const contentKeys = [
    'content.ageText', 'content.ageQuestion', 'content.ageYes', 'content.ageNo',
    'content.ageRedirectUrl', 'content.eventAlert',
    'content.navHome', 'content.navEvents', 'content.navActivities', 'content.navFranchise', 'content.navContacts',
    'content.heroBadge', 'content.heroScroll', 'content.heroTitle',
    'content.btnFeedback', 'content.btnBooking', 'content.btnFranchise', 'content.btnLearnMore',
    'content.btnSendFeedback', 'content.btnSendBooking', 'content.btnSendFranchise',
    'content.eventsTitle', 'content.eventsSubtitle', 'content.eventBadge',
    'content.event1Title', 'content.event1Date', 'content.event1Desc',
    'content.event2Title', 'content.event2Date', 'content.event2Desc',
    'content.activitiesTitle', 'content.activitiesSubtitle',
    'content.act1Title', 'content.act1Desc', 'content.act2Title', 'content.act2Desc',
    'content.act3Title', 'content.act3Desc', 'content.act4Title', 'content.act4Desc',
    'content.act5Title', 'content.act5Desc', 'content.act6Title', 'content.act6Desc',
    'content.advantagesTitle', 'content.advantagesSubtitle',
    'content.adv1Title', 'content.adv1Desc', 'content.adv2Title', 'content.adv2Desc',
    'content.adv3Title', 'content.adv3Desc', 'content.adv4Title', 'content.adv4Desc',
    'content.footerNavTitle', 'content.footerContactsTitle', 'content.footerCopyright',
    'content.footerLinkHome', 'content.footerLinkEvents', 'content.footerLinkActivities', 'content.footerLinkFranchise',
    'content.footerYear',
    'content.modalFeedbackTitle', 'content.modalBookingTitle', 'content.modalFranchiseTitle',
    'content.formName', 'content.formPhone', 'content.formMessage', 'content.formDate',
    'content.formGuests', 'content.formNotes', 'content.formEmail', 'content.formCity',
    'content.formRating', 'content.formConsent', 'content.formConsentLink',
    'content.formSending', 'content.formError',
    'content.successFeedback', 'content.successBooking', 'content.successFranchise',
    'content.logoAlt',
    'content.404top', 'content.404title', 'content.404text', 'content.404sub', 'content.404btn'
  ];

  const plainKeys = [
    'contacts.address', 'contacts.phone', 'contacts.workingHours',
    'tagline.part1', 'tagline.part2',
    'gas_url',
    'analytics.google_id', 'analytics.yandex_id',
    'socials.instagram_note',
    ...contentKeys
  ];

  const socialKeys = ['contacts.telegram', 'contacts.vk', 'contacts.whatsapp', 'contacts.instagram'];

  for (const key of plainKeys) {
    const parts = key.split('.');
    const value = cfg[parts[0]]?.[parts[1]];
    html = replaceMarker(html, key, value != null ? String(value) : '');
  }
  for (const key of socialKeys) {
    const parts = key.split('.');
    const value = cfg[parts[0]]?.[parts[1]];
    html = replaceMarkerHref(html, key, value != null ? String(value) : '#');
  }

  const seoTitle = cfg.seo?.title;
  html = replaceTitleMarker(html, 'seo.title', seoTitle != null ? String(seoTitle) : '');
  for (const key of ['seo.description', 'seo.keywords', 'seo.ogImage']) {
    const parts = key.split('.');
    const value = cfg[parts[0]]?.[parts[1]];
    html = replaceMarkerAttr(html, key, value != null ? String(value) : '', 'content');
  }
  const fontsUrl = cfg.fonts?.googleUrl;
  html = replaceMarkerAttr(html, 'fonts.googleUrl', fontsUrl != null ? String(fontsUrl) : '', 'href');

  const faviconUrl = cfg.content?.faviconUrl;
  if (faviconUrl != null && faviconUrl !== '') {
    html = replaceMarkerAttr(html, 'content.faviconUrl', faviconUrl, 'href');
  }

  const sectionStyles = buildSectionStyles(cfg);
  const fontVars = buildFontVars(cfg);
  const configStyles = buildConfigStyles(cfg);
  const designStyles = buildDesignStyles(cfg);
  const allStyles = [fontVars, configStyles, sectionStyles, designStyles].filter(Boolean).join(' ');
  html = replaceMarker(html, 'dynamic-styles', allStyles);

  const schemaJson = buildSchema(cfg);
  html = replaceMarker(html, 'seo.schema', schemaJson);

  const configJson = buildConfigJson(cfg);
  html = replaceJsMarker(html, 'configJson', configJson);

  const siteUrl = cfg.site?.url || 'https://universegulnara.github.io/katarsis/';
  const canonical = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  html = replaceMarkerAttr(html, 'site.canonical', canonical + (file === 'index.html' ? '/' : '/' + file), 'href');

  const ogUrl = cfg.seo?.ogImage || canonical + '/assets/og-image.png';
  html = replaceMarkerAttr(html, 'seo.ogImage', ogUrl, 'content');

  fs.writeFileSync(file, html, 'utf-8');
  console.log('  ✅ Saved');
}

async function main() {
  if (!GAS_URL) {
    console.error('❌ GAS_URL not set');
    process.exit(1);
  }

  console.log('🌐 Fetching config…');
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

  for (const file of FILES) {
    await processFile(file, cfg);
  }
}

main().catch(err => {
  console.error('❌ ' + err.message);
  process.exit(1);
});

// Server-side templates for the Frita Batidos site.
// Every string of content comes from content.json — nothing user-manageable is hardcoded here.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Multi-line string -> escaped lines joined by <br>
function lines(s) {
  return esc(s).split('\n').map((l) => l.trim()).filter(Boolean).join('<br>');
}

// Multi-line string -> one <p> per blank-line-separated block
function paragraphs(s) {
  return String(s == null ? '' : s)
    .split(/\n\s*\n/)
    .map((b) => `<p>${esc(b.trim())}</p>`)
    .join('\n');
}

// ---------------------------------------------------------------- shared chrome

function banner(content) {
  const b = content.banner;
  if (!b || !b.enabled) return '';
  const links = (b.links || [])
    .map(
      (l) =>
        `<span class="announcement-item">${esc(l.text)} <a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.linkText)}</a></span>`
    )
    .join('');
  return `
  <div class="announcement">
    <p class="announcement-links">${links}</p>
    <p class="announcement-awards">${esc(b.awards)}</p>
  </div>`;
}

function navLinks(content, active, cls) {
  return (content.nav || [])
    .map(
      (n) =>
        `<a href="/${esc(n.slug)}"${n.slug === active ? ' class="active"' : ''}>${esc(n.title.toLowerCase())}</a>`
    )
    .join('\n        ');
}

function siteHeader(content, active) {
  return `
  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a class="header-brand" href="/ann-arbor" aria-label="${esc(content.site.name)} home">
        <img src="/assets/flower-lg.png" alt="">
        <span>${esc(content.site.name)}</span>
      </a>
      <nav class="header-nav" aria-label="Main">
        ${navLinks(content, active)}
      </nav>
      <div class="header-actions">
        <a class="btn btn-primary header-order" href="${esc(content.site.orderOnlineUrl)}" target="_blank" rel="noopener">Order Online</a>
        <button class="menu-toggle" id="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-menu" id="mobile-menu" hidden>
    <nav aria-label="Mobile">
      ${navLinks(content, active)}
    </nav>
    <a class="btn btn-primary" href="${esc(content.site.orderOnlineUrl)}" target="_blank" rel="noopener">Order Online</a>
  </div>
  <script>
    (function () {
      var btn = document.getElementById('menu-toggle');
      var menu = document.getElementById('mobile-menu');
      btn.addEventListener('click', function () {
        var open = !menu.hidden;
        menu.hidden = open;
        btn.classList.toggle('open', !open);
        btn.setAttribute('aria-expanded', String(!open));
        document.body.classList.toggle('menu-open', !open);
      });
    })();
  </script>`;
}

function socialIcons(content) {
  return (content.site.social || [])
    .map(
      (s) => `
      <a class="social-icon" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.label)}">
        <img src="/assets/social/${esc(s.icon)}_off.png" alt="${esc(s.label)}"
             onmouseover="this.src='/assets/social/${esc(s.icon)}_on.png'"
             onmouseout="this.src='/assets/social/${esc(s.icon)}_off.png'">
      </a>`
    )
    .join('');
}

function siteFooter(content) {
  const c = content.pages.contact || {};
  const hours = (c.hours || [])
    .map((h) => `<p><strong>${esc(h.days)}</strong> · ${esc(h.time)}</p>`)
    .join('');
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="/assets/flower-lg.png" alt="">
        <p class="footer-script">${esc(content.site.tagline)}</p>
      </div>
      <div class="footer-col">
        <h3>Visit</h3>
        <p><a href="${esc(c.mapUrl || '#')}" target="_blank" rel="noopener">${lines(c.addressLines || '')}</a></p>
        ${hours}
      </div>
      <div class="footer-col">
        <h3>Explore</h3>
        <nav class="footer-nav">
          ${navLinks(content, null)}
        </nav>
      </div>
      <div class="footer-col">
        <h3>Connect</h3>
        <div class="footer-social">${socialIcons(content)}</div>
        <p class="footer-order"><a href="${esc(content.site.orderOnlineUrl)}" target="_blank" rel="noopener">Order online →</a></p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© ${new Date().getFullYear()} ${esc(content.site.name)} · ${esc(content.site.tagline)} · <a href="/">All locations</a></p>
    </div>
  </footer>`;
}

function shell({ title, bodyClass, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <link rel="icon" href="/assets/flower-lg.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Lato:wght@300;400;700;900&family=Nunito:wght@400;600;700;800&family=Yellowtail&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/fonts.css">
  <link rel="stylesheet" href="/styles.css">
</head>
<body class="${esc(bodyClass)}">
${body}
</body>
</html>`;
}

// ------------------------------------------------- full-page fade background

// Two stacked fixed layers crossfading through `images` — the whole-page
// background animation used on the home and photos pages.
function fadeBackground(images, intervalMs, rotate = true) {
  const imgs = (images || []).map(esc);
  return `
  <div class="bg-layer visible" id="bg-a"${imgs[0] ? ` style="background-image:url('${imgs[0]}')"` : ''}></div>
  <div class="bg-layer" id="bg-b"></div>
  <script>
    (function () {
      var imgs = ${JSON.stringify(imgs)};
      if (imgs.length < 2 || !${rotate ? 'true' : 'false'}) return;
      imgs.forEach(function (src) { new Image().src = src; });
      var layers = [document.getElementById('bg-a'), document.getElementById('bg-b')];
      var i = 0, top = 0;
      setInterval(function () {
        i = (i + 1) % imgs.length;
        var incoming = layers[1 - top], outgoing = layers[top];
        incoming.style.backgroundImage = "url('" + imgs[i] + "')";
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            incoming.classList.add('visible');
            outgoing.classList.remove('visible');
          });
        });
        top = 1 - top;
      }, ${Number(intervalMs) || 6000});
    })();
  </script>`;
}

// ---------------------------------------------------------------- landing (location selector)

function landing(content) {
  const l = content.landing || {};
  const rows = (l.bannerRows || [])
    .map(
      (row) =>
        `<p class="announcement-links">${row
          .map(
            (k) =>
              `<span class="announcement-item">${esc(k.text)} <a href="${esc(k.url)}" target="_blank" rel="noopener">${esc(k.linkText)}</a></span>`
          )
          .join('')}</p>`
    )
    .join('\n      ');
  const locations = (l.locations || [])
    .map(
      (loc) => `
      <a class="location-card" href="${esc(loc.url)}"${/^https?:/.test(loc.url || '') ? ' target="_blank" rel="noopener"' : ''}>
        <img src="${esc(loc.image)}" alt="${esc(content.site.name)} ${esc(loc.label)}">
      </a>`
    )
    .join('');
  const body = `
  ${fadeBackground(l.backgroundImages, 7000)}
  <div class="announcement landing-announcement">
      ${rows}
    <p class="announcement-awards">${esc(l.awards)}</p>
  </div>
  <main class="locations" aria-label="Choose your location">
    ${locations}
  </main>`;
  return shell({ title: content.site.title, bodyClass: 'landing', body });
}

// ---------------------------------------------------------------- home

function home(content) {
  const firstNav = (content.nav && content.nav[0]) || { slug: 'food', title: 'Food & Drinks' };
  const body = `
  ${fadeBackground(content.pages.home.heroImages, 6000)}
${banner(content)}
${siteHeader(content, null)}
  <main class="hero">
    <img class="hero-logo" src="/assets/logo.png" alt="${esc(content.site.name)} — ${esc(content.site.tagline)}">
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="${esc(content.site.orderOnlineUrl)}" target="_blank" rel="noopener">Order Online</a>
      <a class="btn btn-glass btn-lg" href="/${esc(firstNav.slug)}">${esc(firstNav.title)}</a>
    </div>
  </main>
  <a class="scroll-cue" href="/${esc(firstNav.slug)}" aria-label="Explore the menu">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  </a>`;
  return shell({ title: content.site.title, bodyClass: 'home', body });
}

// ---------------------------------------------------------------- interior shell

function interior(content, active, title, main, opts = {}) {
  const body = `
${siteHeader(content, active)}
  <main class="page-main">
${main}
  </main>
  ${opts.footer === false ? '' : siteFooter(content)}`;
  return shell({ title: `${title} | ${content.site.name}`, bodyClass: opts.bodyClass || 'interior', body });
}

// Small centered flower used as a section divider on interior pages
function flowerDivider() {
  return '<img class="flower-divider" src="/assets/flower-lg.png" alt="">';
}

function pageIntro(title) {
  return `
  <div class="page-intro">
    ${flowerDivider()}
    <h1 class="page-title">${esc(title)}</h1>
  </div>`;
}

// ---------------------------------------------------------------- menu rendering

function menuLogoHeader(content) {
  return `
    <div class="menu-brand">
      <img src="/assets/flower-lg.png" alt="">
      <div class="menu-brand-text">
        <span class="menu-wordmark">${esc(content.site.name)}</span>
        <span class="menu-tagline">${esc(content.site.tagline)}</span>
      </div>
    </div>`;
}

function sectionHeaderBar(sec) {
  const num = sec.number
    ? `<span class="menu-num">${esc(sec.number)}</span>`
    : '';
  return `<div class="menu-bar-title">${num}<span class="menu-bar-label">${esc(sec.title)}</span></div>`;
}

function pickerSection(sec) {
  const variants = (sec.variants || [])
    .filter((v) => String(v.name || '').trim() || String(v.desc || '').trim())
    .map(
      (v) => `
        <div class="variant"><span class="variant-name">${esc(v.name)}</span><span class="variant-desc">${esc(v.desc)}</span></div>`
    )
    .join('');
  const extra =
    sec.extraTitle || sec.extraLines
      ? `
      ${sec.extraTitle ? `<div class="extra-title">${esc(sec.extraTitle)} <span class="extra-price">${esc(sec.extraPrice)}</span></div>` : ''}
      <div class="extra-lines">${lines(sec.extraLines)}</div>`
      : '';
  const highlight = sec.highlight
    ? `<div class="menu-highlight">${esc(sec.highlight)}</div>`
    : '';
  const realBoxes = (sec.boxes || []).filter(
    (b) => String(b.title || '').trim() || String(b.desc || '').trim() || String(b.price || '').trim()
  );
  const boxes = realBoxes.length
    ? `
      <div class="menu-boxes">
        ${realBoxes
          .map(
            (b) => `
        <div class="menu-box"><span class="menu-box-title">${esc(b.title)}</span><span class="menu-box-desc">${esc(b.desc)}</span><span class="menu-box-price">${esc(b.price)}</span></div>`
          )
          .join('')}
      </div>`
    : '';
  return `
    <section class="menu-section">
      ${sectionHeaderBar(sec)}
      <div class="menu-panel">
        ${sec.intro ? `<p class="menu-intro">${esc(sec.intro)}</p>` : ''}
        ${sec.priceLine ? `<div class="menu-priceline">${esc(sec.priceLine)}</div>` : ''}
        ${variants ? `<div class="variants">${variants}</div>` : ''}
        ${extra}
        ${highlight}
        ${boxes}
      </div>
    </section>`;
}

function itemRow(it) {
  // A row with nothing filled in yet (just added in the admin) renders nothing
  // rather than an empty gap in the menu.
  if (!String(it.name || '').trim() && !String(it.desc || '').trim() && !String(it.price || '').trim()) {
    return '';
  }
  if (it.kind === 'add') {
    return `<div class="menu-add"><span>${esc(it.name)}</span><span class="menu-price">${esc(it.price)}</span></div>`;
  }
  const prices = [it.price, it.price2].filter(Boolean).map((p) => `<span class="menu-price">${esc(p)}</span>`).join(' ');
  return `
      <div class="menu-item">
        <div class="menu-item-head"><span class="menu-item-name">${esc(it.name)}${it.nameSuffix ? `<span class="menu-item-suffix">${esc(it.nameSuffix)}</span>` : ''}</span>${prices}</div>
        ${it.desc ? `<div class="menu-item-desc">${esc(it.desc)}</div>` : ''}
      </div>`;
}

function itemsSection(sec) {
  const cols = Number(sec.columns) >= 2 ? 2 : 1; // anything else falls back to a single clean column
  const rows = (sec.items || []).map(itemRow).join('');
  const inner = `<div class="menu-items cols-${cols}">${rows}</div>`;
  if (sec.boxed) {
    return `
    <section class="menu-section">
      ${sectionHeaderBar(sec)}
      <div class="menu-panel">${inner}</div>
    </section>`;
  }
  return `
    <section class="menu-section plain">
      ${String(sec.title || '').trim() ? `<h3 class="menu-plain-title">${esc(sec.title)}</h3>` : ''}
      ${inner}
    </section>`;
}

function foodMenu(content) {
  const m = content.menus.food;
  const sections = (m.sections || [])
    .map((sec) => (sec.kind === 'picker' ? pickerSection(sec) : itemsSection(sec)))
    .join('\n');
  const disclaimer = m.disclaimer
    ? `<div class="menu-disclaimer">${lines(m.disclaimer)}</div>`
    : '';
  return `
  <div class="menu-card">
    ${menuLogoHeader(content)}
    ${sections}
    ${disclaimer}
  </div>`;
}

function barMenu(content) {
  const b = content.menus.bar;
  const subs = (b.subsections || [])
    .map(
      (s) => `
      <div class="bar-col">
        <div class="bar-pill">${esc(s.title)}</div>
        ${s.priceLine ? `<div class="bar-priceline">${esc(s.priceLine)}</div>` : ''}
        ${(s.items || [])
          .map(
            (it) => `
        <div class="bar-item"><span class="bar-item-name">${esc(it.name)}${it.price ? ` <span class="bar-item-price">(${esc(it.price)})</span>` : ''}</span>${it.desc ? `<span class="bar-item-desc">${esc(it.desc)}</span>` : ''}</div>`
          )
          .join('')}
        ${s.footnote ? `<div class="bar-footnote">${lines(s.footnote)}</div>` : ''}
      </div>`
    )
    .join('');
  const hh = b.happyHour || {};
  const hhItems = (hh.items || [])
    .map(
      (it) => `
        <div class="hh-item">
          <div class="hh-row"><span class="hh-name">${esc(it.name)}</span><span class="hh-price">${esc(it.price)}</span></div>
          ${it.desc ? `<div class="hh-desc">${lines(it.desc)}</div>` : ''}
        </div>`
    )
    .join('');
  const bev = b.beverages || {};
  const bevGroups = (bev.groups || [])
    .map(
      (g) => `
      <div class="bev-group">
        <h4>${esc(g.title)}</h4>
        ${(g.items || [])
          .map(
            (it) => `<div class="bev-item"><span>${esc(it.name)}</span><span class="bev-price">${esc(it.price)}</span></div>`
          )
          .join('')}
      </div>`
    )
    .join('');
  return `
  <div class="menu-card">
    <div class="bar-panel">
      <h2 class="bar-title">${esc(b.title)}</h2>
      <p class="bar-intro">${esc(b.intro)}</p>
      <div class="bar-cols">${subs}</div>
      <div class="bar-pill hh-pill">${esc(hh.title)}</div>
      <div class="hh-body">
        <div class="hh-schedule">${esc(hh.schedule)}</div>
        <div class="hh-schedule-note">${esc(hh.scheduleNote)}</div>
        ${hhItems}
      </div>
    </div>
    <div class="beverages">
      <h3 class="menu-plain-title">${esc(bev.title)}</h3>
      <div class="bev-groups">${bevGroups}</div>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- pages

function foodPage(content) {
  const pg = content.pages.food;
  return `
  ${pageIntro('Food & Drinks')}
  <div class="food-top">
    <a class="btn btn-primary btn-lg" href="${esc(pg.orderUrl)}" target="_blank" rel="noopener">${esc(pg.orderText)}</a>
    <p class="food-intro">${esc(pg.intro)}</p>
  </div>
  ${foodMenu(content)}
  ${barMenu(content)}`;
}

function menuGuidePage(content) {
  const pg = content.pages.menuGuide;
  const cols = (pg.columns || [])
    .map(
      (c) => `
    <div class="guide-block">
      <h3>${esc(c.heading)}</h3>
      <div class="guide-items">${lines(c.items)}</div>
      ${c.note ? `<div class="guide-note">${lines(c.note)}</div>` : ''}
    </div>`
    )
    .join('');
  return `
  <div class="guide">
    ${flowerDivider()}
    <h1 class="page-title">${esc(pg.title)}</h1>
    <p class="guide-intro">${esc(pg.intro)}</p>
    <div class="guide-columns">${cols}</div>
    <div class="guide-footer">${esc(pg.footer)}</div>
  </div>`;
}

function cateringPage(content) {
  const pg = content.pages.catering;
  const imgs = (pg.images || [])
    .map((src) => `<img class="stack-img" src="${esc(src)}" alt="Catering menu" loading="lazy">`)
    .join('\n    ');
  return `
  ${pageIntro('Catering')}
  <p class="catering-link"><a href="${esc(pg.linkUrl)}" target="_blank" rel="noopener">${esc(pg.linkText)}</a></p>
  <div class="img-stack">
    ${imgs}
  </div>`;
}

function textSectionsPage(pg, title) {
  return `
  ${pageIntro(title)}
  <article class="prose">
    ${(pg.sections || [])
      .map(
        (s) => `
    <section>
      ${s.heading ? `<h2>${esc(s.heading)}</h2>` : ''}
      ${paragraphs(s.body)}
    </section>`
      )
      .join('')}
  </article>`;
}

function photosPage(content) {
  const pg = content.pages.photos;
  // The photos ARE the page: a full-site background slowly fading between shots.
  return fadeBackground(pg.images, pg.intervalMs || 6000, pg.autoplay !== false);
}

function praisePage(content) {
  const pg = content.pages.praise;
  return `
  ${pageIntro('Press & Praise')}
  <div class="img-stack">
    ${(pg.images || []).map((src) => `<img class="stack-img" src="${esc(src)}" alt="Press and praise" loading="lazy">`).join('\n    ')}
  </div>`;
}

function contactPage(content) {
  const pg = content.pages.contact;
  const hours = (pg.hours || [])
    .map((h) => `<div class="hours-row"><span class="hours-days">${esc(h.days)}</span><span class="hours-time">${esc(h.time)}</span></div>`)
    .join('');
  const links = (pg.links || [])
    .map((l) => `<a class="contact-pill" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`)
    .join('');
  return `
  ${pageIntro('Contact')}
  <div class="contact">
    <div class="contact-card">
      <h2 class="contact-h">Hours</h2>
      ${pg.notice ? `<div class="contact-notice">${lines(pg.notice)}</div>` : ''}
      ${hours}
    </div>
    <div class="contact-card">
      <h2 class="contact-h">Located @</h2>
      <p class="contact-address"><a href="${esc(pg.mapUrl)}" target="_blank" rel="noopener">${lines(pg.addressLines)}</a></p>
    </div>
    <div class="contact-card">
      <h2 class="contact-h">Connect w/ us</h2>
      <div class="contact-links">${links}</div>
    </div>
  </div>`;
}

function gearPage(content) {
  const pg = content.pages.fritaGear;
  return `
  ${pageIntro('Frita Gear')}
  <div class="gear">
    <a class="gear-button" href="${esc(pg.url)}" target="_blank" rel="noopener">${esc(pg.buttonText)}</a>
  </div>`;
}

function page(content, slug) {
  const titles = {};
  (content.nav || []).forEach((n) => (titles[n.slug] = n.title));
  const title = titles[slug] || slug;
  let main;
  switch (slug) {
    case 'food': main = foodPage(content); break;
    case 'menu-guide': main = menuGuidePage(content); break;
    case 'catering': main = cateringPage(content); break;
    case 'chef': main = textSectionsPage(content.pages.chef, 'Chef'); break;
    case 'philosophy': main = textSectionsPage(content.pages.philosophy, 'Philosophy'); break;
    case 'photos':
      return interior(content, slug, title, photosPage(content), { footer: false, bodyClass: 'interior photos-bg' });
    case 'praise': main = praisePage(content); break;
    case 'contact': main = contactPage(content); break;
    case 'frita-gear': main = gearPage(content); break;
    default: main = '<p>Not found</p>';
  }
  return interior(content, slug, title, main);
}

module.exports = { landing, home, page };

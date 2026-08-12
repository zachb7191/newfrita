/* Frita Batidos admin — edits content.json via the API. No frameworks. */

let state = null;
let dirty = false;
let activePanel = 'banner';
const openCards = new Set(); // remembers which collapsible cards are expanded

const $ = (sel, el = document) => el.querySelector(sel);

// ---------- icons (lucide-style, stroke) ----------

function svg(paths, viewBox = '0 0 24 24') {
  return `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

const ICONS = {
  megaphone: svg('<path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>'),
  settings: svg('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'),
  nav: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  home: svg('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>'),
  utensils: svg('<path d="M3 2v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6h5M21 15v7"/>'),
  clipboard: svg('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>'),
  martini: svg('<path d="M8 22h8M12 11v11"/><path d="m19 3-7 8-7-8Z"/>'),
  book: svg('<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  package: svg('<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>'),
  chef: svg('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  heart: svg('<path d="M19 14c1.5-1.4 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .9-4.5 3-1.5-2.1-2.7-3-4.5-3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.1 3 5.5l7 7Z"/>'),
  image: svg('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>'),
  star: svg('<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/>'),
  phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>'),
  shirt: svg('<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>'),
  menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>'),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  chevron: svg('<path d="m9 18 6-6-6-6"/>'),
  up: svg('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  down: svg('<path d="M12 5v14M5 12l7 7 7-7"/>'),
  trash: svg('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  upload: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>'),
  refresh: svg('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),
  monitor: svg('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>'),
  smartphone: svg('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M12 18h.01"/>'),
  eye: svg('<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'),
  external: svg('<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  checkCircle: svg('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  alert: svg('<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'),
  globe: svg('<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z"/>'),
};

// ---------- path helpers ----------

function get(path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), state);
}

function set(path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => o[k], state);
  target[last] = value;
  markDirty();
}

function markDirty() {
  dirty = true;
  const btn = $('#save');
  btn.disabled = false;
  btn.classList.add('dirty');
  btn.classList.remove('saving');
  $('.save-icon', btn).innerHTML = ICONS.upload;
  $('.save-label', btn).textContent = 'Save changes';
}

function markSaved() {
  dirty = false;
  const btn = $('#save');
  btn.disabled = true;
  btn.classList.remove('dirty', 'saving');
  $('.save-icon', btn).innerHTML = ICONS.check;
  $('.save-label', btn).textContent = 'Saved';
}

// ---------- dom helpers ----------

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function iconBtn(icon, title, onclick, cls = '') {
  return el('button', { type: 'button', class: `icon-btn ${cls}`, title, 'aria-label': title, html: ICONS[icon], onclick });
}

// ---------- field builders ----------

function fText(label, path, hint) {
  const input = el('input', {
    type: 'text',
    value: get(path) ?? '',
    oninput: (e) => set(path, e.target.value),
  });
  return el('div', { class: 'field' }, [
    el('label', {}, [label]),
    input,
    hint ? el('div', { class: 'hint' }, [hint]) : null,
  ]);
}

function fTextarea(label, path, rows = 4, hint) {
  const input = el('textarea', {
    rows: String(rows),
    oninput: (e) => set(path, e.target.value),
  });
  input.value = get(path) ?? '';
  return el('div', { class: 'field' }, [
    el('label', {}, [label]),
    input,
    hint ? el('div', { class: 'hint' }, [hint]) : null,
  ]);
}

function fNumber(label, path, hint) {
  const input = el('input', {
    type: 'number',
    value: get(path) ?? 0,
    oninput: (e) => set(path, Number(e.target.value)),
  });
  return el('div', { class: 'field' }, [
    el('label', {}, [label]),
    input,
    hint ? el('div', { class: 'hint' }, [hint]) : null,
  ]);
}

function fSelect(label, path, options, hint) {
  const sel = el('select', {
    onchange: (e) => {
      const opt = options.find((o) => String(o.value) === e.target.value);
      set(path, opt ? opt.value : e.target.value);
    },
  });
  const current = get(path);
  for (const o of options) {
    const optEl = el('option', { value: String(o.value) }, [o.label]);
    if (String(o.value) === String(current)) optEl.selected = true;
    sel.appendChild(optEl);
  }
  return el('div', { class: 'field' }, [
    el('label', {}, [label]),
    sel,
    hint ? el('div', { class: 'hint' }, [hint]) : null,
  ]);
}

function fCheck(label, path) {
  const id = 'chk-' + path.replace(/\W/g, '-');
  const input = el('input', {
    type: 'checkbox',
    id,
    onchange: (e) => set(path, e.target.checked),
  });
  input.checked = !!get(path);
  return el('div', { class: 'field check' }, [input, el('label', { for: id }, [label])]);
}

function subtitle(text) {
  return el('div', { class: 'subsection-title' }, [text]);
}

function note(text) {
  return el('div', { class: 'panel-note' }, [text]);
}

// Clickable cards that jump to another admin panel
function panelLinks(ids) {
  return el('div', { class: 'link-cards' }, ids.map((id) => {
    const p = PANELS.find((x) => x.id === id);
    if (!p) return null;
    return el('a', {
      class: 'link-card',
      href: '#' + p.id,
      html: `<span class="link-card-icon">${ICONS[p.icon] || ''}</span>
        <span class="link-card-text"><strong>${p.title}</strong><span>${p.desc || ''}</span></span>
        <span class="link-card-chev">${ICONS.chevron}</span>`,
    });
  }));
}

// Small inline link back to another panel
function backLink(id, label) {
  return el('p', { class: 'back-link' }, [
    el('a', { href: '#' + id, html: ICONS.chevron + `<span>${label}</span>` }),
  ]);
}

// ---------- list editor ----------
// opts: itemTitle(item,i), fields(prefix,item,i)=>nodes, newItem(), addLabel,
//       flat (small always-open cards), sub(item,i) → gray note next to title

function fList(path, opts) {
  const wrap = el('div');
  const arr = get(path) || [];

  arr.forEach((item, i) => {
    const prefix = `${path}.${i}`;
    const isOpen = opts.flat || openCards.has(prefix);

    const tools = el('div', { class: 'card-tools' }, [
      iconBtn('up', 'Move up', (e) => {
        e.stopPropagation();
        if (i === 0) return;
        const a = get(path);
        [a[i - 1], a[i]] = [a[i], a[i - 1]];
        swapOpen(path, i, i - 1);
        markDirty(); renderPanel();
      }),
      iconBtn('down', 'Move down', (e) => {
        e.stopPropagation();
        const a = get(path);
        if (i === a.length - 1) return;
        [a[i + 1], a[i]] = [a[i], a[i + 1]];
        swapOpen(path, i, i + 1);
        markDirty(); renderPanel();
      }),
      iconBtn('trash', 'Remove', (e) => {
        e.stopPropagation();
        if (!confirm('Remove this item?')) return;
        get(path).splice(i, 1);
        openCards.delete(prefix);
        markDirty(); renderPanel();
      }, 'danger'),
    ]);

    const title = opts.itemTitle ? (opts.itemTitle(item, i) || `Item ${i + 1}`) : `Item ${i + 1}`;
    const head = el('div', {
      class: 'card-head',
      onclick: opts.flat ? null : () => {
        if (openCards.has(prefix)) openCards.delete(prefix);
        else openCards.add(prefix);
        renderPanel();
      },
    }, [
      opts.flat ? null : el('span', { class: 'chev', html: ICONS.chevron }),
      el('span', { class: 'card-title' }, [
        title,
        opts.sub ? el('span', { class: 'card-sub' }, [opts.sub(item, i) || '']) : null,
      ]),
      tools,
    ]);

    const card = el('div', { class: `card${isOpen ? ' open' : ''}${opts.flat ? ' flat' : ''}` }, [
      head,
      el('div', { class: 'card-body' }, opts.fields(prefix, item, i)),
    ]);
    wrap.appendChild(card);
  });

  wrap.appendChild(
    el('button', {
      type: 'button',
      class: 'add-btn',
      html: ICONS.plus + `<span>${opts.addLabel || 'Add item'}</span>`,
      onclick: () => {
        const a = get(path);
        a.push(opts.newItem());
        if (!opts.flat) openCards.add(`${path}.${a.length - 1}`);
        markDirty();
        renderPanel();
        const cards = $('#panel-body').querySelectorAll('.card');
        if (cards.length) cards[cards.length - 1].scrollIntoView({ block: 'center', behavior: 'smooth' });
      },
    })
  );
  return wrap;
}

function swapOpen(path, a, b) {
  const ka = `${path}.${a}`, kb = `${path}.${b}`;
  const hadA = openCards.has(ka), hadB = openCards.has(kb);
  openCards.delete(ka); openCards.delete(kb);
  if (hadA) openCards.add(kb);
  if (hadB) openCards.add(ka);
}

// ---------- image fields ----------

function fImageList(path, addLabel) {
  const grid = el('div', { class: 'img-grid' });
  const arr = get(path) || [];

  arr.forEach((src, i) => {
    const img = el('img', { src, alt: '', onerror: function () { this.style.opacity = 0.25; } });
    const urlInput = el('input', {
      type: 'text',
      value: src,
      spellcheck: 'false',
      oninput: (e) => { get(path)[i] = e.target.value; img.src = e.target.value; markDirty(); },
    });
    grid.appendChild(
      el('div', { class: 'img-tile' }, [
        el('div', { class: 'img-thumb' }, [img, el('span', { class: 'tile-badge' }, [String(i + 1)])]),
        el('div', { class: 'img-actions' }, [
          iconBtn('up', 'Move earlier', () => { if (i === 0) return; const a = get(path); [a[i - 1], a[i]] = [a[i], a[i - 1]]; markDirty(); renderPanel(); }),
          iconBtn('down', 'Move later', () => { const a = get(path); if (i === a.length - 1) return; [a[i + 1], a[i]] = [a[i], a[i + 1]]; markDirty(); renderPanel(); }),
          iconBtn('upload', 'Replace image', () => uploadFile((url) => { get(path)[i] = url; markDirty(); renderPanel(); })),
          iconBtn('trash', 'Remove', () => { if (!confirm('Remove this image?')) return; get(path).splice(i, 1); markDirty(); renderPanel(); }, 'danger'),
        ]),
        el('div', { class: 'img-url-row' }, [urlInput]),
      ])
    );
  });

  grid.appendChild(
    el('button', {
      type: 'button',
      class: 'img-add-tile',
      html: ICONS.upload + `<span>${addLabel || 'Upload image'}</span>`,
      onclick: () => uploadFile((url) => { get(path).push(url); markDirty(); renderPanel(); }),
    })
  );
  return grid;
}

// Single image field: thumbnail + URL + upload
function fImage(label, path) {
  const src = get(path) || '';
  const img = el('img', { src, alt: '', onerror: function () { this.style.opacity = 0.25; } });
  const input = el('input', {
    type: 'text',
    value: src,
    spellcheck: 'false',
    oninput: (e) => { set(path, e.target.value); img.src = e.target.value; },
  });
  return el('div', { class: 'field' }, [
    el('label', {}, [label]),
    el('div', { class: 'img-single' }, [
      el('div', { class: 'img-thumb' }, [img]),
      input,
      el('button', { type: 'button', class: 'upload-btn', html: ICONS.upload + '<span>Upload</span>', onclick: () => uploadFile((url) => { set(path, url); renderPanel(); }) }),
    ]),
  ]);
}

function uploadFile(onDone) {
  const picker = el('input', { type: 'file', accept: 'image/*' });
  picker.addEventListener('change', () => {
    const file = picker.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, data: reader.result }),
        });
        const out = await res.json();
        if (!res.ok) throw new Error(out.error || 'Upload failed');
        toast('Image uploaded', 'ok');
        onDone(out.url);
      } catch (e) {
        toast(e.message, 'err');
      }
    };
    reader.readAsDataURL(file);
  });
  picker.click();
}

// ---------- menu field sets ----------

function menuItemFields(prefix) {
  return [
    el('div', { class: 'grid-3' }, [
      fText('Name', `${prefix}.name`),
      fText('Price', `${prefix}.price`),
      fText('2nd price (large)', `${prefix}.price2`),
    ]),
    fTextarea('Description', `${prefix}.desc`, 2),
  ];
}

function foodSectionFields(prefix, sec) {
  const base = [
    el('div', { class: 'grid-2' }, [
      fText('Title', `${prefix}.title`),
      fText('Circle number (blank for none)', `${prefix}.number`),
    ]),
  ];
  if (sec.kind === 'picker') {
    return base.concat([
      fTextarea('Intro text', `${prefix}.intro`, 3),
      fText('Price line', `${prefix}.priceLine`, 'e.g. 11/single  15/double'),
      subtitle('Choices'),
      note('Choices display centered, side by side — like the Frita types on the printed menu. For standard priced rows, add them to an items section instead (e.g. PICK YOUR SIDES!).'),
      fList(`${prefix}.variants`, {
        flat: true,
        itemTitle: (v) => v.name || 'Choice',
        fields: (p) => [el('div', { class: 'grid-2' }, [fText('Name', `${p}.name`), fText('Note', `${p}.desc`)])],
        newItem: () => ({ name: '', desc: '' }),
        addLabel: 'Add choice',
      }),
      subtitle('Extras block'),
      el('div', { class: 'grid-2' }, [
        fText('Extras heading', `${prefix}.extraTitle`, 'e.g. ON TOP'),
        fText('Extras price', `${prefix}.extraPrice`, 'e.g. +1.5/ea'),
      ]),
      fTextarea('Extras lines (one per line)', `${prefix}.extraLines`, 3, 'Separate choices with | and put prices in parentheses, e.g. PASSION FRUIT (6)'),
      fText('Highlight pill', `${prefix}.highlight`, 'Rounded callout — leave blank to hide'),
      subtitle('Callout boxes'),
      fList(`${prefix}.boxes`, {
        flat: true,
        itemTitle: (b) => b.title || 'Box',
        fields: (p) => [el('div', { class: 'grid-3' }, [fText('Title', `${p}.title`), fText('Text', `${p}.desc`), fText('Price', `${p}.price`)])],
        newItem: () => ({ title: '', desc: '', price: '' }),
        addLabel: 'Add box',
      }),
    ]);
  }
  return base.concat([
    el('div', { class: 'grid-2' }, [
      fSelect('Item layout', `${prefix}.columns`, [
        { value: 1, label: 'One column (like MORE FAVORITES!)' },
        { value: 2, label: 'Two columns (like PICK YOUR SIDES!)' },
      ]),
      fCheck('Draw a border box around this section', `${prefix}.boxed`),
    ]),
    subtitle('Menu items'),
    note('New items appear as standard menu rows — name on the left, price on the right, description underneath — and slot into the column layout automatically.'),
    fList(`${prefix}.items`, {
      itemTitle: (it) => (it.kind === 'add' ? `↳ ${it.name || 'Add-on line'}` : it.name || 'Menu item'),
      sub: (it) => [it.price, it.price2].filter(Boolean).join(' / '),
      fields: (p, it) => {
        const id = `add-kind-${p.replace(/\W/g, '-')}`;
        const chk = el('input', { type: 'checkbox', id });
        chk.checked = it.kind === 'add';
        chk.addEventListener('change', (e) => {
          it.kind = e.target.checked ? 'add' : 'item';
          markDirty();
          renderPanel();
        });
        return [
          el('div', { class: 'field check' }, [
            chk,
            el('label', { for: id }, ['This is an "Add …" upsell line (cyan, attached to the item above)']),
          ]),
          ...menuItemFields(p),
        ];
      },
      newItem: () => ({ name: '', desc: '', price: '', price2: '', kind: 'item' }),
      addLabel: 'Add menu item',
    }),
  ]);
}

// ---------- panels ----------

const PANELS = [
  { group: 'Site' },
  {
    id: 'landing',
    title: 'Front Page',
    desc: 'The location selector visitors see first',
    icon: 'globe',
    preview: '/',
    render: () => [
      note('The front page lets visitors pick their Frita Batidos location — the flower lockups link to each location\'s site. Ann Arbor points to this site\'s homepage.'),
      subtitle('Locations'),
      fList('landing.locations', {
        itemTitle: (l) => l.label || 'Location',
        fields: (p) => [
          el('div', { class: 'grid-2' }, [
            fText('Location name', `${p}.label`),
            fText('Links to', `${p}.url`, 'Use /ann-arbor for this site, or a full https:// URL'),
          ]),
          fImage('Lockup image', `${p}.image`),
        ],
        newItem: () => ({ label: '', image: '', url: '' }),
        addLabel: 'Add location',
      }),
      subtitle('Banner link rows'),
      fList('landing.bannerRows', {
        itemTitle: (row, i) => (row && row[0] && row[0].text) || `Row ${i + 1}`,
        fields: (p) => [
          fList(p, {
            flat: true,
            itemTitle: (k) => k.text || 'Link',
            fields: (pp) => [
              fText('Text before the link', `${pp}.text`),
              el('div', { class: 'grid-2' }, [fText('Link text', `${pp}.linkText`), fText('Link URL', `${pp}.url`)]),
            ],
            newItem: () => ({ text: '', linkText: 'HERE!', url: '' }),
            addLabel: 'Add link to this row',
          }),
        ],
        newItem: () => [],
        addLabel: 'Add banner row',
      }),
      fTextarea('Awards line', 'landing.awards', 3, 'Separate awards with a • character'),
      subtitle('Background photos (slow fade)'),
      fImageList('landing.backgroundImages', 'Add photo'),
    ],
  },
  {
    id: 'banner',
    title: 'Top Banner',
    desc: 'The announcement bar on the Ann Arbor homepage',
    icon: 'megaphone',
    preview: '/ann-arbor',
    render: () => [
      fCheck('Show the banner', 'banner.enabled'),
      subtitle('Banner links'),
      fList('banner.links', {
        itemTitle: (l) => l.text || 'Link',
        sub: (l) => l.linkText,
        fields: (p) => [
          fText('Text before the link', `${p}.text`),
          el('div', { class: 'grid-2' }, [fText('Link text', `${p}.linkText`), fText('Link URL', `${p}.url`)]),
        ],
        newItem: () => ({ text: '', linkText: 'HERE!', url: '' }),
        addLabel: 'Add banner link',
      }),
      fTextarea('Awards line', 'banner.awards', 3, 'Separate awards with a • character'),
    ],
  },
  {
    id: 'settings',
    title: 'Site Settings',
    desc: 'Name, tagline and the social links in the footer',
    icon: 'settings',
    preview: '/',
    render: () => [
      el('div', { class: 'grid-2' }, [
        fText('Site name', 'site.name'),
        fText('Tagline', 'site.tagline'),
      ]),
      fText('Browser tab title', 'site.title'),
      fText('Order online URL', 'site.orderOnlineUrl'),
      subtitle('Footer social links'),
      fList('site.social', {
        flat: true,
        itemTitle: (s) => s.label || 'Social link',
        fields: (p) => [
          el('div', { class: 'grid-3' }, [
            fText('Label', `${p}.label`),
            fText('Icon name', `${p}.icon`),
            fText('URL', `${p}.url`),
          ]),
        ],
        newItem: () => ({ id: '', label: '', url: '', icon: 'email' }),
        addLabel: 'Add social link',
      }),
    ],
  },
  {
    id: 'nav',
    title: 'Navigation',
    desc: 'Rename or reorder the menu links on every page',
    icon: 'nav',
    preview: '/ann-arbor',
    render: () => [
      note('Drag the arrows to reorder, or rename any link. The page each link points to is fixed.'),
      fList('nav', {
        flat: true,
        itemTitle: (n) => n.title || n.slug,
        fields: (p, n) => [
          el('div', { class: 'grid-2' }, [
            fText('Label', `${p}.title`),
            el('div', { class: 'field' }, [el('label', {}, ['Page']), el('input', { type: 'text', value: n.slug, disabled: 'true' })]),
          ]),
        ],
        newItem: () => ({ slug: 'food', title: 'New link' }),
        addLabel: 'Add nav link',
      }),
    ],
  },
  { group: 'Pages' },
  {
    id: 'home',
    title: 'Home (Ann Arbor)',
    desc: 'The rotating full-screen background photos',
    icon: 'home',
    preview: '/ann-arbor',
    render: () => [
      note('These photos fill the homepage and slowly fade from one to the next, in this order.'),
      fImageList('pages.home.heroImages', 'Add photo'),
    ],
  },
  {
    id: 'food-page',
    title: 'Food & Drinks',
    desc: 'The order link, intro, and the two menus on this page',
    icon: 'utensils',
    preview: '/food',
    render: () => [
      el('div', { class: 'grid-2' }, [
        fText('Order link text', 'pages.food.orderText'),
        fText('Order link URL', 'pages.food.orderUrl'),
      ]),
      fTextarea('Intro paragraph', 'pages.food.intro', 5),
      subtitle('Menus on this page'),
      note('The Food & Drinks page shows the intro above, then the food menu, then the bar menu. Edit the menus here:'),
      panelLinks(['food-menu', 'bar-menu']),
    ],
  },
  {
    id: 'menu-guide',
    title: 'Menu Guide',
    desc: 'The dietary guide — vegetarian, vegan, gluten free…',
    icon: 'book',
    preview: '/menu-guide',
    render: () => [
      fText('Title', 'pages.menuGuide.title'),
      fTextarea('Intro', 'pages.menuGuide.intro', 4),
      subtitle('Dietary sections'),
      fList('pages.menuGuide.columns', {
        itemTitle: (c) => c.heading || 'Section',
        sub: (c) => `${(c.items || '').split('\n').filter(Boolean).length} items`,
        fields: (p) => [
          fText('Heading', `${p}.heading`),
          fTextarea('Items (one per line)', `${p}.items`, 8),
          fTextarea('Cyan note (optional)', `${p}.note`, 2),
        ],
        newItem: () => ({ heading: '', items: '', note: '' }),
        addLabel: 'Add dietary section',
      }),
      fText('Footer line', 'pages.menuGuide.footer'),
    ],
  },
  {
    id: 'catering',
    title: 'Catering',
    desc: 'The catering link and menu images',
    icon: 'package',
    preview: '/catering',
    render: () => [
      el('div', { class: 'grid-2' }, [
        fText('Link text', 'pages.catering.linkText'),
        fText('Link URL', 'pages.catering.linkUrl'),
      ]),
      subtitle('Catering menu images (top to bottom)'),
      fImageList('pages.catering.images', 'Add image'),
    ],
  },
  {
    id: 'chef',
    title: 'Chef',
    desc: 'Eve’s story — background, style, influences…',
    icon: 'chef',
    preview: '/chef',
    render: () => [
      fList('pages.chef.sections', {
        itemTitle: (s) => s.heading || '(no heading)',
        fields: (p) => [
          fText('Heading', `${p}.heading`),
          fTextarea('Text (blank line = new paragraph)', `${p}.body`, 8),
        ],
        newItem: () => ({ heading: '', body: '' }),
        addLabel: 'Add section',
      }),
    ],
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    desc: 'The philosophy page text',
    icon: 'heart',
    preview: '/philosophy',
    render: () => [
      fList('pages.philosophy.sections', {
        itemTitle: (s) => (s.body || 'Section').slice(0, 52) + ((s.body || '').length > 52 ? '…' : ''),
        fields: (p) => [
          fText('Heading (optional)', `${p}.heading`),
          fTextarea('Text (blank line = new paragraph)', `${p}.body`, 7),
        ],
        newItem: () => ({ heading: '', body: '' }),
        addLabel: 'Add section',
      }),
    ],
  },
  {
    id: 'photos',
    title: 'Photos',
    desc: 'The full-page photo background that fades between shots',
    icon: 'image',
    preview: '/photos',
    render: () => [
      fNumber('Milliseconds each photo shows before fading to the next', 'pages.photos.intervalMs', '6000 = 6 seconds. The fade itself is slow and automatic.'),
      subtitle('Photos (fade in this order)'),
      fImageList('pages.photos.images', 'Add photo'),
    ],
  },
  {
    id: 'praise',
    title: 'Press / Praise',
    desc: 'The stacked press images',
    icon: 'star',
    preview: '/praise',
    render: () => [
      fImageList('pages.praise.images', 'Add image'),
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    desc: 'Hours, holiday notices, address and links',
    icon: 'phone',
    preview: '/contact',
    render: () => [
      fTextarea('Notice above hours', 'pages.contact.notice', 2, 'Holiday hours etc. Leave blank to hide.'),
      subtitle('Hours'),
      fList('pages.contact.hours', {
        flat: true,
        itemTitle: (h) => h.days || 'Hours row',
        fields: (p) => [el('div', { class: 'grid-2' }, [fText('Days', `${p}.days`), fText('Time', `${p}.time`)])],
        newItem: () => ({ days: '', time: '' }),
        addLabel: 'Add hours row',
      }),
      subtitle('Location'),
      fTextarea('Address (one line per row)', 'pages.contact.addressLines', 2),
      fText('Map link URL', 'pages.contact.mapUrl'),
      subtitle('Connect links'),
      fList('pages.contact.links', {
        flat: true,
        itemTitle: (l) => l.label || 'Link',
        fields: (p) => [el('div', { class: 'grid-2' }, [fText('Label', `${p}.label`), fText('URL', `${p}.url`)])],
        newItem: () => ({ label: '', url: '' }),
        addLabel: 'Add link',
      }),
    ],
  },
  {
    id: 'gear',
    title: 'Frita Gear',
    desc: 'The big button and where it goes',
    icon: 'shirt',
    preview: '/frita-gear',
    render: () => [
      el('div', { class: 'grid-2' }, [
        fText('Button text', 'pages.fritaGear.buttonText'),
        fText('Button URL', 'pages.fritaGear.url'),
      ]),
    ],
  },
  { group: 'Menus' },
  {
    id: 'food-menu',
    title: 'Food Menu',
    desc: 'Every section and item on the food menu',
    icon: 'clipboard',
    preview: '/food',
    render: () => [
      backLink('food-page', 'Shown on the Food & Drinks page'),
      fList('menus.food.sections', {
        itemTitle: (s) => `${s.number ? s.number + '. ' : ''}${s.title || 'Section'}`,
        sub: (s) => (s.kind === 'picker' ? 'picker' : `${(s.items || []).length} items`),
        fields: foodSectionFields,
        newItem: () => ({ kind: 'items', number: '', title: '', columns: 1, boxed: false, items: [] }),
        addLabel: 'Add menu section',
      }),
      fTextarea('Bottom disclaimer', 'menus.food.disclaimer', 3),
    ],
  },
  {
    id: 'bar-menu',
    title: 'Bar Menu',
    desc: 'Frita Bar, happy hour and other beverages',
    icon: 'martini',
    preview: '/food',
    render: () => [
      backLink('food-page', 'Shown on the Food & Drinks page'),
      fText('Bar title', 'menus.bar.title'),
      fTextarea('Bar intro', 'menus.bar.intro', 3),
      subtitle('Bar columns'),
      fList('menus.bar.subsections', {
        itemTitle: (s) => s.title || 'Column',
        sub: (s) => `${(s.items || []).length} drinks`,
        fields: (p) => [
          el('div', { class: 'grid-2' }, [
            fText('Title', `${p}.title`),
            fText('Price line', `${p}.priceLine`),
          ]),
          fList(`${p}.items`, {
            flat: true,
            itemTitle: (it) => it.name || 'Drink',
            fields: (pp) => [el('div', { class: 'grid-3' }, [fText('Name', `${pp}.name`), fText('Price', `${pp}.price`), fText('Note', `${pp}.desc`)])],
            newItem: () => ({ name: '', price: '', desc: '' }),
            addLabel: 'Add drink',
          }),
          fTextarea('Footnote', `${p}.footnote`, 2),
        ],
        newItem: () => ({ title: '', priceLine: '', items: [], footnote: '' }),
        addLabel: 'Add bar column',
      }),
      subtitle('Happy hour'),
      el('div', { class: 'grid-3' }, [
        fText('Title', 'menus.bar.happyHour.title'),
        fText('Schedule', 'menus.bar.happyHour.schedule'),
        fText('Schedule note', 'menus.bar.happyHour.scheduleNote'),
      ]),
      fList('menus.bar.happyHour.items', {
        flat: true,
        itemTitle: (it) => it.name || 'Item',
        fields: (p) => [
          el('div', { class: 'grid-2' }, [fText('Name', `${p}.name`), fText('Price', `${p}.price`)]),
          fTextarea('Description', `${p}.desc`, 2),
        ],
        newItem: () => ({ name: '', desc: '', price: '' }),
        addLabel: 'Add happy hour item',
      }),
      subtitle('Other beverages'),
      fText('Heading', 'menus.bar.beverages.title'),
      fList('menus.bar.beverages.groups', {
        itemTitle: (g) => g.title || 'Group',
        sub: (g) => `${(g.items || []).length} items`,
        fields: (p) => [
          fText('Group title', `${p}.title`),
          fList(`${p}.items`, {
            flat: true,
            itemTitle: (it) => it.name || 'Beverage',
            fields: (pp) => [el('div', { class: 'grid-2' }, [fText('Name', `${pp}.name`), fText('Price', `${pp}.price`)])],
            newItem: () => ({ name: '', price: '' }),
            addLabel: 'Add beverage',
          }),
        ],
        newItem: () => ({ title: '', items: [] }),
        addLabel: 'Add beverage group',
      }),
    ],
  },
];

// ---------- navigation / drawer ----------

function renderNav() {
  const navEl = $('#panel-nav');
  navEl.innerHTML = '';
  for (const p of PANELS) {
    if (p.group) {
      navEl.appendChild(el('div', { class: 'group' }, [p.group]));
      continue;
    }
    navEl.appendChild(
      el('a', {
        href: '#' + p.id,
        class: p.id === activePanel ? 'active' : '',
        html: (ICONS[p.icon] || '') + `<span>${p.title}</span>`,
        onclick: (e) => {
          e.preventDefault();
          activePanel = p.id;
          history.replaceState(null, '', '#' + p.id);
          renderNav();
          renderPanel();
          closeDrawer();
          $('.panel-scroll').scrollTop = 0;
        },
      })
    );
  }
}

function openDrawer() {
  $('#sidebar').classList.add('open');
  $('#scrim').classList.add('show');
}

function closeDrawer() {
  $('#sidebar').classList.remove('open');
  $('#scrim').classList.remove('show');
}

// ---------- panel rendering ----------

function renderPanel() {
  const panel = PANELS.find((p) => p.id === activePanel);
  if (!panel) return;
  $('#panel-title').textContent = panel.title;
  $('#panel-desc').textContent = panel.desc || '';
  $('#preview-link').href = panel.preview || '/';
  const body = $('#panel-body');
  body.innerHTML = '';
  for (const node of panel.render()) body.appendChild(node);
  syncPreviewSrc();
}

// ---------- live preview ----------

const previewState = {
  on: localStorage.getItem('fb-preview') === '1',
  device: localStorage.getItem('fb-preview-device') || 'desktop',
};

function syncPreviewUI() {
  const pane = $('#preview-pane');
  const btn = $('#preview-toggle');
  pane.hidden = !previewState.on;
  btn.classList.toggle('active', previewState.on);
  $('#preview-stage').classList.toggle('mobile', previewState.device === 'mobile');
  $('#dev-desktop').classList.toggle('active', previewState.device === 'desktop');
  $('#dev-mobile').classList.toggle('active', previewState.device === 'mobile');
  if (previewState.on) syncPreviewSrc(true);
}

function syncPreviewSrc(force) {
  if (!previewState.on) return;
  const panel = PANELS.find((p) => p.id === activePanel);
  const frame = $('#preview-frame');
  const target = (panel && panel.preview) || '/';
  const current = frame.getAttribute('data-path');
  if (force || current !== target) {
    frame.setAttribute('data-path', target);
    frame.src = target;
  }
}

function refreshPreview() {
  if (!previewState.on) return;
  const frame = $('#preview-frame');
  frame.src = (frame.getAttribute('data-path') || '/') + '?_=' + Date.now();
}

// ---------- toast / save ----------

function toast(msg, cls) {
  const t = $('#toast');
  t.innerHTML = (cls === 'err' ? ICONS.alert : ICONS.checkCircle) + `<span>${msg}</span>`;
  t.className = 'toast ' + (cls || '');
  t.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { t.hidden = true; }, 2600);
}

async function save() {
  if (!dirty) return;
  const btn = $('#save');
  btn.classList.add('saving');
  $('.save-label', btn).textContent = 'Saving…';
  try {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error || 'Save failed');
    markSaved();
    toast('Saved — the live site is updated', 'ok');
    refreshPreview();
  } catch (e) {
    markDirty();
    toast(e.message, 'err');
  }
}

window.addEventListener('beforeunload', (e) => {
  if (dirty) { e.preventDefault(); e.returnValue = ''; }
});

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    save();
  }
});

window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (id !== activePanel && PANELS.some((p) => p.id === id)) {
    activePanel = id;
    renderNav();
    renderPanel();
    closeDrawer();
    $('.panel-scroll').scrollTop = 0;
  }
});

// ---------- init ----------

(async function init() {
  const res = await fetch('/api/content');
  state = await res.json();

  if (location.hash && PANELS.some((p) => p.id === location.hash.slice(1))) {
    activePanel = location.hash.slice(1);
  }

  // static icons
  $('#menu-btn').innerHTML = ICONS.menu;
  $('#sidebar-close').innerHTML = ICONS.x;
  $('.foot-icon').innerHTML = ICONS.globe;
  $('#preview-toggle').innerHTML = ICONS.eye + '<span>Preview</span>';
  $('#preview-link').innerHTML = ICONS.external + '<span>Open page</span>';
  $('#preview-refresh').innerHTML = ICONS.refresh;
  $('#dev-desktop').innerHTML = ICONS.monitor;
  $('#dev-mobile').innerHTML = ICONS.smartphone;
  $('.save-icon').innerHTML = ICONS.check;

  // events
  $('#save').addEventListener('click', save);
  $('#menu-btn').addEventListener('click', openDrawer);
  $('#sidebar-close').addEventListener('click', closeDrawer);
  $('#scrim').addEventListener('click', closeDrawer);
  $('#preview-toggle').addEventListener('click', () => {
    previewState.on = !previewState.on;
    localStorage.setItem('fb-preview', previewState.on ? '1' : '0');
    syncPreviewUI();
  });
  $('#preview-refresh').addEventListener('click', refreshPreview);
  $('#dev-desktop').addEventListener('click', () => {
    previewState.device = 'desktop';
    localStorage.setItem('fb-preview-device', 'desktop');
    syncPreviewUI();
  });
  $('#dev-mobile').addEventListener('click', () => {
    previewState.device = 'mobile';
    localStorage.setItem('fb-preview-device', 'mobile');
    syncPreviewUI();
  });

  renderNav();
  renderPanel();
  syncPreviewUI();
})();

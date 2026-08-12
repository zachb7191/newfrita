const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const render = require('./lib/render');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONTENT_FILE = path.join(ROOT, 'content.json');
const PORT = process.env.PORT || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

function loadContent() {
  return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
}

function saveContent(obj) {
  const tmp = CONTENT_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, CONTENT_FILE);
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function sendJSON(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}

function serveStatic(res, urlPath) {
  const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const file = path.join(PUBLIC_DIR, safe);
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'Forbidden');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found');
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    send(res, 200, data, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
  });
}

function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const PAGE_SLUGS = ['food', 'menu-guide', 'catering', 'chef', 'philosophy', 'photos', 'praise', 'contact', 'frita-gear'];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname.replace(/\/+$/, '') || '/';

  try {
    // ----- API -----
    if (p === '/api/content' && req.method === 'GET') {
      return sendJSON(res, 200, loadContent());
    }
    if (p === '/api/content' && req.method === 'PUT') {
      const body = await readBody(req, 5 * 1024 * 1024);
      let obj;
      try {
        obj = JSON.parse(body.toString('utf8'));
      } catch {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
      if (!obj || typeof obj !== 'object' || !obj.site || !obj.pages || !obj.menus) {
        return sendJSON(res, 400, { error: 'Content must include site, pages, and menus' });
      }
      saveContent(obj);
      return sendJSON(res, 200, { ok: true });
    }
    if (p === '/api/upload' && req.method === 'POST') {
      const body = await readBody(req, 25 * 1024 * 1024);
      let obj;
      try {
        obj = JSON.parse(body.toString('utf8'));
      } catch {
        return sendJSON(res, 400, { error: 'Invalid JSON' });
      }
      const m = /^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/.exec(obj.data || '');
      if (!m) return sendJSON(res, 400, { error: 'data must be a base64 image data URL' });
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
      const base = String(obj.filename || 'image')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[^a-z0-9_-]+/gi, '-')
        .slice(0, 60) || 'image';
      const name = `${base}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
      fs.writeFileSync(path.join(PUBLIC_DIR, 'uploads', name), Buffer.from(m[2], 'base64'));
      return sendJSON(res, 200, { url: `/uploads/${name}` });
    }

    // ----- Admin -----
    if (p === '/admin') {
      return serveStatic(res, '/admin.html');
    }

    // ----- Pages -----
    if (req.method === 'GET') {
      const content = loadContent();
      if (p === '/') {
        return send(res, 200, render.landing(content), { 'Content-Type': 'text/html; charset=utf-8' });
      }
      if (p === '/ann-arbor') {
        return send(res, 200, render.home(content), { 'Content-Type': 'text/html; charset=utf-8' });
      }
      const slug = p.slice(1);
      if (PAGE_SLUGS.includes(slug)) {
        return send(res, 200, render.page(content, slug), { 'Content-Type': 'text/html; charset=utf-8' });
      }
      return serveStatic(res, p);
    }

    send(res, 405, 'Method not allowed');
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Frita Batidos site running at http://localhost:${PORT}`);
  console.log(`Admin at http://localhost:${PORT}/admin`);
});

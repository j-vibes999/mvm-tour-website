import { createServer, get } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = '/.well-known/mvm-local-preview';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.map': 'application/json',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

export async function missingDependencies(projectRoot) {
  const pkg = JSON.parse(await readFile(join(projectRoot, 'package.json'), 'utf8'));
  const require = createRequire(join(projectRoot, 'package.json'));
  return Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(name => {
    try { require.resolve(name); return false; } catch { return true; }
  });
}

function npm(projectRoot, args) {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, args, { cwd: projectRoot, stdio: 'inherit' });
  if (result.error?.code === 'ENOENT') throw new Error('ไม่พบ npm กรุณาติดตั้ง Node.js พร้อม npm แล้วลองอีกครั้ง');
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(args[0] === 'ci' ? 'ติดตั้งไฟล์ที่จำเป็นไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง' : 'สร้างเว็บไม่สำเร็จ กรุณาตรวจข้อความด้านบนแล้วลองอีกครั้ง');
}

async function prepareSite(projectRoot) {
  if ((await missingDependencies(projectRoot)).length) {
    console.log('กำลังติดตั้งไฟล์ที่จำเป็นสำหรับสร้างเว็บ…');
    npm(projectRoot, ['ci', '--include=dev']);
  }
  console.log('กำลังสร้างเว็บจากต้นฉบับล่าสุด…');
  npm(projectRoot, ['run', 'build']);
}

function serverIdentity(port) {
  return new Promise(resolveIdentity => {
    const req = get({ hostname: '127.0.0.1', port, path: MARKER, agent: false }, res => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { text += chunk; if (text.length > 4096) req.destroy(); });
      res.on('end', () => {
        try { resolveIdentity(res.statusCode === 200 ? JSON.parse(text) : null); }
        catch { resolveIdentity(null); }
      });
      res.on('error', () => resolveIdentity(null));
    });
    req.setTimeout(600, () => req.destroy());
    req.on('error', () => resolveIdentity(null));
  });
}

const isWithin = (root, path) => path === root || path.startsWith(root + sep);
function builtServer(projectRoot, buildRoot) {
  return createServer(async (req, res) => {
    const send = (status, body, type = 'text/plain; charset=utf-8') => {
      res.writeHead(status, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); send(405, 'Method not allowed'); return; }
    let pathname;
    try { pathname = decodeURIComponent((req.url || '/').split('?')[0]); }
    catch { send(400, 'Invalid path'); return; }
    if (!pathname.startsWith('/') || pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').some(part => part === '.' || part === '..')) { send(400, 'Invalid path'); return; }
    if (pathname === MARKER) { send(200, JSON.stringify({ app: 'mvm-local-preview', version: 1, root: projectRoot }), 'application/json; charset=utf-8'); return; }
    try {
      let file = await realpath(resolve(buildRoot, '.' + pathname));
      if (!isWithin(buildRoot, file)) { send(403, 'Forbidden'); return; }
      if ((await stat(file)).isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(308, { Location: pathname + '/' }); res.end(); return; }
        file = await realpath(join(file, 'index.html'));
      }
      if (!isWithin(buildRoot, file)) { send(403, 'Forbidden'); return; }
      const info = await stat(file);
      if (!info.isFile()) { send(404, 'Not found'); return; }
      res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      if (req.method === 'HEAD') { res.end(); return; }
      const stream = createReadStream(file);
      stream.on('error', () => res.destroy());
      res.on('close', () => stream.destroy());
      stream.pipe(res);
    } catch (error) { send(error.code === 'EACCES' ? 403 : 404, 'Not found'); }
  });
}

function openPreview(url) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { stdio: 'ignore' });
  child.on('error', () => console.error(`เปิดเบราว์เซอร์อัตโนมัติไม่ได้ กรุณาเปิด ${url}`));
  child.unref();
}

export async function startPreview({ projectRoot = PROJECT_ROOT, port = 4173, prepare = true, openBrowser = true } = {}) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('พอร์ตไม่ถูกต้อง');
  projectRoot = await realpath(projectRoot);
  if (prepare) await prepareSite(projectRoot);
  const buildRoot = await realpath(join(projectRoot, 'build'));
  for (let candidate = port; candidate <= Math.min(port + 99, 65535); candidate++) {
    const identity = candidate ? await serverIdentity(candidate) : null;
    if (identity?.app === 'mvm-local-preview' && identity.version === 1 && identity.root === projectRoot) {
      const url = `http://127.0.0.1:${candidate}/`;
      if (openBrowser) openPreview(url);
      return { url, reused: true, close: async () => {} };
    }
    const server = builtServer(projectRoot, buildRoot);
    try {
      await new Promise((ready, reject) => {
        const failed = error => { server.off('listening', ready); reject(error); };
        server.once('error', failed);
        server.once('listening', () => { server.off('error', failed); ready(); });
        server.listen(candidate, '127.0.0.1');
      });
    } catch (error) {
      if (error.code === 'EADDRINUSE') continue;
      throw error;
    }
    const url = `http://127.0.0.1:${server.address().port}/`;
    const close = () => new Promise(resolveClose => {
      if (!server.listening) { resolveClose(); return; }
      server.close(resolveClose);
      server.closeAllConnections?.();
    });
    if (openBrowser) openPreview(url);
    return { url, reused: false, close };
  }
  throw new Error('ไม่พบพอร์ตว่างสำหรับเปิดเว็บ กรุณาปิดหน้าต่าง preview ที่ไม่ใช้แล้วลองอีกครั้ง');
}

async function main() {
  const preview = await startPreview({ openBrowser: !process.argv.includes('--no-open') });
  console.log(`${preview.reused ? 'เว็บนี้เปิดอยู่แล้วที่' : 'เปิดเว็บ MVM Group ที่'} ${preview.url}`);
  if (preview.reused) return;
  console.log('เปิดหน้าต่างนี้ค้างไว้ระหว่างดูเว็บ กด Ctrl+C หรือปิดหน้าต่างเพื่อหยุด');
  const stop = async () => { await preview.close(); process.exit(0); };
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, stop);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`เปิดเว็บไม่สำเร็จ: ${error.message}`); process.exitCode = 1; });
}

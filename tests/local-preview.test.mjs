import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer, request } from 'node:http';

async function previewModule() {
  await assert.doesNotReject(access(new URL('../scripts/serve-local.mjs', import.meta.url)), 'the build-aware local preview server must exist');
  return import('../scripts/serve-local.mjs');
}
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'mvm preview '));
  await mkdir(join(root, 'dist'), { recursive: true });
  await mkdir(join(root, 'build/en/province/luang-prabang'), { recursive: true });
  await writeFile(join(root, 'dist/index.html'), 'editable source, never served directly');
  await writeFile(join(root, 'build/en/province/luang-prabang/index.html'), 'stale generated page');
  await writeFile(join(root, 'build/index.html'), 'fixture root');
  await writeFile(join(root, 'build/app.js'), 'window.fixture = true;');
  await writeFile(join(root, 'package.json'), JSON.stringify({ private: true, scripts: { build: 'node make-build.mjs' } }));
  await writeFile(join(root, 'make-build.mjs'), `import {writeFile} from 'node:fs/promises'; await writeFile('build/en/province/luang-prabang/index.html','fresh generated deep page');`);
  return root;
}
async function listen(server) {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return server.address().port;
}
async function close(server) {
  server.closeAllConnections?.();
  if (server.listening) await new Promise(resolve => server.close(resolve));
}
async function rawGet(url, path) {
  return new Promise((resolve, reject) => {
    const req = request(new URL(url), { path }, res => {
      let text = ''; res.setEncoding('utf8'); res.on('data', chunk => { text += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, text }));
    });
    req.on('error', reject); req.end();
  });
}

test('local preview builds before serving a fresh localized deep page and identifies its actual root', async () => {
  const { startPreview } = await previewModule();
  const root = await fixture(); let preview;
  try {
    preview = await startPreview({ projectRoot: root, port: 0, openBrowser: false });
    const response = await fetch(preview.url + 'en/province/luang-prabang/');
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'fresh generated deep page');
    assert.match(response.headers.get('content-type'), /^text\/html/);
    const marker = await (await fetch(preview.url + '.well-known/mvm-local-preview')).json();
    assert.equal(marker.root, await (await import('node:fs/promises')).realpath(root));
    assert.equal(marker.app, 'mvm-local-preview');
    assert.equal((await fetch(preview.url + 'dist/index.html')).status, 404);
    const script = await fetch(preview.url + 'app.js');
    assert.match(script.headers.get('content-type'), /javascript/);
    assert.equal(await script.text(), 'window.fixture = true;');
    const head = await fetch(preview.url + 'app.js', { method: 'HEAD' });
    assert.equal(await head.text(), '');
  } finally { await preview?.close(); await rm(root, { recursive: true, force: true }); }
});

test('a listener claiming another root stays running while the preview chooses another port', async () => {
  const { startPreview } = await previewModule();
  const root = await fixture(); let preview;
  const unrelated = createServer((req, res) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ app: 'mvm-local-preview', root: '/another/project', version: 1 })); });
  const occupied = await listen(unrelated);
  try {
    preview = await startPreview({ projectRoot: root, port: occupied, prepare: false, openBrowser: false });
    assert.notEqual(new URL(preview.url).port, String(occupied));
    assert.equal((await fetch(preview.url)).status, 200);
    assert.equal((await fetch(`http://127.0.0.1:${occupied}/`)).status, 200);
  } finally { await preview?.close(); await close(unrelated); await rm(root, { recursive: true, force: true }); }
});

test('reopening the same project reuses its verified server without taking ownership', async () => {
  const { startPreview } = await previewModule();
  const root = await fixture(); let first, second;
  try {
    first = await startPreview({ projectRoot: root, port: 0, prepare: false, openBrowser: false });
    second = await startPreview({ projectRoot: root, port: Number(new URL(first.url).port), prepare: false, openBrowser: false });
    assert.equal(second.reused, true);
    assert.equal(second.url, first.url);
    await second.close();
    assert.equal((await fetch(first.url)).status, 200);
  } finally { await first?.close(); await rm(root, { recursive: true, force: true }); }
});

test('preview rejects path traversal, symlink escapes and unsupported methods', async () => {
  const { startPreview } = await previewModule();
  const root = await fixture(); let preview;
  try {
    await writeFile(join(root, 'private.txt'), 'outside build');
    await symlink(join(root, 'private.txt'), join(root, 'build/leak.txt'));
    preview = await startPreview({ projectRoot: root, port: 0, prepare: false, openBrowser: false });
    for (const path of ['/../private.txt', '/%2e%2e/private.txt', '/%2e%2e%2fprivate.txt', '/%00', '/%zz', '/leak.txt']) {
      const response = await rawGet(preview.url, path);
      assert.ok([400, 403, 404].includes(response.status), `${path}: ${response.status}`);
      assert.ok(!response.text.includes('outside build'), path);
    }
    assert.equal((await fetch(preview.url, { method: 'POST' })).status, 405);
    assert.equal((await fetch(preview.url + 'missing/')).status, 404);
  } finally { await preview?.close(); await rm(root, { recursive: true, force: true }); }
});

test('dependency detection requires only packages declared by this project', async () => {
  const { missingDependencies } = await previewModule();
  const root = await fixture();
  try {
    assert.deepEqual(await missingDependencies(root), []);
    await writeFile(join(root, 'package.json'), JSON.stringify({ dependencies: { 'fixture-dependency': '1.0.0' } }));
    assert.deepEqual(await missingDependencies(root), ['fixture-dependency']);
    await mkdir(join(root, 'node_modules/fixture-dependency'), { recursive: true });
    await writeFile(join(root, 'node_modules/fixture-dependency/package.json'), JSON.stringify({ name: 'fixture-dependency', version: '1.0.0', main: 'index.js' }));
    await writeFile(join(root, 'node_modules/fixture-dependency/index.js'), 'module.exports = {};');
    assert.deepEqual(await missingDependencies(root), []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

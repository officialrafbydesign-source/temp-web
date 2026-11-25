// Isolated admin-save fixtures: no live database, R2 access or release edits.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'Node' } });
const root = path.resolve(__dirname, '..');
let state;
const files = { mp3: { key: 'music/track.mp3', name: 'Track.mp3', bytes: 100 }, wav: { key: 'music/track.wav', name: 'Track.wav', bytes: 200 } };
const originalLoad = Module._load;
const db = {
  musicProduct: { findUnique: async () => {
    if (state.lookupError) throw state.lookupError;
    return { id: 'product-a', releaseId: 'release-a', release: { songs: [{ id: 'track-a' }] } };
  } },
  $transaction: async (callback, options) => {
    state.options = options;
    if (state.transactionError) throw state.transactionError;
    const calls = [];
    const result = await callback({
      artist: { upsert: async () => ({ id: 'artist-a' }) },
      release: { update: async args => { calls.push({ release: args }); return {}; }, create: async args => { calls.push({ release: args }); return { id: 'release-a' }; } },
      song: { update: async args => { calls.push({ track: args }); return {}; }, create: async () => assert.fail('existing track should not be recreated'), deleteMany: async () => assert.fail('existing track should not be removed') },
      musicProduct: {
        update: async args => { calls.push({ product: args }); return { id: 'product-a', release: { type: 'single' } }; },
        create: async args => { calls.push({ product: args }); return { id: 'product-a', release: { type: 'single' } }; }
      }
    });
    state.committed = calls;
    return result;
  }
};
Module._load = function (name, parent, isMain) {
  if (name === 'server-only') return {};
  if (name === '@/lib/prisma') return { prisma: db };
  if (name === '@/lib/adminApi') return { authorizeAdminApi: async () => state.admin ? { authorized: true, user: { id: 'admin-a' } } : { authorized: false, response: new Response('{}', { status: 403 }) } };
  if (name === '@/lib/catalogueAdmin') return {};
  if (name.startsWith('@/lib/')) return originalLoad.call(this, path.join(root, 'lib', name.slice(6) + '.ts'), parent, isMain);
  return originalLoad.call(this, name, parent, isMain);
};
const { musicProductError } = require('../lib/musicProductErrors.ts');
const route = require('../app/api/admin/music-products/route.ts');
const body = () => ({ id: 'product-a', title: 'Existing single', artist: 'Fixture artist', price: 0.99, coverUrl: 'https://images.invalid/cover.jpg', type: 'DIGITAL', musicType: 'single', downloadFiles: {}, tracks: [{ id: 'track-a', title: 'Existing single', audioUrl: 'https://public.invalid/track.mp3', fileUrl: 'old/track.mp3', downloadFiles: files, sellIndividually: true, price: 0.99 }] });
const request = (method, data = body()) => new Request('https://raf.invalid/api/admin/music-products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
test.beforeEach(() => { state = { admin: true, committed: null }; });
test('existing single retains track ID, streaming URL and independent paid formats', async () => {
  const response = await route.PUT(request('PUT'));
  assert.equal(response.status, 200);
  const track = state.committed.find(x => x.track).track;
  assert.equal(track.where.id, 'track-a');
  assert.equal(track.data.audioUrl, 'https://public.invalid/track.mp3');
  assert.equal(track.data.fileUrl, 'old/track.mp3');
  assert.deepEqual(track.data.downloadFiles, files);
  assert.equal(state.committed.find(x => x.release).release.data.type, 'single');
  assert.deepEqual(state.options, { maxWait: 10000, timeout: 20000 });
});
test('new single uses the same bounded save transaction', async () => {
  const response = await route.POST(request('POST'));
  assert.equal(response.status, 201);
  assert.deepEqual(state.options, { maxWait: 10000, timeout: 20000 });
});
test('missing deployment fields return actionable schema error', async () => {
  state.lookupError = { code: 'P2022', message: 'private raw SQL and secrets' };
  const response = await route.PUT(request('PUT'));
  assert.equal(response.status, 503);
  const result = await response.json();
  assert.equal(result.code, 'P2022');
  assert.match(result.error, /database update/);
  assert.ok(!JSON.stringify(result).includes('private raw SQL'));
});
test('transaction failures preserve the error code without claiming a successful save', async () => {
  state.transactionError = { code: 'P2028', meta: { error: 'expired' } };
  const response = await route.PUT(request('PUT'));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).code, 'P2028');
  assert.equal(state.committed, null);
});
test('connection, conflict and validation failures have safe messages and statuses', () => {
  for (const code of ['P1017', 'P2024', 'P2037']) assert.equal(musicProductError({ code }).status, 503);
  for (const code of ['P2002', 'P2003', 'P2025', 'P2034']) assert.equal(musicProductError({ code }).status, 409);
  assert.equal(musicProductError({ name: 'PrismaClientValidationError' }).status, 400);
  assert.equal(musicProductError(new SyntaxError()).status, 400);
  const result = musicProductError({ code: 'unsafe text', message: 'postgresql://secret', meta: { token: 'secret' } });
  assert.equal(result.status, 500);
  assert.ok(!JSON.stringify(result).includes('secret'));
});
test('invalid paid references are rejected before opening a transaction', async () => {
  const data = body();data.tracks[0].downloadFiles = { mp3: { key: 'https://public.invalid/track.mp3' } };
  const response = await route.PUT(request('PUT', data));
  assert.equal(response.status, 400);
  assert.equal(state.options, undefined);
});
test('unauthorised requests cannot enter the save transaction', async () => {
  state.admin = false;
  assert.equal((await route.PUT(request('PUT'))).status, 403);
  assert.equal(state.options, undefined);
});

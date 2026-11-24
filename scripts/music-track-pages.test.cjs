// Run: node --test scripts/music-track-pages.test.cjs
// Uses isolated database/auth/storage fixtures. No live services are contacted.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'Node', jsx: 'react-jsx' } });
const root = path.resolve(__dirname, '..');
let state;
const publicTrack = () => ({
  id: 'track-a', title: 'Test track', audioUrl: 'https://preview.invalid/track.mp3', duration: 183, isrc: null,
  trackNo: 1, price: 0.99, sellIndividually: true,
  artist: { id: 'artist-a', name: 'Trexx', slug: 'trexx', isProfilePublished: true },
  release: { id: 'release-a', title: 'Test album', coverUrl: 'https://images.invalid/cover.jpg', genre: 'Hip-Hop', releaseDate: null, standardLinks: [], _count: { songs: 2 }, product: { id: 'product-a', price: 5, itemType: 'DIGITAL', stock: null } },
});
const purchase = (productId, userId = 'user-a', status = 'paid', productType = 'music') => ({ id: `item-${productId}`, orderId: `order-${productId}`, productId, productType, order: { userId, status } });
function reset() {
  state = { user: null, published: true, deleted: false, items: [], calls: [], signings: [], songKey: 'private/track.wav', releaseKey: 'private/album.zip', itemType: 'DIGITAL', publicTrack: publicTrack() };
}
reset();
const db = {
  song: {
    findFirst: async args => {
      state.calls.push({ key: 'song.findFirst', args });
      assert.deepEqual(args.where.release.product.is, { isPublished: true, deletedAt: null });
      return state.published && !state.deleted && args.where.id === 'track-a' ? state.publicTrack : null;
    },
    findUnique: async args => {
      state.calls.push({ key: 'song.findUnique', args });
      return args.where.id === 'track-a' ? { id: 'track-a', fileUrl: state.songKey, release: { product: { id: 'product-a', itemType: state.itemType, fileUrl: state.releaseKey } } } : null;
    },
  },
  orderItem: { findMany: async args => {
    state.calls.push({ key: 'orderItem.findMany', args });
    return state.items.filter(item => item.productType === args.where.productType && args.where.productId.in.includes(item.productId) && item.order.userId === args.where.order.is.userId && args.where.order.is.status.in.includes(item.order.status));
  } },
};
const originalLoad = Module._load;
Module._load = function(name, parent, isMain) {
  if (name === 'server-only') return {};
  if (name === '@/lib/prisma') return { prisma: db };
  if (name === '@/lib/auth') return { getCurrentUser: async () => state.user };
  if (name === '@/lib/r2') return { getPresignedDownloadUrl: async key => { state.signings.push(key); return 'https://storage.invalid/temporary-download'; } };
  if (name.startsWith('@/lib/')) return originalLoad.call(this, path.join(root, 'lib', name.slice(6) + '.ts'), parent, isMain);
  if (name.startsWith('@/components/')) return originalLoad.call(this, path.join(root, 'app/components', name.slice(13) + '.tsx'), parent, isMain);
  if (name.startsWith('@/app/')) return originalLoad.call(this, path.join(root, 'app', name.slice(6) + '.tsx'), parent, isMain);
  return originalLoad.call(this, name, parent, isMain);
};
const server = require('../lib/musicTracksServer.ts');
const links = require('../lib/musicTrackLinks.ts');
const accessRoute = require('../app/api/music/tracks/[id]/access/route.ts');
const downloadRoute = require('../app/api/music/tracks/[id]/download/route.ts');
const page = require('../app/music/tracks/[id]/page.tsx');
const save = require('../lib/musicProductSave.ts');
const request = () => new Request('https://rafbydesign.co.uk/api/music/tracks/track-a/download');
const context = id => ({ params: Promise.resolve({ id: id || 'track-a' }) });
test.beforeEach(reset);

test('story links use the public domain and stable encoded song IDs', () => {
  assert.equal(links.musicTrackUrl('track-a'), 'https://rafbydesign.co.uk/music/tracks/track-a');
  assert.equal(links.musicTrackPath('a/b?c'), '/music/tracks/a%2Fb%3Fc');
});
test('public track selection contains no private download fields', async () => {
  const track = await server.getPublicMusicTrack('track-a');
  assert.equal(track.title, 'Test track');
  assert.ok(!JSON.stringify(state.calls[0].args.select).includes('fileUrl'));
});
test('hidden, deleted and missing tracks are unavailable publicly', async () => {
  state.published = false; assert.equal(await server.getPublicMusicTrack('track-a'), null);
  state.published = true; state.deleted = true; assert.equal(await server.getPublicMusicTrack('track-a'), null);
  state.deleted = false; assert.equal(await server.getPublicMusicTrack('missing'), null);
});
test('anonymous download checks contain no purchase information and make no database calls', async () => {
  const response = await accessRoute.GET(request(), context());
  assert.deepEqual(await response.json(), { signedIn: false, owned: false, downloadHref: null, releaseDownloadHref: null });
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.equal(state.calls.length, 0);
});
test('individual track purchases grant that track only', async () => {
  state.user = { id: 'user-a' }; state.items = [purchase('track-a')];
  const response = await accessRoute.GET(request(), context());
  const data = await response.json();
  assert.equal(data.owned, true); assert.equal(data.downloadHref, '/api/music/tracks/track-a/download');
  assert.equal(data.releaseDownloadHref, null);
  assert.ok(!JSON.stringify(data).includes('private/')); assert.ok(!('trackFileKey' in data));
});
test('full digital-release buyers can download a track and the full release', async () => {
  state.items = [purchase('product-a')];
  const owned = await server.getMusicTrackPurchase('user-a', 'track-a');
  assert.equal(owned.trackFileKey, 'private/track.wav');
  assert.equal(owned.releaseDownloadHref, '/api/account/orders/order-product-a/items/item-product-a/download');
});
test('physical purchases do not grant digital track downloads', async () => {
  state.itemType = 'PHYSICAL'; state.items = [purchase('product-a')];
  assert.equal(await server.getMusicTrackPurchase('user-a', 'track-a'), null);
});
test('another user, another track, another product type and unpaid orders cannot unlock a track', async () => {
  for (const item of [purchase('track-a', 'other-user'), purchase('track-b'), purchase('track-a', 'user-a', 'pending'), purchase('track-a', 'user-a', 'cancelled'), purchase('track-a', 'user-a', 'paid', 'clothing')]) {
    state.items = [item];
    assert.equal(await server.getMusicTrackPurchase('user-a', 'track-a'), null);
  }
});
test('paid, processing, shipped and delivered purchases remain downloadable', async () => {
  for (const status of ['paid', 'processing', 'shipped', 'delivered']) {
    state.items = [purchase('track-a', 'user-a', status)];
    assert.ok((await server.getMusicTrackPurchase('user-a', 'track-a')).downloadHref);
  }
});
test('anonymous download redirects to sign-in with the track as return destination', async () => {
  const response = await downloadRoute.GET(request(), context());
  const url = new URL(response.headers.get('location'));
  assert.equal(url.pathname, '/login'); assert.equal(url.searchParams.get('returnTo'), '/music/tracks/track-a');
  assert.equal(state.signings.length, 0);
});
test('a guessed download URL cannot generate a signed file', async () => {
  state.user = { id: 'user-a' };
  const response = await downloadRoute.GET(request(), context());
  assert.equal(new URL(response.headers.get('location')).searchParams.get('download'), 'purchase-required');
  assert.equal(state.signings.length, 0);
});
test('ownership is rechecked before signing and hidden purchased releases remain downloadable', async () => {
  state.user = { id: 'user-a' }; state.items = [purchase('track-a')]; state.published = false;
  const response = await downloadRoute.GET(request(), context());
  assert.equal(response.headers.get('location'), 'https://storage.invalid/temporary-download');
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(state.signings, ['private/track.wav']);
  state.items = []; state.signings = [];
  await downloadRoute.GET(request(), context()); assert.equal(state.signings.length, 0);
});
test('missing per-track files fall back to the owned full-release download', async () => {
  state.user = { id: 'user-a' }; state.items = [purchase('product-a')]; state.songKey = null;
  const response = await downloadRoute.GET(request(), context());
  assert.equal(new URL(response.headers.get('location')).pathname, '/api/account/orders/order-product-a/items/item-product-a/download');
  assert.equal(state.signings.length, 0);
});
test('public URLs are not signed as private purchased files', async () => {
  state.user = { id: 'user-a' }; state.items = [purchase('track-a')]; state.songKey = 'https://public.invalid/full.wav';
  const response = await downloadRoute.GET(request(), context());
  assert.equal(new URL(response.headers.get('location')).searchParams.get('download'), 'pending');
  assert.equal(state.signings.length, 0);
});
test('social metadata identifies the exact track and canonical story link', async () => {
  const metadata = await page.generateMetadata(context());
  assert.equal(metadata.alternates.canonical, links.musicTrackUrl('track-a'));
  assert.equal(metadata.openGraph.title, 'Test track — Trexx');
  assert.equal(metadata.openGraph.images[0].url, 'https://images.invalid/cover.jpg');
  assert.ok(!JSON.stringify(metadata).includes('private/'));
});
test('page render contains the chosen track, purchase controls and no private keys', async () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { CartProvider } = require('../app/context/CartContext.tsx');
  const element = await page.default({ ...context(), searchParams: Promise.resolve({}) });
  const html = renderToStaticMarkup(React.createElement(CartProvider, null, element));
  for (const label of ['Test track', 'Trexx', 'Play track', 'Buy track', 'Buy full release', 'Copy story link']) assert.ok(html.includes(label), label);
  assert.ok(html.includes('0.99')); assert.ok(!html.includes('private/')); assert.ok(!html.includes('fileUrl'));
});
test('unpublished page returns a real not-found result', async () => {
  state.published = false;
  await assert.rejects(page.default({ ...context(), searchParams: Promise.resolve({}) }), /404/);
});

const originalFetch = global.fetch;
test.afterEach(() => { global.fetch = originalFetch; });
test('successful admin saves return the persisted release without extra writes', async () => {
  let calls = 0;
  global.fetch = async (_url, options) => { calls++; assert.equal(options.method, 'PUT'); return Response.json({ id: 'product-a', release: { title: 'Updated' } }); };
  assert.equal((await save.saveMusicProduct({ title: 'Updated' }, true)).release.title, 'Updated'); assert.equal(calls, 1);
});
test('lost save responses preserve uncertainty and are never automatically retried', async () => {
  let calls = 0;
  global.fetch = async () => { calls++; throw new TypeError('Failed to fetch'); };
  await assert.rejects(save.saveMusicProduct({ title: 'Updated' }, true), error => error instanceof save.MusicSaveInterrupted && /may have completed/.test(error.message));
  assert.equal(calls, 1);
});
test('HTML or incomplete success responses cannot be mistaken for a successful save', async () => {
  for (const response of [new Response('<html>proxy error</html>'), Response.json({})]) {
    global.fetch = async () => response;
    await assert.rejects(save.saveMusicProduct({}, false), save.MusicSaveInterrupted);
  }
});
test('server validation errors are shown directly to the admin', async () => {
  global.fetch = async () => Response.json({ error: 'A title is required.' }, { status: 400 });
  await assert.rejects(save.saveMusicProduct({}, true), /A title is required/);
});

// Run from the project root: node --test scripts/music-hub.test.cjs
// Database, authentication and R2 are mocked; no live data is read or written.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'Node', jsx: 'react-jsx' } });
const root = path.resolve(__dirname, '..');
let state;
const reset = () => { state = { user: null, admin: false, calls: [], handlers: { 'artistUpload.findFirst': () => ({ id: 'upload-a' }) }, signings: [] }; };
reset();
const db = new Proxy({}, { get(_target, table) {
  if (table === '$transaction') return async work => work(db);
  return new Proxy({}, { get(_model, operation) { return async args => {
    const key = `${String(table)}.${String(operation)}`;
    state.calls.push({ key, args });
    if (state.handlers[key]) return state.handlers[key](args);
    if (operation === 'findMany') return [];
    if (operation === 'updateMany') return { count: 1 };
    return null;
  }; } });
} });
const originalLoad = Module._load;
Module._load = function(name, parent, isMain) {
  if (name === 'server-only') return {};
  if (name === '@/lib/prisma') return { prisma: db };
  if (name === '@/lib/auth') return { getCurrentUser: async () => state.user };
  if (name === '@/lib/authRateLimit') return { consumeAuthRateLimit: async () => ({ allowed: state.uploadRateAllowed !== false }) };
  if (name === '@/lib/adminApi') return { authorizeAdminApi: async () => state.admin ? { authorized: true, user: state.user } : { authorized: false, response: new Response('{}', { status: 403 }) } };
  if (name === '@/lib/r2') return { getPresignedMediaUrl: async (key, download) => { state.signings.push({ key, download }); return 'https://media.invalid/temporary-file'; }, getArtistUploadUrl: async (key, contentType, byteSize) => { state.signings.push({ key, contentType, byteSize }); return 'https://media.invalid/upload'; } };
  if (name.startsWith('@/lib/')) return originalLoad.call(this, path.join(root, 'lib', name.slice(6) + '.ts'), parent, isMain);
  return originalLoad.call(this, name, parent, isMain);
};
const hub = require('../lib/musicHub.ts');
const server = require('../lib/musicHubServer.ts');
const artistRoute = require('../app/api/artist/route.ts');
const adminRoute = require('../app/api/admin/music-hub/route.ts');
const mediaRoute = require('../app/api/music/extras/[id]/media/route.ts');
const releasesRoute = require('../app/api/music/release/route.ts');
const uploadRoute = require('../app/api/artist/uploads/route.ts');
const previewRoute = require('../app/api/music/artist-media/[id]/route.ts');
const request = body => new Request('https://raf.invalid/api/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const verifiedUser = () => ({ id: 'user-a', email: 'artist-a@example.invalid', name: null, role: 'customer', emailVerifiedAt: new Date() });
const access = () => ({ id: 'access-a', artistId: 'artist-a', userId: 'user-a', isActive: true, agreementAcceptedAt: new Date(), agreementUrl: 'https://docs.invalid/agreement', agreementVersion: 'v1' });
const draft = () => ({ title: 'QA release', type: 'single', price: 1, fileUrl: 'private/release.zip', tracks: [{ title: 'QA track', audioUrl: 'https://preview.invalid/track.mp3', fileUrl: 'private/track.wav', sellIndividually: true, price: 1 }] });
test.beforeEach(reset);

test('access levels keep free public, free member and purchase extras separate', () => {
  assert.equal(hub.canAccessExtra('public', false, false), true);
  assert.equal(hub.canAccessExtra('members', false, false), false);
  assert.equal(hub.canAccessExtra('members', true, false), true);
  assert.equal(hub.canAccessExtra('purchase', true, false), false);
  assert.equal(hub.canAccessExtra('purchase', true, true), true);
  assert.equal(hub.canAccessExtra('purchase', false, true), false);
});
test('protected extras cannot be configured with a public full-media URL', () => {
  for (const level of ['members', 'purchase']) assert.throws(() => hub.extraInput({ artistId: 'artist-a', releaseId: 'release-a', title: 'Bonus', kind: 'video', access: level, url: 'https://public.invalid/bonus.mp4', fileKey: 'bonus.mp4' }), hub.MusicInputError);
});
test('purchase extras require a release and a private file key', () => {
  assert.throws(() => hub.extraInput({ artistId: 'artist-a', title: 'Bonus', kind: 'video', access: 'purchase', fileKey: 'bonus.mp4' }), hub.MusicInputError);
  assert.throws(() => hub.extraInput({ artistId: 'artist-a', releaseId: 'release-a', title: 'Bonus', kind: 'video', access: 'purchase' }), hub.MusicInputError);
});
test('RAF-only availability does not force a price or membership gate', () => {
  const extra = hub.extraInput({ artistId: 'artist-a', title: 'Art', kind: 'artwork', access: 'public', rafOnly: true, url: 'https://images.invalid/art.gif' });
  assert.equal(extra.access, 'public'); assert.equal(extra.rafOnly, true);
});
test('unsafe URL protocols and private object paths are rejected', () => {
  for (const url of ['javascript:alert(1)', 'http://example.invalid', 'https://user:password@example.invalid']) assert.throws(() => hub.webUrl(url), hub.MusicInputError);
  for (const key of ['../secret', '/absolute', 'https://bucket.invalid/a', 'folder/../a', 'folder\\a']) assert.throws(() => hub.privateKey(key), hub.MusicInputError);
});
test('external video embeds are limited to recognised video hosts', () => {
  assert.equal(hub.videoEmbedUrl('https://youtu.be/abcdefghijk'), 'https://www.youtube-nocookie.com/embed/abcdefghijk');
  assert.equal(hub.videoEmbedUrl('https://youtube.com.evil.invalid/watch?v=abcdefghijk'), null);
  assert.equal(hub.videoEmbedUrl('javascript:alert(1)'), null);
});
test('non-finite prices and paid tracks without private files are rejected', () => {
  for (const price of [NaN, Infinity, -1]) assert.throws(() => hub.money(price), hub.MusicInputError);
  const data = draft(); data.tracks[0].fileUrl = '';
  assert.throws(() => hub.submissionInput(data), hub.MusicInputError);
});
test('artist submissions reject anonymous visitors before accessing drafts', async () => {
  const response = await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', data: draft() }));
  assert.equal(response.status, 401); assert.equal(state.calls.length, 0);
});
test('a normal customer cannot self-assign artist or admin access', async () => {
  state.user = verifiedUser();
  const response = await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', role: 'admin', isActive: true, data: draft() }));
  assert.equal(response.status, 403); assert.equal(state.calls.some(call => call.key === 'artistSubmission.create'), false);
});
test('unverified accounts cannot access the artist workflow', async () => {
  state.user = { ...verifiedUser(), emailVerifiedAt: null };
  assert.equal((await artistRoute.GET()).status, 403);
});
test('an unaccepted agreement blocks track submissions', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = () => ({ ...access(), agreementAcceptedAt: null });
  assert.equal((await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', data: draft() }))).status, 403);
});
test('stale agreement acceptance is rejected', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  const response = await artistRoute.POST(request({ action: 'accept', artistId: 'artist-a', accepted: true, agreementVersion: 'old', agreementUrl: access().agreementUrl }));
  assert.equal(response.status, 400); assert.equal(state.calls.some(call => call.key === 'artistAccess.updateMany'), false);
});
test('agreement acceptance is restricted to the active current document/version', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  const response = await artistRoute.POST(request({ action: 'accept', artistId: 'artist-a', accepted: true, agreementVersion: 'v1', agreementUrl: access().agreementUrl }));
  assert.equal(response.status, 200);
  const call = state.calls.find(call => call.key === 'artistAccess.updateMany');
  assert.equal(call.args.where.isActive, true); assert.equal(call.args.where.agreementVersion, 'v1');
});
test('artist submissions are scoped to their own access and cannot publish', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  state.handlers['artistSubmission.create'] = args => ({ id: 'draft-a', status: args.data.status });
  const response = await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', submit: true, status: 'approved', isPublished: true, data: draft() }));
  assert.equal(response.status, 200);
  const call = state.calls.find(call => call.key === 'artistSubmission.create');
  assert.equal(call.args.data.status, 'submitted'); assert.equal(call.args.data.accessId, 'access-a');
  assert.equal(state.calls.some(call => call.key === 'musicProduct.create'), false);
});
test('artist A cannot edit an unowned draft', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  const response = await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', id: 'draft-b', data: draft() }));
  assert.equal(response.status, 400);
  const lookup = state.calls.find(call => call.key === 'artistSubmission.findFirst');
  assert.equal(lookup.args.where.accessId, 'access-a'); assert.equal(lookup.args.where.artistId, 'artist-a');
});
test('submitted tracks become immutable to the artist during review', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  state.handlers['artistSubmission.findFirst'] = () => ({ status: 'submitted' });
  assert.equal((await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', id: 'draft-a', data: draft() }))).status, 400);
});
test('artist A cannot append tracks to an unowned release', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  assert.equal((await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', targetReleaseId: 'release-b', data: draft() }))).status, 400);
  assert.equal(state.calls.find(call => call.key === 'release.findFirst').args.where.artistId, 'artist-a');
});
test('admin endpoints require admin authorisation', async () => {
  assert.equal((await adminRoute.GET()).status, 403);
  assert.equal((await adminRoute.POST(request({ action: 'artist', name: 'QA' }))).status, 403);
  assert.equal(state.calls.length, 0);
});
test('changing an artist agreement resets acceptance', async () => {
  state.admin = true;
  state.handlers['user.findFirst'] = () => ({ id: 'user-a', emailVerifiedAt: new Date() });
  state.handlers['artistAccess.findUnique'] = access;
  const response = await adminRoute.POST(request({ action: 'access', artistId: 'artist-a', email: 'artist-a@example.invalid', agreementUrl: 'https://docs.invalid/new', agreementVersion: 'v2' }));
  assert.equal(response.status, 200);
  assert.equal(state.calls.find(call => call.key === 'artistAccess.upsert').args.update.agreementAcceptedAt, null);
});
test('an extra cannot be attached to another artist’s release', async () => {
  state.admin = true; state.handlers['artist.findUnique'] = () => ({ id: 'artist-a' });
  const response = await adminRoute.POST(request({ action: 'extra', artistId: 'artist-a', releaseId: 'release-b', title: 'QA', kind: 'artwork', access: 'public', url: 'https://images.invalid/art.jpg' }));
  assert.equal(response.status, 400); assert.equal(state.calls.some(call => call.key === 'musicExtra.create'), false);
});
test('approval creates a hidden release and preserves existing track identities', async () => {
  state.admin = true;
  state.handlers['artistSubmission.findUnique'] = () => ({ id: 'draft-a', status: 'submitted', artistId: 'artist-a', targetReleaseId: null, data: draft(), access: access(), updatedAt: new Date() });
  state.handlers['release.create'] = () => ({ id: 'release-a' });
  const response = await adminRoute.POST(request({ action: 'review', id: 'draft-a', decision: 'approve' }));
  assert.equal(response.status, 200);
  assert.equal(state.calls.find(call => call.key === 'release.create').args.data.product.create.isPublished, false);
  assert.equal(state.calls.some(call => call.key === 'song.deleteMany'), false);
});
test('approval appends tracks after the existing track numbers', async () => {
  state.admin = true;
  state.handlers['artistSubmission.findUnique'] = () => ({ id: 'draft-a', status: 'submitted', artistId: 'artist-a', targetReleaseId: 'release-a', data: draft(), access: access(), updatedAt: new Date() });
  state.handlers['release.findFirst'] = () => ({ songs: [{ trackNo: 1 }, { trackNo: 4 }] });
  assert.equal((await adminRoute.POST(request({ action: 'review', id: 'draft-a', decision: 'approve' }))).status, 200);
  assert.equal(state.calls.find(call => call.key === 'song.createMany').args.data[0].trackNo, 5);
});
test('an already reviewed submission cannot be approved again', async () => {
  state.admin = true; state.handlers['artistSubmission.findUnique'] = () => ({ status: 'approved' });
  assert.equal((await adminRoute.POST(request({ action: 'review', id: 'draft-a', decision: 'approve' }))).status, 400);
  assert.equal(state.calls.some(call => call.key === 'song.createMany'), false);
});
test('revoked artist access blocks approval', async () => {
  state.admin = true; state.handlers['artistSubmission.findUnique'] = () => ({ status: 'submitted', access: { ...access(), isActive: false } });
  assert.equal((await adminRoute.POST(request({ action: 'review', id: 'draft-a', decision: 'approve' }))).status, 400);
});
test('locked extra metadata never includes private keys or full media URLs', async () => {
  state.handlers['musicExtra.findMany'] = () => [{ id: 'extra-a', title: 'QA', access: 'members', fileKey: 'private/secret.mp4', url: null, releaseId: null }];
  const result = await server.getHubExtras({ artistId: 'artist-a' });
  assert.equal(result[0].allowed, false); assert.equal(result[0].url, null);
  assert.equal(JSON.stringify(result).includes('private/secret'), false);
});
test('guessing a protected media URL does not issue a signed link', async () => {
  state.handlers['musicExtra.findFirst'] = () => ({ fileKey: 'secret.mp4', access: 'members', releaseId: null });
  assert.equal((await mediaRoute.GET(new Request('https://raf.invalid'), { params: Promise.resolve({ id: 'extra-a' }) })).status, 401);
  assert.equal(state.signings.length, 0);
});
test('a verified member receives a private, non-cacheable temporary media redirect', async () => {
  state.user = verifiedUser(); state.handlers['musicExtra.findFirst'] = () => ({ fileKey: 'secret.mp4', kind: 'video', access: 'members', releaseId: null });
  const response = await mediaRoute.GET(new Request('https://raf.invalid'), { params: Promise.resolve({ id: 'extra-a' }) });
  assert.equal(response.status, 307); assert.equal(response.headers.get('Cache-Control'), 'private, no-store'); assert.equal(state.signings.length, 1);
});
test('membership alone does not unlock purchase extras', async () => {
  state.user = verifiedUser(); state.handlers['musicExtra.findFirst'] = () => ({ fileKey: 'secret.mp4', access: 'purchase', releaseId: 'release-a' });
  state.handlers['musicProduct.findUnique'] = () => ({ id: 'product-a' });
  assert.equal((await mediaRoute.GET(new Request('https://raf.invalid'), { params: Promise.resolve({ id: 'extra-a' }) })).status, 403);
  assert.equal(state.signings.length, 0);
});
test('purchase access checks full-release products and paid statuses, including guest orders', async () => {
  state.user = verifiedUser(); state.handlers['musicProduct.findUnique'] = () => ({ id: 'product-a' }); state.handlers['order.findFirst'] = () => ({ id: 'order-a' });
  assert.equal(await server.ownsMusicRelease(state.user, 'release-a'), true);
  const where = state.calls.find(call => call.key === 'order.findFirst').args.where;
  assert.ok(where.status.in.includes('paid')); assert.equal(where.status.in.includes('pending'), false);
  assert.equal(where.AND[0].OR[0].items.some.productId, 'product-a');
  assert.equal(where.OR[1].userId, null); assert.equal(where.OR[1].email.equals, state.user.email);
});
test('public release responses omit all private download fields', async () => {
  state.handlers['musicProduct.findMany'] = () => [{ id: 'product-a', fileUrl: 'secret/release.zip', release: { id: 'release-a', artistId: 'artist-a', title: 'QA', artist: { name: 'QA' }, songs: [] } }];
  const response = await releasesRoute.GET();
  const result = await response.json();
  assert.equal(result[0].fileUrl, undefined); assert.equal(JSON.stringify(result).includes('secret/'), false);
  const call = state.calls.find(call => call.key === 'musicProduct.findMany');
  assert.equal(call.args.include.release.include.songs.select.fileUrl, undefined);
  assert.equal(call.args.where.isPublished, true);
});

test('artists cannot attach another account’s private download key', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  state.handlers['artistUpload.findFirst'] = () => null;
  const response = await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', data: draft() }));
  assert.equal(response.status, 400); assert.equal(state.calls.some(call => call.key === 'artistSubmission.create'), false);
});
test('signed upload requests require an approved artist account', async () => {
  assert.equal((await uploadRoute.POST(request({ artistId: 'artist-a' }))).status, 401);
  assert.equal(state.signings.length, 0);
});
test('upload type and size limits are enforced before signing', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  const input = { artistId: 'artist-a', purpose: 'artwork', fileName: 'qa.svg', contentType: 'image/svg+xml', byteSize: 100 };
  assert.equal((await uploadRoute.POST(request(input))).status, 400);
  assert.equal((await uploadRoute.POST(request({ ...input, fileName: 'qa.png', contentType: 'image/png', byteSize: 21 * 1024 * 1024 }))).status, 400);
  assert.equal(state.signings.length, 0);
});
test('upload URLs use a server-generated key scoped to the artist access', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  state.handlers['artistUpload.create'] = args => ({ ...args.data, id: 'upload-a' });
  const response = await uploadRoute.POST(request({ artistId: 'artist-a', purpose: 'preview', fileName: '../../qa.mp3', contentType: 'audio/mpeg', byteSize: 1024, fileKey: 'private/victim.mp3' }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.match(data.fileKey, /^artist-uploads\/access-a\/[a-f0-9-]+\.mp3$/);
  assert.equal(data.mediaUrl, '/api/music/artist-media/upload-a');
});
test('upload rate limiting prevents signing additional writes', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access; state.uploadRateAllowed = false;
  assert.equal((await uploadRoute.POST(request({ artistId: 'artist-a', purpose: 'preview', fileName: 'qa.mp3', contentType: 'audio/mpeg', byteSize: 1024 }))).status, 429);
  assert.equal(state.signings.length, 0);
});
test('private full downloads never become public previews', async () => {
  state.handlers['artistUpload.findUnique'] = () => ({ purpose: 'download', fileKey: 'private/full.wav' });
  assert.equal((await previewRoute.GET(new Request('https://raf.invalid'), { params: Promise.resolve({ id: 'upload-a' }) })).status, 404);
  assert.equal(state.signings.length, 0);
});
test('unpublished audio previews are inaccessible to anonymous visitors', async () => {
  state.handlers['artistUpload.findUnique'] = () => ({ purpose: 'preview', fileKey: 'private/preview.mp3', access: { userId: 'user-a', isActive: true } });
  assert.equal((await previewRoute.GET(new Request('https://raf.invalid'), { params: Promise.resolve({ id: 'upload-a' }) })).status, 404);
  assert.equal(state.signings.length, 0);
  const where = state.calls.find(call => call.key === 'song.findFirst').args.where;
  assert.equal(where.release.product.is.isPublished, true);
});
test('only a preview referenced by a published release becomes public', async () => {
  state.handlers['artistUpload.findUnique'] = () => ({ purpose: 'preview', fileKey: 'private/preview.mp3', access: { userId: 'user-a', isActive: true } });
  state.handlers['song.findFirst'] = () => ({ id: 'published-song' });
  assert.equal((await previewRoute.GET(new Request('https://raf.invalid'), { params: Promise.resolve({ id: 'upload-a' }) })).status, 307);
  assert.equal(state.signings.length, 1);
});
test('upload signatures bind file size and content type without making a network request', async () => {
  for (const name of ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PRIVATE_BUCKET_NAME']) process.env[name] = 'qa-placeholder';
  const r2 = require('../lib/r2.ts');
  const url = new URL(await r2.getArtistUploadUrl('artist-uploads/qa/file.mp3', 'audio/mpeg', 1024));
  const headers = url.searchParams.get('X-Amz-SignedHeaders');
  assert.ok(headers.includes('content-type')); assert.ok(headers.includes('content-length'));
  assert.equal(url.searchParams.has('x-amz-checksum-crc32'), false);
  assert.equal(url.searchParams.get('X-Amz-Expires'), '600');
});

test('incomplete work can be saved privately as a draft', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  state.handlers['artistSubmission.create'] = args => ({ id: 'draft-a', status: args.data.status });
  const response = await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', submit: false, data: { title: '', type: 'single', price: 0, tracks: [{ title: '', audioUrl: '' }] } }));
  assert.equal(response.status, 200); assert.equal((await response.json()).status, 'draft');
});
test('incomplete work cannot be submitted for publication', async () => {
  state.user = verifiedUser(); state.handlers['artistAccess.findUnique'] = access;
  const response = await artistRoute.POST(request({ action: 'save', artistId: 'artist-a', submit: true, data: { title: '', type: 'single', price: 0, tracks: [{ title: '', audioUrl: '' }] } }));
  assert.equal(response.status, 400);
});

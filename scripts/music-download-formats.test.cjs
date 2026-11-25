// Isolated fixtures only: no live database, Cloudflare files or payments.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const Module = require('node:module');
require('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'CommonJS', moduleResolution: 'Node', jsx: 'react-jsx' } });
process.env.AUTH_SECRET = 'qa-upload-session-secret-not-for-production';
const root = path.resolve(__dirname, '..');
let state;
const formats = () => ({ mp3: { key: 'private/track.mp3', name: 'Track.mp3', bytes: 100 }, wav: { key: 'private/track.wav', name: 'Track.wav', bytes: 200 } });
const zips = () => ({ mp3: { key: 'private/mp3.zip', name: 'Album MP3.zip', bytes: 1000 }, wav: { key: 'private/wav.zip', name: 'Album WAV.zip', bytes: 2000 } });
function reset() { state = { user: null, admin: false, ownTrack: false, ownRelease: false, trackFiles: formats(), releaseFiles: zips(), legacy: null, calls: [], signed: [], parts: [], head: null, rateAllowed: true }; }
reset();
const db = {
  song: { findUnique: async () => ({ id: 'track-a', fileUrl: state.legacy, downloadFiles: state.trackFiles, release: { product: { id: 'product-a', itemType: 'DIGITAL', fileUrl: null, downloadFiles: state.releaseFiles } } }) },
  orderItem: { findMany: async args => { state.calls.push(args); return args.where.order.is.userId === 'user-a' ? [ ...(state.ownTrack ? [{ id: 'track-item', orderId: 'order-a', productId: 'track-a' }] : []), ...(state.ownRelease ? [{ id: 'release-item', orderId: 'order-a', productId: 'product-a' }] : []) ] : []; }, findFirst: async () => state.ownRelease ? { id: 'release-item', orderId: 'order-a' } : null },
  musicProduct: { findUnique: async () => ({id:'product-a',release:{id:'release-a',songs:[{id:'track-a'}]}}), update:async args=>{state.calls.push({updateProduct:args});return {id:'product-a',release:{},downloadFiles:args.data.downloadFiles};}, findMany:async()=>[{id:'product-a',fileUrl:'private/old.zip',downloadFiles:zips(),release:{songs:[]}}], findFirst: async () => ({ id: 'product-a', itemType: 'DIGITAL', fileUrl: null, downloadFiles: state.releaseFiles }) },
  artist:{upsert:async()=>({id:'artist-a'})}, release:{update:async()=>({})}, beat:{findMany:async()=>[]},product:{findMany:async()=>[]},
  order: { findFirst: async args => args.where.userId === 'user-a' && state.ownTrack ? { items: [{ id: 'track-item', productType: 'music', productId: 'track-a' }] } : null },
};
db.$transaction = async fn=>fn(db);
db.song.update=async args=>{state.calls.push({updateSong:args});return args.data;};
db.song.deleteMany=async()=>({count:0});
const s3 = { send: async command => {
  const name = command.constructor.name;state.calls.push({ name, input: command.input });
  if (name === 'CreateMultipartUploadCommand') return { UploadId: 'upload-a' };
  if (name === 'ListPartsCommand') return { Parts: state.parts };
  if (name === 'HeadObjectCommand') return state.head || { ContentLength: 100, ContentType: 'audio/mpeg' };
  return {};
} };
const originalLoad = Module._load;
Module._load = function(name, parent, isMain) {
  if (name === 'server-only') return {};
  if (name === '@/lib/prisma') return { prisma: db };
  if (name === '@/lib/auth') return { getCurrentUser: async () => state.user };
  if (name === '@/lib/adminApi') return { authorizeAdminApi: async () => state.admin ? { authorized: true, user: state.user } : { authorized: false, response: new Response('{}', { status: 403 }) } };
  if (name === '@/lib/authRateLimit') return { consumeAuthRateLimit: async () => ({ allowed: state.rateAllowed }) };
  if (name === '@/lib/r2') return { r2Client: s3, privateBucketName: 'qa-private', getPresignedDownloadUrl: async key => { state.signed.push(key); return 'https://qa.invalid/download'; } };
  if (name === '@aws-sdk/s3-request-presigner') return { getSignedUrl: async (_client, command) => { state.calls.push({ sign: command.constructor.name, input: command.input }); return 'https://qa.invalid/upload'; } };
  if (name.startsWith('@/lib/')) return originalLoad.call(this, path.join(root, 'lib', name.slice(6) + '.ts'), parent, isMain);
  return originalLoad.call(this, name, parent, isMain);
};
const files = require('../lib/musicDownloadFiles.ts');
const uploads = require('../lib/musicUploadsServer.ts');
const trackAccess = require('../app/api/music/tracks/[id]/access/route.ts');
const trackDownload = require('../app/api/music/tracks/[id]/download/route.ts');
const orderDownload = require('../app/api/account/orders/[orderId]/items/[itemId]/download/route.ts');
const releaseAccess = require('../app/api/music/release/[id]/access/route.ts');
const uploadRoute = require('../app/api/admin/music-files/route.ts');
const adminMusic = require('../app/api/admin/music-products/route.ts');
const publicMusic = require('../app/api/music/route.ts');
const homepage = require('../app/api/homepage/route.ts');
const context = () => ({ params: Promise.resolve({ id: 'track-a' }) });
const request = format => new Request(`https://raf.invalid/api/music/tracks/track-a/download${format ? '?format=' + format : ''}`);
const uploadRequest = body => new Request('https://raf.invalid/api/admin/music-files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const authenticated = () => { state.user = { id: 'user-a' }; };
test.beforeEach(reset);

test('MP3 and WAV keys remain independent and labelled correctly', () => {
  assert.deepEqual(files.musicDownloadFilesInput(formats(), 'track'), formats());
  const choices = files.musicDownloadChoices(formats(), null, 'track', '/download');
  assert.deepEqual(choices.map(x => x.label), ['MP3', 'WAV']);
  assert.ok(!JSON.stringify(choices).includes('private/'));
});
test('public URLs, traversal and wrong format keys cannot be saved as private downloads', () => {
  for (const key of ['https://public.invalid/full.mp3', '//public.invalid/full.mp3', '../full.mp3', 'folder/../full.mp3', 'folder\\full.mp3', 'data:full.mp3']) assert.throws(() => files.musicDownloadFilesInput({ mp3: { key } }, 'track'));
  assert.throws(() => files.musicDownloadFilesInput({ mp3: { key: 'private/full.wav' } }, 'track'));
  assert.throws(() => files.musicDownloadFilesInput({ wav: { key: 'private/full.wav' } }, 'release'));
});
test('legacy private downloads are preserved while public references never become paid files', () => {
  assert.equal(files.chooseMusicFile(null, 'private/moonlight.wav', 'track', 'wav'), 'private/moonlight.wav');
  assert.equal(files.chooseMusicFile(null, '/private/moonlight.wav', 'track', 'wav'), 'private/moonlight.wav');
  assert.equal(files.chooseMusicFile(null, 'https://media.invalid/track.mp3', 'track'), null);
  assert.equal(files.musicDownloadChoices({}, 'private/old.zip', 'release', '/download')[0].format, 'original');
});
test('requesting an unavailable WAV does not silently return an MP3', () => {
  assert.equal(files.chooseMusicFile({ mp3: formats().mp3 }, null, 'track', 'wav'), null);
});
test('unpaid track visitors cannot obtain format download links', async () => {
  authenticated();
  const response = await trackAccess.GET(request(), context());
  const result = await response.json();
  assert.equal(result.owned, false);assert.deepEqual(result.trackDownloads, []);
});
test('one track purchase unlocks both configured formats but no release archives', async () => {
  authenticated();state.ownTrack = true;
  const response = await trackAccess.GET(request(), context());
  const result = await response.json();
  assert.deepEqual(result.trackDownloads.map(x => x.format), ['mp3', 'wav']);assert.deepEqual(result.releaseDownloads, []);
  assert.ok(!JSON.stringify(result).includes('private/'));
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
});
test('full release ownership unlocks both track formats and both release ZIPs', async () => {
  authenticated();state.ownRelease = true;
  const result = await (await trackAccess.GET(request(), context())).json();
  assert.equal(result.trackDownloads.length, 2);assert.equal(result.releaseDownloads.length, 2);assert.equal(result.ownsRelease, true);
});
test('format selection signs only the purchased requested file', async () => {
  authenticated();state.ownTrack = true;
  await trackDownload.GET(request('wav'), context());assert.deepEqual(state.signed, ['private/track.wav']);
  state.signed = [];await trackDownload.GET(request('mp3'), context());assert.deepEqual(state.signed, ['private/track.mp3']);
});
test('unknown formats and unpaid requests cannot cause signing', async () => {
  authenticated();
  assert.equal((await trackDownload.GET(request('flac'), context())).status, 400);
  await trackDownload.GET(request('wav'), context());assert.deepEqual(state.signed, []);
});
test('account-order download uses the same requested-format selection', async () => {
  authenticated();state.ownTrack = true;
  const response = await orderDownload.GET(request('wav'), { params: Promise.resolve({ orderId: 'order-a', itemId: 'track-item' }) });
  assert.equal(response.status, 302);assert.deepEqual(state.signed, ['private/track.wav']);
});
test('another account cannot download the order by guessing its IDs', async () => {
  state.user = { id: 'other-user' };state.ownTrack = true;
  const response = await orderDownload.GET(request('wav'), { params: Promise.resolve({ orderId: 'order-a', itemId: 'track-item' }) });
  assert.equal(response.status, 404);assert.deepEqual(state.signed, []);
});
test('release download choices omit keys and require a full release purchase', async () => {
  authenticated();state.ownTrack = true;
  assert.deepEqual((await (await releaseAccess.GET(request(), context())).json()).downloads, []);
  state.ownRelease = true;
  const data = await (await releaseAccess.GET(request(), context())).json();
  assert.deepEqual(data.downloads.map(x => x.label), ['MP3 ZIP', 'WAV ZIP']);assert.ok(!JSON.stringify(data).includes('private/'));
});
test('upload sessions reject another administrator and modified payloads', () => {
  const session = uploads.newMusicUpload('user-a', { kind: 'track', format: 'mp3', name: 'Track.mp3', bytes: 100 });
  const token = uploads.signMusicUpload(session);
  assert.equal(uploads.readMusicUpload(token, 'user-a').key, session.key);
  assert.throws(() => uploads.readMusicUpload(token, 'other-user'));
  assert.throws(() => uploads.readMusicUpload(token.slice(0, -5) + 'wrong', 'user-a'));
});
test('expired upload sessions and invalid part numbers are rejected', () => {
  const session = uploads.newMusicUpload('user-a', { kind: 'track', format: 'wav', name: 'Track.wav', bytes: 100 });
  session.createdAt -= 25 * 3600000;
  assert.throws(() => uploads.readMusicUpload(uploads.signMusicUpload(session), 'user-a'));
  for (const number of [0, -1, 2, 1.5]) assert.throws(() => uploads.musicUploadPartSize(session, number));
});
test('upload file extensions and size caps are enforced before issuing URLs', () => {
  for (const input of [
    { kind: 'track', format: 'mp3', name: 'Track.wav', bytes: 100 },
    { kind: 'track', format: 'wav', name: 'Track.wav', bytes: 513 * 1024 ** 2 },
    { kind: 'release', format: 'wav', name: 'Album.zip', bytes: 4 * 1024 ** 3 + 1 },
  ]) assert.throws(() => uploads.newMusicUpload('user-a', input));
});
test('upload API requires a verified admin authorization before touching R2', async () => {
  const response = await uploadRoute.POST(uploadRequest({ action: 'start', kind: 'track', format: 'mp3', name: 'Track.mp3', bytes: 100 }));
  assert.equal(response.status, 403);assert.deepEqual(state.calls, []);
});
test('small file uploads bind the private bucket, content type and size', async () => {
  authenticated();state.admin = true;
  const response = await uploadRoute.POST(uploadRequest({ action: 'start', kind: 'track', format: 'mp3', name: 'Track.mp3', bytes: 100 }));
  const data = await response.json();assert.equal(data.multipart, false);
  const signature = state.calls.find(x => x.sign === 'PutObjectCommand');
  assert.equal(signature.input.Bucket, 'qa-private');assert.equal(signature.input.ContentType, 'audio/mpeg');assert.equal(signature.input.ContentLength, 100);
});
test('upload rate limits prevent starting additional uploads', async () => {
  authenticated();state.admin = true;state.rateAllowed = false;
  assert.equal((await uploadRoute.POST(uploadRequest({ action: 'start', kind: 'track', format: 'mp3', name: 'Track.mp3', bytes: 100 }))).status, 429);
  assert.deepEqual(state.calls, []);
});
test('large ZIPs use resumable multipart uploads and bounded part sizes', async () => {
  authenticated();state.admin = true;
  const data = await (await uploadRoute.POST(uploadRequest({ action: 'start', kind: 'release', format: 'wav', name: 'Album WAV.zip', bytes: 100 * 1024 ** 2 }))).json();
  assert.equal(data.multipart, true);assert.equal(data.partBytes, 16 * 1024 ** 2);
  const response = await uploadRoute.POST(uploadRequest({ action: 'part', token: data.token, number: 7 }));
  assert.equal(response.status, 200);
  assert.equal(state.calls.find(x => x.sign === 'UploadPartCommand').input.ContentLength, 4 * 1024 ** 2);
  assert.equal((await uploadRoute.POST(uploadRequest({ action: 'part', token: data.token, number: 8 }))).status, 400);
});
test('incomplete multipart uploads cannot be attached to a release', async () => {
  authenticated();state.admin = true;
  const data = await (await uploadRoute.POST(uploadRequest({ action: 'start', kind: 'release', format: 'wav', name: 'Album.zip', bytes: 100 * 1024 ** 2 }))).json();
  const response = await uploadRoute.POST(uploadRequest({ action: 'complete', token: data.token }));
  assert.equal(response.status, 400);assert.ok(!state.calls.some(x => x.name === 'CompleteMultipartUploadCommand'));
});
test('completed uploads verify the stored object size before returning a file reference', async () => {
  authenticated();state.admin = true;
  const data = await (await uploadRoute.POST(uploadRequest({ action: 'start', kind: 'track', format: 'mp3', name: 'Track.mp3', bytes: 100 }))).json();
  state.head = { ContentLength: 99, ContentType: 'audio/mpeg' };
  assert.equal((await uploadRoute.POST(uploadRequest({ action: 'complete', token: data.token }))).status, 400);
  state.head = { ContentLength: 100, ContentType: 'audio/mpeg' };
  const result = await (await uploadRoute.POST(uploadRequest({ action: 'complete', token: data.token }))).json();
  assert.equal(result.file.bytes, 100);assert.ok(result.file.key.startsWith('music-downloads/'));
});


test('admin saves retain streaming and track identity while saving both private formats', async()=>{
  authenticated();state.admin=true;
  const body={id:'product-a',title:'QA release',artist:'Trexx',coverUrl:'https://images.invalid/cover.jpg',price:1,type:'DIGITAL',musicType:'single',downloadFiles:zips(),tracks:[{id:'track-a',title:'QA track',audioUrl:'https://public.invalid/preview.mp3',fileUrl:'https://public.invalid/legacy.mp3',downloadFiles:formats(),price:1,sellIndividually:true}]};
  const response=await adminMusic.PUT(uploadRequest(body));
  assert.equal(response.status,200);
  const track=state.calls.find(x=>x.updateSong).updateSong;
  assert.equal(track.where.id,'track-a');assert.equal(track.data.audioUrl,body.tracks[0].audioUrl);assert.deepEqual(track.data.downloadFiles,formats());
  assert.deepEqual(state.calls.find(x=>x.updateProduct).updateProduct.data.downloadFiles,zips());
});
test('admin validation rejects a public URL in the WAV download slot before writing',async()=>{
  authenticated();state.admin=true;
  const response=await adminMusic.PUT(uploadRequest({downloadFiles:{wav:{key:'https://public.invalid/album.zip'}}}));
  assert.equal(response.status,400);assert.ok(!state.calls.some(x=>x.updateProduct));
});
test('public music and homepage responses never serialize private format metadata',async()=>{
  for(const route of [publicMusic,homepage]) {
    const response=await route.GET();assert.equal(response.status,200);
    const body=JSON.stringify(await response.json());assert.ok(!body.includes('private/'));assert.ok(!body.includes('downloadFiles'));
  }
});

test('an admin can verify an existing private file without placing a purchase',async()=>{
  authenticated();state.admin=true;
  const result=await (await uploadRoute.POST(uploadRequest({action:'check',kind:'track',format:'mp3',key:'private/existing.mp3'}))).json();
  assert.equal(result.file.bytes,100);assert.deepEqual(state.signed,['private/existing.mp3']);
});
test('the existing-file checker rejects public streaming URLs',async()=>{
  authenticated();state.admin=true;
  const response=await uploadRoute.POST(uploadRequest({action:'check',kind:'track',format:'mp3',key:'https://media.invalid/stream.mp3'}));
  assert.equal(response.status,400);assert.deepEqual(state.signed,[]);
});

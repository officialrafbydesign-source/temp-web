const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");

// Exercise the real route/helper code without sending email, changing a mailing
// list, or accessing the production database. Only external services are mocked.
function fixture(options = {}) {
  const state = { emailCalls: [], fetchCalls: [], queries: [], ...options };
  const env = { RESEND_API_KEY: "test-only", RESEND_FROM_EMAIL: "RAF <test@example.com>", MAILCHIMP_API_KEY: "test-only-us1", MAILCHIMP_LIST_ID: "test-list", ...options.env };
  const cache = new Map();
  const prisma = Object.fromEntries(["beat", "musicProduct", "product"].map((kind) => [kind, {
    findMany(args) {
      state.queries.push({ kind, args });
      if (state.failGroup === kind) return Promise.reject(new Error("Test database failure"));
      return Promise.resolve(state[kind] || []);
    },
  }]));
  function load(file) {
    file = path.resolve(file);
    if (!path.extname(file)) file += ".ts";
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} };
    cache.set(file, module);
    function localRequire(id) {
      if (id === "server-only") return {};
      if (id === "@/lib/prisma") return { prisma };
      if (id === "@/lib/authRateLimit") return {
        getRequestIp: () => "test-client",
        consumeAuthRateLimit: async () => ({ allowed: state.allowed !== false, retryAfterSeconds: 60 }),
      };
      if (id === "resend") return { Resend: class {
        emails = { send: async (email) => {
          state.emailCalls.push(email);
          if (state.sendThrows) throw new Error("Test provider failure");
          return state.sendResult || { data: { id: "test-message" }, error: null };
        } };
      } };
      if (id.startsWith("@/")) return load(path.join(root, id.slice(2)));
      if (id.startsWith(".")) return load(path.resolve(path.dirname(file), id));
      return require(id);
    }
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
      fileName: file,
    }).outputText;
    vm.runInNewContext(code, {
      module, exports: module.exports, require: localRequire,
      process: { env }, Buffer, URL, Request, Response, AbortSignal,
      console: { error() {} },
      fetch: async (url, init) => {
        state.fetchCalls.push({ url, ...init, body: JSON.parse(init.body) });
        const reply = state.responses?.shift() || { status: 200, body: { status: "subscribed" } };
        if (reply.throw) throw new Error("Test network failure");
        return new Response(JSON.stringify(reply.body), { status: reply.status });
      },
    }, { filename: file });
    return module.exports;
  }
  return { state, load: (name) => load(path.join(root, name)) };
}

function request(route, body, extraHeaders = {}) {
  return new Request(`https://www.rafbydesign.co.uk${route}`, {
    method: "POST", headers: { "Content-Type": "application/json", ...extraHeaders },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
const contact = { name: "Ryan <RAF>", email: "ryan@example.com", inquiryType: "Design", message: "Hello <script>test</script>\nNew line" };

test("contact sends to RAF, replies to the visitor, and escapes message HTML", async () => {
  const f = fixture();
  const response = await f.load("app/api/contact/route.ts").POST(request("/api/contact", contact));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(f.state.emailCalls.length, 1);
  const email = f.state.emailCalls[0];
  assert.equal(email.to[0], "officialrafbydesign@gmail.com");
  assert.equal(email.replyTo, "ryan@example.com");
  assert.match(email.html, /&lt;script&gt;test&lt;\/script&gt;/);
  assert.ok(!email.html.includes("<script>"));
  assert.match(email.text, /Hello <script>/);
});

test("contact provider rejection and missing message IDs never report success", async () => {
  for (const sendResult of [{ data: null, error: { name: "validation_error" } }, { data: null, error: null }]) {
    const f = fixture({ sendResult });
    const response = await f.load("app/api/contact/route.ts").POST(request("/api/contact", contact));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, undefined);
  }
});

test("contact network failures and missing configuration return usable errors", async () => {
  for (const options of [{ sendThrows: true }, { env: { RESEND_API_KEY: "" } }]) {
    const f = fixture(options);
    const response = await f.load("app/api/contact/route.ts").POST(request("/api/contact", contact));
    assert.equal(response.status, 503);
    assert.ok((await response.json()).error);
  }
});

test("contact rejects invalid fields and header injection without sending", async () => {
  for (const change of [{ email: "invalid" }, { email: "ryan@example.com\r\nBcc: other@example.com" }, { name: "Name\nOther" }, { message: "" }, { inquiryType: "Unknown" }, { message: "x".repeat(5001) }, { website: "bot" }]) {
    const f = fixture();
    const response = await f.load("app/api/contact/route.ts").POST(request("/api/contact", { ...contact, ...change }));
    assert.equal(response.status, 400);
    assert.equal(f.state.emailCalls.length, 0);
  }
});

test("malformed, array and oversized request bodies are rejected", async () => {
  for (const [body, status] of [["{", 400], ["[]", 400], ["x".repeat(16001), 413]]) {
    const f = fixture();
    const response = await f.load("app/api/contact/route.ts").POST(request("/api/contact", body));
    assert.equal(response.status, status);
    assert.equal(f.state.emailCalls.length, 0);
  }
});

test("cross-site contact requests are rejected", async () => {
  const f = fixture();
  const response = await f.load("app/api/contact/route.ts").POST(request("/api/contact", contact, { Origin: "https://other.example" }));
  assert.equal(response.status, 403);
  assert.equal(f.state.emailCalls.length, 0);
});

test("contact throttling returns Retry-After and sends nothing", async () => {
  const f = fixture({ allowed: false });
  const response = await f.load("app/api/contact/route.ts").POST(request("/api/contact", contact));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "60");
  assert.equal(f.state.emailCalls.length, 0);
});

test("new newsletter subscriptions opt in immediately and normalize email", async () => {
  const f = fixture();
  const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: " USER@Example.com " }));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.status, "subscribed");
  assert.match(body.message, /Thanks for joining/);
  assert.doesNotMatch(body.message, /confirm/);
  assert.equal(f.state.fetchCalls.length, 1);
  assert.equal(f.state.fetchCalls[0].method, "PUT");
  assert.equal(f.state.fetchCalls[0].body.email_address, "user@example.com");
  assert.equal(f.state.fetchCalls[0].body.status_if_new, "subscribed");
});

test("confirmed newsletter members are preserved on repeat signup", async () => {
  const f = fixture({ responses: [{ status: 200, body: { status: "subscribed" } }] });
  const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: "user@example.com" }));
  assert.equal((await response.json()).status, "subscribed");
  assert.equal(f.state.fetchCalls.length, 1);
  assert.equal(f.state.fetchCalls[0].body.status, undefined);
});

test("a fresh form submission subscribes pending, unsubscribed and transactional contacts", async () => {
  for (const previousStatus of ["pending", "unsubscribed", "transactional"]) {
    const f = fixture({ responses: [{ status: 200, body: { status: previousStatus } }, { status: 200, body: { status: "subscribed" } }] });
    const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: "user@example.com" }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, "subscribed");
    assert.equal(f.state.fetchCalls.length, 2);
    assert.equal(f.state.fetchCalls[1].method, "PATCH");
    assert.equal(f.state.fetchCalls[1].body.status, "subscribed");
    assert.equal(Object.keys(f.state.fetchCalls[1].body).join(), "status");
  }
});

test("unsuccessful status changes never claim immediate subscription", async () => {
  for (const reply of [{ status: 200, body: { status: "pending" } }, { status: 400, body: {} }, { status: 500, body: {} }, { throw: true }]) {
    const f = fixture({ responses: [{ status: 200, body: { status: "pending" } }, reply] });
    const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: "user@example.com" }));
    assert.ok(response.status >= 400);
    assert.equal((await response.json()).success, undefined);
  }
});

test("cleaned addresses are not automatically resubscribed", async () => {
  const f = fixture({ responses: [{ status: 200, body: { status: "cleaned" } }] });
  const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: "user@example.com" }));
  assert.equal(response.status, 400);
  assert.equal(f.state.fetchCalls.length, 1);
});

test("newsletter provider errors never produce a subscribed response", async () => {
  for (const reply of [{ status: 400, body: {} }, { status: 401, body: {} }, { status: 500, body: {} }, { status: 200, body: {} }, { status: 200, body: { status: "cleaned" } }, { throw: true }]) {
    const f = fixture({ responses: [reply] });
    const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: "user@example.com" }));
    assert.ok(response.status >= 400);
    assert.equal((await response.json()).success, undefined);
  }
});

test("newsletter requires configured audience and valid email", async () => {
  for (const [options, body, status] of [[{ env: { MAILCHIMP_API_KEY: "" } }, { email: "user@example.com" }, 503], [{}, { email: "invalid" }, 400], [{ env: { MAILCHIMP_API_KEY: "test-https://other.example" } }, { email: "user@example.com" }, 503]]) {
    const f = fixture(options);
    const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", body));
    assert.equal(response.status, status);
    assert.equal(f.state.fetchCalls.length, 0);
  }
});

test("newsletter throttling prevents provider calls", async () => {
  const f = fixture({ allowed: false });
  const response = await f.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: "user@example.com" }));
  assert.equal(response.status, 429);
  assert.equal(f.state.fetchCalls.length, 0);
});

test("popup/footer endpoint and legacy newsletter endpoint share a handler", () => {
  const f = fixture();
  assert.equal(f.load("app/api/newsletter/subscribe/route.ts").POST, f.load("app/api/newsletter/route.ts").POST);
});

test("empty search does not query the database", async () => {
  const f = fixture();
  const output = await f.load("lib/siteSearch.ts").searchSite("");
  assert.equal(output.results.length, 0);
  assert.equal(f.state.queries.length, 0);
});

test("search uses release URLs and only returns public catalogue fields", async () => {
  const f = fixture({
    beat: [{ id: "beat-1", title: "Escape", genre: "Hip Hop", artworkUrl: "/beat.png", fileUrl: "private-beat" }],
    musicProduct: [{ id: "product-1", fileUrl: "private-release", release: { id: "release-1", title: "Escape", artist: { name: "Trexx" }, coverUrl: "/music.png" } }],
    product: [{ id: "clothing-1", name: "Escape Shirt", category: "Shirts", imageUrls: ["/shirt.png"] }],
  });
  const output = await f.load("lib/siteSearch.ts").searchSite("Escape");
  assert.equal(output.incomplete, false);
  assert.ok(output.results.some((result) => result.href === "/music/release-1"));
  assert.ok(output.results.some((result) => result.href === "/beats/beat-1"));
  assert.ok(output.results.some((result) => result.href === "/clothing/clothing-1"));
  assert.ok(!JSON.stringify(output).includes("private-"));
  assert.equal(f.state.queries.find((query) => query.kind === "beat").args.where.isAvailable, true);
});

test("service search matches phrases and reports partial catalogue outages", async () => {
  const f = fixture({ failGroup: "beat" });
  const output = await f.load("lib/siteSearch.ts").searchSite("music services");
  assert.equal(output.incomplete, true);
  assert.ok(output.results.some((result) => result.href === "/beats/services"));
});

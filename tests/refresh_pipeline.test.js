const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { semanticHashFor } = require("../scripts/refresh_pipeline.js");
const { createAppServer, createAuthManager } = require("../server/comasset_server.js");

function testAuthConfig() {
  const salt = Buffer.from("test-auth-salt");
  return {
    username: "thomas",
    password: {
      salt: salt.toString("hex"),
      hash: crypto.scryptSync("test-password", salt, 64).toString("hex"),
      keyLength: 64,
    },
    session: { cookieName: "test_session", ttlHours: 1, sameSite: "Strict" },
    loginRateLimit: { windowMinutes: 15, maxAttempts: 5, blockMinutes: 15 },
  };
}

test("semantic hash ignores retrieval-only news timestamps", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "comasset-refresh-"));
  const firstDir = path.join(dir, "first");
  const secondDir = path.join(dir, "second");
  fs.mkdirSync(firstDir);
  fs.mkdirSync(secondDir);
  const first = path.join(firstDir, "live_news_events.json");
  const second = path.join(secondDir, "live_news_events.json");
  const payload = {
    asOf: "2026-06-29T00:00:00Z",
    symbols: {
      MSFT: {
        items: [{ id: "one", headline: "Same fact", lastChecked: "2026-06-29T00:00:00Z" }],
      },
    },
  };
  fs.writeFileSync(first, JSON.stringify(payload));
  fs.writeFileSync(second, JSON.stringify({
    ...payload,
    asOf: "2026-06-30T00:00:00Z",
    symbols: {
      MSFT: {
        items: [{ id: "one", headline: "Same fact", lastChecked: "2026-06-30T00:00:00Z" }],
      },
    },
  }));
  assert.equal(semanticHashFor(first), semanticHashFor(second));
  const changed = JSON.parse(fs.readFileSync(second, "utf8"));
  changed.symbols.MSFT.items[0].headline = "New material fact";
  fs.writeFileSync(second, JSON.stringify(changed));
  assert.notEqual(semanticHashFor(first), semanticHashFor(second));
});

test("auth manager verifies a hash and expires destroyed sessions", () => {
  const auth = createAuthManager(testAuthConfig());
  assert.equal(auth.verifyCredentials("thomas", "test-password"), true);
  assert.equal(auth.verifyCredentials("thomas", "wrong-password"), false);
  assert.equal(auth.verifyCredentials("another-user", "test-password"), false);
  const { token } = auth.createSession();
  const request = { headers: { cookie: `test_session=${token}` }, socket: {} };
  assert.equal(auth.sessionFromRequest(request).username, "thomas");
  auth.destroySession(request);
  assert.equal(auth.sessionFromRequest(request), null);
});

test("local server protects data and authenticates the single account", async (t) => {
  const { server } = createAppServer({ schedulerEnabled: false, authConfig: testAuthConfig() });
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
  } catch (error) {
    if (error.code === "EPERM") {
      t.skip("The test sandbox does not permit binding a localhost port.");
      return;
    }
    throw error;
  }
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const anonymousHealth = await fetch(`${base}/api/health`);
  assert.equal(anonymousHealth.status, 401);

  const anonymousPage = await fetch(`${base}/`, { redirect: "manual" });
  assert.equal(anonymousPage.status, 302);
  assert.match(anonymousPage.headers.get("location"), /^\/login\.html/);

  const badLogin = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "thomas", password: "wrong-password" }),
  });
  assert.equal(badLogin.status, 401);

  const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "thomas", password: "test-password" }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  assert.match(login.headers.get("set-cookie"), /HttpOnly/);
  assert.match(login.headers.get("set-cookie"), /SameSite=Strict/);

  const health = await fetch(`${base}/api/health`, { headers: { Cookie: cookie } }).then((response) => response.json());
  assert.equal(health.status, "ok");
  assert.equal(health.scheduler.enabled, false);
  assert.equal(health.authenticatedUser, "thomas");

  const forbidden = await fetch(`${base}/api/refresh/watchlist`, {
    method: "POST",
    headers: { Cookie: cookie, "X-Comasset-Member": "family-viewer" },
  });
  assert.equal(forbidden.status, 403);

  const page = await fetch(`${base}/`, { headers: { Cookie: cookie } }).then((response) => response.text());
  assert.match(page, /Comasset Investment Lab/);

  const logout = await fetch(`${base}/api/auth/logout`, { method: "POST", headers: { Cookie: cookie } });
  assert.equal(logout.status, 200);
  const expired = await fetch(`${base}/api/auth/session`, { headers: { Cookie: cookie } });
  assert.equal(expired.status, 401);
});

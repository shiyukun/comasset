const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { semanticHashFor } = require("../scripts/refresh_pipeline.js");
const { createAppServer } = require("../server/comasset_server.js");

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

test("local server exposes health and blocks non-admin refresh", async (t) => {
  const { server } = createAppServer({ schedulerEnabled: false });
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

  const health = await fetch(`${base}/api/health`).then((response) => response.json());
  assert.equal(health.status, "ok");
  assert.equal(health.scheduler.enabled, false);

  const forbidden = await fetch(`${base}/api/refresh/watchlist`, {
    method: "POST",
    headers: { "X-Comasset-Member": "family-viewer" },
  });
  assert.equal(forbidden.status, 403);

  const page = await fetch(`${base}/`).then((response) => response.text());
  assert.match(page, /Comasset Investment Lab/);
});

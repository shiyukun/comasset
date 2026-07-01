const fs = require("fs");
const path = require("path");
const http = require("http");
const { runRefresh } = require("../scripts/refresh_pipeline.js");

const root = path.resolve(__dirname, "..");
const webRoot = path.join(root, "web");
const scheduleConfigPath = path.join(root, "config", "refresh_schedule.json");
const schedulerStatePath = path.join(root, "data", "scheduler_state.json");
const appConfig = JSON.parse(fs.readFileSync(path.join(root, "config", "app_config.json"), "utf8"));

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function readJson(filePath, fallback = {}) {
  try {
    return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function jsonResponse(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(`${JSON.stringify(body)}\n`);
}

function memberCanRun(memberId) {
  const member = (appConfig.familyMembers || []).find((item) => item.id === memberId);
  if (!member) return false;
  const permissions = member.permissions || appConfig.accessControl?.roles?.[member.role]?.permissions || [];
  return permissions.includes("run_pipeline");
}

function requestAuthorized(request) {
  const configuredToken = process.env.COMASSET_REFRESH_TOKEN;
  if (configuredToken && request.headers.authorization !== `Bearer ${configuredToken}`) return false;
  return memberCanRun(request.headers["x-comasset-member"] || "");
}

function safeRunId(value) {
  return /^[a-zA-Z0-9._-]+$/.test(value || "") ? value : null;
}

function runRecord(runId) {
  const fileName = safeRunId(runId) ? `${runId}.json` : "latest.json";
  return readJson(path.join(root, "data", "refresh_runs", fileName), null);
}

function createRefreshManager() {
  let active = null;
  return {
    getActive: () => active,
    start(scope, trigger, requestedBy) {
      if (active) {
        const error = new Error(`Refresh already running (${active.runId}).`);
        error.code = "PIPELINE_BUSY";
        error.activeRunId = active.runId;
        throw error;
      }
      const runId = `${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}-${scope}`;
      active = { runId, scope, trigger, requestedBy, status: "starting", startedAt: new Date().toISOString() };
      runRefresh({ runId, scope, trigger, requestedBy })
        .then((result) => {
          active = { ...result };
        })
        .catch((error) => {
          active = error.run || { ...active, status: "failed", error: error.message };
        })
        .finally(() => {
          setTimeout(() => {
            active = null;
          }, 2000);
        });
      return { ...active };
    },
  };
}

function createScheduler(manager, enabled = true) {
  const config = readJson(scheduleConfigPath, { pollIntervalSeconds: 60, jobs: {} });
  const state = readJson(schedulerStatePath, { version: 1, jobs: {} });
  const now = Date.now();
  Object.entries(config.jobs || {}).forEach(([name, job]) => {
    state.jobs[name] ||= {};
    if (!state.jobs[name].nextDueAt) {
      const delay = job.runOnStart ? 1000 : Number(job.intervalMinutes || 60) * 60000;
      state.jobs[name].nextDueAt = new Date(now + delay).toISOString();
    }
  });
  writeJson(schedulerStatePath, state);

  function status() {
    return {
      enabled,
      timezone: config.timezone || "Asia/Singapore",
      jobs: Object.fromEntries(
        Object.entries(config.jobs || {}).map(([name, job]) => [name, {
          ...job,
          ...(state.jobs[name] || {}),
        }])
      ),
    };
  }

  async function tick() {
    if (!enabled || manager.getActive()) return;
    const current = Date.now();
    for (const [name, job] of Object.entries(config.jobs || {})) {
      if (!job.enabled) continue;
      const jobState = state.jobs[name] || {};
      if (new Date(jobState.nextDueAt || 0).getTime() > current) continue;
      try {
        const started = manager.start(job.scope, `scheduler:${name}`, "system-scheduler");
        jobState.lastStartedAt = started.startedAt;
        jobState.lastRunId = started.runId;
        jobState.nextDueAt = new Date(current + Number(job.intervalMinutes || 60) * 60000).toISOString();
      } catch (error) {
        jobState.lastError = error.message;
        jobState.nextDueAt = new Date(current + 5 * 60000).toISOString();
      }
      state.jobs[name] = jobState;
      writeJson(schedulerStatePath, state);
      break;
    }
  }

  const timer = enabled
    ? setInterval(tick, Math.max(10, Number(config.pollIntervalSeconds || 60)) * 1000)
    : null;
  if (timer) timer.unref();
  return { status, stop: () => timer && clearInterval(timer), tick };
}

function serveStatic(request, response, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  let decoded;
  try {
    decoded = decodeURIComponent(requested);
  } catch (_error) {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }
  const filePath = path.resolve(webRoot, `.${decoded}`);
  if (filePath !== webRoot && !filePath.startsWith(`${webRoot}${path.sep}`)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    const noStore = [".json", ".js"].includes(path.extname(filePath));
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": noStore ? "no-store" : "public, max-age=300",
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

function createAppServer(options = {}) {
  const manager = createRefreshManager();
  const scheduler = createScheduler(manager, options.schedulerEnabled !== false);
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (request.method === "GET" && url.pathname === "/api/health") {
      jsonResponse(response, 200, {
        status: "ok",
        service: "comasset-refresh-server",
        scheduler: scheduler.status(),
        activeRun: manager.getActive(),
      });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/refresh/status") {
      const active = manager.getActive();
      const requestedRunId = url.searchParams.get("runId");
      const record = active?.runId === requestedRunId ? active : runRecord(requestedRunId);
      jsonResponse(response, record ? 200 : 404, record || { error: "Refresh run not found" });
      return;
    }
    const match = request.method === "POST" && url.pathname.match(/^\/api\/refresh\/(recommendations|watchlist)$/);
    if (match) {
      if (!requestAuthorized(request)) {
        jsonResponse(response, 403, { error: "This family member cannot run the refresh pipeline." });
        return;
      }
      try {
        const run = manager.start(match[1], "manual_web", request.headers["x-comasset-member"]);
        jsonResponse(response, 202, run);
      } catch (error) {
        jsonResponse(response, error.code === "PIPELINE_BUSY" ? 409 : 500, {
          error: error.message,
          activeRunId: error.activeRunId || null,
        });
      }
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405);
      response.end("Method not allowed");
      return;
    }
    serveStatic(request, response, url.pathname);
  });
  server.on("close", () => scheduler.stop());
  return { server, scheduler, manager };
}

if (require.main === module) {
  const host = process.env.COMASSET_HOST || "127.0.0.1";
  const port = Number(process.env.COMASSET_PORT || 4173);
  if (!["127.0.0.1", "localhost", "::1"].includes(host) && !process.env.COMASSET_REFRESH_TOKEN) {
    console.error("COMASSET_REFRESH_TOKEN is required when binding beyond localhost.");
    process.exit(1);
  }
  const { server } = createAppServer({ schedulerEnabled: process.env.COMASSET_SCHEDULER_ENABLED !== "0" });
  server.listen(port, host, () => {
    console.log(`Comasset server: http://${host}:${port}`);
    console.log("Refresh API and scheduler are enabled.");
  });
}

module.exports = { createAppServer, createScheduler, memberCanRun };

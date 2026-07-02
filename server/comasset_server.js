const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { runRefresh } = require("../scripts/refresh_pipeline.js");

const root = path.resolve(__dirname, "..");
const webRoot = path.join(root, "web");
const scheduleConfigPath = path.join(root, "config", "refresh_schedule.json");
const schedulerStatePath = path.join(root, "data", "scheduler_state.json");
const appConfig = JSON.parse(fs.readFileSync(path.join(root, "config", "app_config.json"), "utf8"));
const defaultAuthConfig = JSON.parse(fs.readFileSync(path.join(root, "config", "auth.json"), "utf8"));

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

function securityHeaders() {
  return {
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };
}

function jsonResponse(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    ...securityHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  response.end(`${JSON.stringify(body)}\n`);
}

function parseCookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return index === -1
          ? [part, ""]
          : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function readJsonBody(request, maxBytes = 4096) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body, "utf8") > maxBytes) {
        const error = new Error("Request body is too large.");
        error.code = "BODY_TOO_LARGE";
        reject(error);
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (_error) {
        const error = new Error("Invalid JSON body.");
        error.code = "INVALID_JSON";
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function createAuthManager(config = defaultAuthConfig) {
  const sessions = new Map();
  const attempts = new Map();
  const cookieName = config.session?.cookieName || "comasset_session";
  const ttlMs = Number(config.session?.ttlHours || 12) * 60 * 60 * 1000;
  const maxAttempts = Number(config.loginRateLimit?.maxAttempts || 5);
  const windowMs = Number(config.loginRateLimit?.windowMinutes || 15) * 60 * 1000;
  const blockMs = Number(config.loginRateLimit?.blockMinutes || 15) * 60 * 1000;
  const salt = Buffer.from(config.password.salt, "hex");
  const expectedHash = Buffer.from(config.password.hash, "hex");
  const keyLength = Number(config.password.keyLength || expectedHash.length);

  function prune() {
    const now = Date.now();
    sessions.forEach((session, token) => {
      if (session.expiresAt <= now) sessions.delete(token);
    });
    attempts.forEach((entry, key) => {
      if (entry.windowStartedAt + windowMs + blockMs <= now) attempts.delete(key);
    });
  }

  function rateLimitStatus(key) {
    prune();
    const entry = attempts.get(key);
    if (!entry) return { blocked: false, retryAfterSeconds: 0 };
    const retryAfterMs = Math.max(0, (entry.blockedUntil || 0) - Date.now());
    return { blocked: retryAfterMs > 0, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  function registerFailure(key) {
    const now = Date.now();
    const existing = attempts.get(key);
    const entry = !existing || now - existing.windowStartedAt > windowMs
      ? { count: 0, windowStartedAt: now, blockedUntil: 0 }
      : existing;
    entry.count += 1;
    if (entry.count >= maxAttempts) entry.blockedUntil = now + blockMs;
    attempts.set(key, entry);
    return rateLimitStatus(key);
  }

  function verifyCredentials(username, password) {
    const suppliedHash = crypto.scryptSync(String(password || ""), salt, keyLength);
    const usernameMatches = crypto.timingSafeEqual(
      crypto.createHash("sha256").update(String(username || "")).digest(),
      crypto.createHash("sha256").update(config.username).digest()
    );
    return usernameMatches && suppliedHash.length === expectedHash.length && crypto.timingSafeEqual(suppliedHash, expectedHash);
  }

  function createSession() {
    prune();
    const token = crypto.randomBytes(32).toString("base64url");
    const session = {
      username: config.username,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    };
    sessions.set(token, session);
    return { token, session };
  }

  function sessionFromRequest(request) {
    prune();
    const token = parseCookies(request)[cookieName];
    if (!token) return null;
    const session = sessions.get(token);
    if (!session || session.expiresAt <= Date.now()) {
      sessions.delete(token);
      return null;
    }
    return { token, ...session };
  }

  function destroySession(request) {
    const token = parseCookies(request)[cookieName];
    if (token) sessions.delete(token);
  }

  function cookie(token, request, maxAgeSeconds = Math.floor(ttlMs / 1000)) {
    const secure = request.socket.encrypted || request.headers["x-forwarded-proto"] === "https";
    return [
      `${cookieName}=${encodeURIComponent(token)}`,
      "HttpOnly",
      "Path=/",
      `SameSite=${config.session?.sameSite || "Strict"}`,
      `Max-Age=${maxAgeSeconds}`,
      secure ? "Secure" : null,
    ].filter(Boolean).join("; ");
  }

  return {
    username: config.username,
    verifyCredentials,
    createSession,
    sessionFromRequest,
    destroySession,
    cookie,
    clearCookie: (request) => cookie("", request, 0),
    rateLimitStatus,
    registerFailure,
    clearFailures: (key) => attempts.delete(key),
  };
}

function memberCanRun(memberId) {
  const member = (appConfig.familyMembers || []).find((item) => item.id === memberId);
  if (!member) return false;
  const permissions = member.permissions || appConfig.accessControl?.roles?.[member.role]?.permissions || [];
  return permissions.includes("run_pipeline");
}

function requestAuthorized(request, authSession) {
  const configuredToken = process.env.COMASSET_REFRESH_TOKEN;
  if (configuredToken && request.headers.authorization !== `Bearer ${configuredToken}`) return false;
  const memberId = request.headers["x-comasset-member"] || "";
  return authSession?.username === memberId && memberCanRun(memberId);
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
    response.writeHead(200, {
      ...securityHeaders(),
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    if (request.method === "HEAD") response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
}

function createAppServer(options = {}) {
  const manager = createRefreshManager();
  const scheduler = createScheduler(manager, options.schedulerEnabled !== false);
  const auth = createAuthManager(options.authConfig || defaultAuthConfig);
  const publicFiles = new Set(["/login.html", "/login.css", "/login.js"]);
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const rateKey = request.socket.remoteAddress || "local";
      const limit = auth.rateLimitStatus(rateKey);
      if (limit.blocked) {
        jsonResponse(response, 429, { error: "Too many login attempts.", retryAfterSeconds: limit.retryAfterSeconds }, {
          "Retry-After": String(limit.retryAfterSeconds),
        });
        return;
      }
      try {
        const body = await readJsonBody(request);
        if (!auth.verifyCredentials(body.username, body.password)) {
          const nextLimit = auth.registerFailure(rateKey);
          jsonResponse(response, 401, {
            error: "Invalid username or password.",
            retryAfterSeconds: nextLimit.retryAfterSeconds,
          });
          return;
        }
        auth.clearFailures(rateKey);
        const { token, session } = auth.createSession();
        jsonResponse(response, 200, {
          authenticated: true,
          username: session.username,
          expiresAt: new Date(session.expiresAt).toISOString(),
        }, { "Set-Cookie": auth.cookie(token, request) });
      } catch (error) {
        jsonResponse(response, error.code === "BODY_TOO_LARGE" ? 413 : 400, { error: error.message });
      }
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/auth/session") {
      const session = auth.sessionFromRequest(request);
      jsonResponse(response, session ? 200 : 401, session
        ? { authenticated: true, username: session.username, expiresAt: new Date(session.expiresAt).toISOString() }
        : { authenticated: false });
      return;
    }
    if ((request.method === "GET" || request.method === "HEAD") && publicFiles.has(url.pathname)) {
      serveStatic(request, response, url.pathname);
      return;
    }
    if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/login") {
      response.writeHead(302, { ...securityHeaders(), Location: "/login.html", "Cache-Control": "no-store" });
      response.end();
      return;
    }

    const authSession = auth.sessionFromRequest(request);
    if (!authSession) {
      if (url.pathname.startsWith("/api/") || path.extname(url.pathname)) {
        jsonResponse(response, 401, { error: "Authentication required." });
      } else {
        const next = encodeURIComponent(`${url.pathname}${url.search}`);
        response.writeHead(302, {
          ...securityHeaders(),
          Location: `/login.html?next=${next}`,
          "Cache-Control": "no-store",
        });
        response.end();
      }
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      auth.destroySession(request);
      jsonResponse(response, 200, { authenticated: false }, {
        "Set-Cookie": auth.clearCookie(request),
        "Clear-Site-Data": '"cache"',
      });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/health") {
      jsonResponse(response, 200, {
        status: "ok",
        service: "comasset-refresh-server",
        authenticatedUser: authSession.username,
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
      if (!requestAuthorized(request, authSession)) {
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
  return { server, scheduler, manager, auth };
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

module.exports = { createAppServer, createAuthManager, createScheduler, memberCanRun };

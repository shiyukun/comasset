const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..");
const statePath = path.join(root, "data", "refresh_state.json");
const lockPath = path.join(root, "data", ".refresh_pipeline.lock");
const runsDir = path.join(root, "data", "refresh_runs");

const sourceFiles = {
  prices: path.join(root, "data", "live_prices.json"),
  fundamentals: path.join(root, "data", "live_fundamentals.json"),
  holdings: path.join(root, "data", "live_holdings.json"),
  macro: path.join(root, "data", "live_macro.json"),
  news: path.join(root, "data", "live_news_events.json"),
};

const scopeFiles = {
  recommendations: [
    path.join(root, "data", "raw_candidates.json"),
    sourceFiles.prices,
    sourceFiles.fundamentals,
    sourceFiles.holdings,
    sourceFiles.macro,
    sourceFiles.news,
  ],
  watchlist: [
    path.join(root, "data", "custom_watchlist.json"),
    sourceFiles.prices,
    sourceFiles.fundamentals,
    sourceFiles.holdings,
    sourceFiles.news,
  ],
};

function readJson(filePath, fallback = {}) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : fallback;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function stripVolatile(value, fileName) {
  if (Array.isArray(value)) return value.map((item) => stripVolatile(item, fileName));
  if (!value || typeof value !== "object") return value;
  const output = {};
  Object.entries(value).forEach(([key, item]) => {
    const remove =
      key === "lastChecked" ||
      key === "retrievedAt" ||
      key === "userAgent" ||
      (key === "asOf" && ["live_news_events.json", "live_fundamentals.json"].includes(fileName));
    if (!remove) output[key] = stripVolatile(item, fileName);
  });
  return output;
}

function semanticHashFor(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const fileName = path.basename(filePath);
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const canonical = JSON.stringify(stableValue(stripVolatile(parsed, fileName)));
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function fingerprintFor(scope) {
  const files = Object.fromEntries(
    (scopeFiles[scope] || []).map((filePath) => [path.relative(root, filePath), semanticHashFor(filePath)])
  );
  const digest = crypto.createHash("sha256").update(JSON.stringify(stableValue(files))).digest("hex");
  return { digest, files };
}

function compactTimestamp(value = new Date()) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function changedFiles(before, after) {
  const names = new Set([...Object.keys(before || {}), ...Object.keys(after || {})]);
  return [...names].filter((name) => before?.[name] !== after?.[name]);
}

function runCommand(command, args, options, log) {
  return new Promise((resolve, reject) => {
    const startedAt = new Date().toISOString();
    const child = spawn(command, args, {
      cwd: root,
      env: { ...process.env, ...(options.env || {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timeout = options.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill("SIGTERM");
        }, options.timeoutMs)
      : null;
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (timeout) clearTimeout(timeout);
      const entry = {
        command: [path.relative(root, command) || command, ...args.map((arg) => path.relative(root, arg) || arg)],
        startedAt,
        completedAt: new Date().toISOString(),
        code,
        stdout: stdout.trim().slice(-4000),
        stderr: stderr.trim().slice(-4000),
      };
      log.push(entry);
      if (code === 0 && !timedOut) resolve(entry);
      else reject(new Error(`${path.basename(command)} ${args[0] || ""} ${timedOut ? "timed out" : `failed (${code})`}: ${stderr.trim() || stdout.trim()}`));
    });
  });
}

function runNode(script, args, log, env = {}) {
  return runCommand(process.execPath, [path.join(root, "scripts", script), ...args], { env }, log);
}

async function fetchSources(sourceNames, log) {
  const env = {
    SEC_USER_AGENT: process.env.SEC_USER_AGENT || "comasset internal family research contact@example.com",
  };
  for (const source of sourceNames) {
    if (source === "prices") {
      await runNode("fetch_prices_yahoo.js", [
        path.join(root, "data", "raw_candidates.json"),
        sourceFiles.prices,
        "18",
        path.join(root, "data", "custom_watchlist.json"),
      ], log, env);
    } else if (source === "fundamentals") {
      await runNode("fetch_fundamentals_sec.js", [
        path.join(root, "data", "raw_candidates.json"),
        path.join(root, "data", "sec_ticker_map.json"),
        sourceFiles.fundamentals,
        path.join(root, "data", "custom_watchlist.json"),
      ], log, env);
    } else if (source === "holdings") {
      await runNode("fetch_holdings_official.js", [
        path.join(root, "config", "holdings_sources.json"),
        sourceFiles.holdings,
      ], log, env);
    } else if (source === "macro") {
      await runNode("fetch_macro_fred.js", [sourceFiles.macro], log, env);
    } else if (source === "news") {
      await runNode("fetch_news_events.js", [
        path.join(root, "data", "raw_candidates.json"),
        path.join(root, "data", "sec_ticker_map.json"),
        sourceFiles.news,
        "60",
        "8",
        path.join(root, "data", "custom_watchlist.json"),
      ], log, env);
    }
  }
}

function auditMatchesInput(snapshotId, inputFingerprint) {
  const audit = readJson(path.join(root, "data", "codex_public_equity_audit.json"), null);
  return Boolean(
    audit &&
      (audit.inputFingerprint === inputFingerprint || audit.inputSnapshotId === snapshotId)
  );
}

async function generateCodexAudit(snapshot, inputFingerprint, log) {
  const refreshConfig = readJson(path.join(root, "config", "refresh_schedule.json"), {});
  const config = refreshConfig.codexAutoAudit || {};
  if (!config.enabled || process.env.COMASSET_CODEX_AUTO_AUDIT === "0") {
    return { attempted: false, reason: "disabled" };
  }
  const command = process.env.COMASSET_CODEX_BIN || config.command;
  if (!command || !fs.existsSync(command)) {
    return { attempted: false, reason: "codex_command_missing" };
  }
  const outputPath = path.join(root, "data", "codex_public_equity_audit.generated.json");
  const schemaPath = path.join(root, "config", "codex_audit_schema.json");
  const tickers = snapshot.recommendations.map((item) => item.ticker);
  const prompt = [
    "Use the Public Equity Investing long-short-pitch workflow as an internal screen-grade audit, not as personal investment advice.",
    "Read only snapshots/scored-live.json and data/raw_candidates_live.json. Do not edit any repository files.",
    `Review every recommendation ticker: ${tickers.join(", ")}.`,
    "For each ticker, pressure-test the deterministic score, action, evidence conflicts, missing data, and suitability for a balanced-growth family research portfolio.",
    "Keep each Chinese and English summary concise. Treat local structured data as the source of truth and label missing valuation or live evidence explicitly.",
    "Return only the JSON object required by the output schema, with one audits entry for every ticker.",
  ].join("\n");
  await runCommand(command, [
    "exec",
    "--ephemeral",
    "--color", "never",
    "--sandbox", "read-only",
    "--cd", root,
    "--output-schema", schemaPath,
    "--output-last-message", outputPath,
    prompt,
  ], { timeoutMs: Number(config.timeoutMinutes || 15) * 60000 }, log);
  const generated = readJson(outputPath, null);
  if (!generated?.audits) throw new Error("Codex audit output is missing audits.");
  const generatedTickers = new Set(
    Array.isArray(generated.audits)
      ? generated.audits.map((audit) => audit.ticker)
      : Object.keys(generated.audits)
  );
  const missing = tickers.filter((ticker) => !generatedTickers.has(ticker));
  if (missing.length) throw new Error(`Codex audit omitted: ${missing.join(", ")}`);
  const normalized = {
    ...generated,
    skillVersion: generated.skillVersion || "codex-public-equity-investing-0.1.29",
    workflow: generated.workflow || "public-equity-investing/long-short-pitch",
    generatedAt: new Date().toISOString(),
    inputFingerprint,
    inputSnapshotId: snapshot.snapshotId,
    sourceFiles: ["snapshots/scored-live.json", "data/raw_candidates_live.json"],
  };
  fs.writeFileSync(
    path.join(root, "data", "codex_public_equity_audit.json"),
    `${JSON.stringify(normalized, null, 2)}\n`
  );
  return { attempted: true, completed: true, output: "data/codex_public_equity_audit.json" };
}

async function processRecommendations(inputFingerprint, log) {
  const scoredPath = path.join(root, "snapshots", "scored-live.json");
  await runNode("enrich_candidates_real.js", [], log);
  await runNode("score_candidates.js", [
    path.join(root, "data", "raw_candidates_live.json"),
    scoredPath,
    path.join(root, "config", "app_config.json"),
    sourceFiles.prices,
  ], log, { COMASSET_INPUT_FINGERPRINT: inputFingerprint });

  let snapshot = readJson(scoredPath);
  let codexAuditApplied = false;
  let codexAuditGeneration;
  try {
    codexAuditGeneration = await generateCodexAudit(snapshot, inputFingerprint, log);
  } catch (error) {
    codexAuditGeneration = { attempted: true, completed: false, error: error.message };
    log.push({
      command: ["codex-public-equity-audit"],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      code: 1,
      stdout: "",
      stderr: error.message,
    });
  }
  if (auditMatchesInput(snapshot.snapshotId, inputFingerprint)) {
    await runNode("apply_codex_public_equity_audit.js", [
      scoredPath,
      path.join(root, "data", "codex_public_equity_audit.json"),
      scoredPath,
      path.join(root, "config", "app_config.json"),
    ], log);
    codexAuditApplied = true;
    snapshot = readJson(scoredPath);
  }

  await runNode("validate_snapshot.js", [scoredPath], log);
  await runNode("publish_weekly_snapshot.js", [
    scoredPath,
    path.join(root, "snapshots", "latest.json"),
    path.join(root, "web", "snapshot.js"),
    path.join(root, "web", "latest.json"),
  ], log);
  await runNode("build_data_js.js", [
    path.join(root, "snapshots", "latest.json"),
    path.join(root, "web", "data.js"),
  ], log);
  await runNode("run_snapshot_backtest.js", [
    "--strategy", "mixed",
    "--initial", "10000",
    "--monthly", "500",
    "--rebalance", "monthly",
    "--member", "pipeline",
  ], log);
  await runNode("build_data_status.js", [path.join(root, "web", "data_status.js")], log);
  const reportPath = path.join(root, "reports", `${snapshot.snapshotId}.md`);
  await runNode("generate_report.js", [
    scoredPath,
    path.join(root, "data", "raw_candidates_live.json"),
    path.join(root, "web", "data_status.js"),
    reportPath,
    sourceFiles.holdings,
    path.join(root, "data", "simulation_runs", "latest.json"),
  ], log);
  return {
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    codexAuditApplied,
    codexAuditGeneration,
    codexAuditStatus: codexAuditApplied ? "reviewed" : "needs_review_after_data_refresh",
    report: path.relative(root, reportPath),
  };
}

async function processWatchlist(log) {
  await runNode("build_custom_watchlist.js", [], log);
  await runNode("validate_custom_watchlist.js", [], log);
  const output = readJson(path.join(root, "data", "custom_watchlist_live.json"));
  return { generatedAt: output.generatedAt, itemCount: output.items?.length || 0 };
}

function acquireLock(runId) {
  fs.mkdirSync(path.dirname(lockPath), { recursive: true });
  try {
    fs.writeFileSync(lockPath, JSON.stringify({ runId, pid: process.pid, startedAt: new Date().toISOString() }), { flag: "wx" });
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
    const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
    if (ageMs > 2 * 60 * 60 * 1000) {
      fs.unlinkSync(lockPath);
      return acquireLock(runId);
    }
    const active = readJson(lockPath, {});
    const busy = new Error(`Refresh pipeline is already running (${active.runId || "unknown"}).`);
    busy.code = "PIPELINE_BUSY";
    busy.activeRunId = active.runId;
    throw busy;
  }
}

function releaseLock() {
  if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
}

function saveRun(run) {
  fs.mkdirSync(runsDir, { recursive: true });
  fs.writeFileSync(path.join(runsDir, `${run.runId}.json`), `${JSON.stringify(run, null, 2)}\n`);
  fs.writeFileSync(path.join(runsDir, "latest.json"), `${JSON.stringify(run, null, 2)}\n`);
  const indexPath = path.join(runsDir, "index.json");
  const index = readJson(indexPath, { runs: [] });
  index.updatedAt = new Date().toISOString();
  index.runs = [
    {
      runId: run.runId,
      scope: run.scope,
      trigger: run.trigger,
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      snapshotId: run.outputs?.recommendations?.snapshotId || null,
      changed: run.changed,
    },
    ...(index.runs || []).filter((item) => item.runId !== run.runId),
  ].slice(0, 100);
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
}

async function runRefresh(options = {}) {
  const scope = options.scope || "all";
  if (!["sources", "recommendations", "watchlist", "all"].includes(scope)) {
    throw new Error(`Unsupported refresh scope: ${scope}`);
  }
  const runId = options.runId || `${compactTimestamp()}-${scope}`;
  const run = {
    runId,
    scope,
    trigger: options.trigger || "manual_cli",
    requestedBy: options.requestedBy || "system",
    status: "running",
    startedAt: new Date().toISOString(),
    completedAt: null,
    changed: false,
    dataChanged: false,
    sourceChanges: [],
    outputs: {},
    logs: [],
  };
  acquireLock(runId);
  saveRun(run);
  try {
    const targets = scope === "all" ? ["recommendations", "watchlist"] : [scope];
    const before = Object.fromEntries(
      Object.entries(sourceFiles).map(([name, filePath]) => [path.relative(root, filePath), semanticHashFor(filePath)])
    );
    const sources = scope === "sources"
      ? ["prices", "news"]
      : scope === "watchlist"
        ? ["prices", "fundamentals", "holdings", "news"]
        : ["prices", "fundamentals", "holdings", "macro", "news"];
    if (!options.skipFetch) await fetchSources(sources, run.logs);
    await runNode("build_data_status.js", [path.join(root, "web", "data_status.js")], run.logs);
    const after = Object.fromEntries(
      Object.entries(sourceFiles).map(([name, filePath]) => [path.relative(root, filePath), semanticHashFor(filePath)])
    );
    run.sourceChanges = changedFiles(before, after);
    run.dataChanged = run.sourceChanges.length > 0;

    const state = readJson(statePath, { version: 1, processed: {} });
    for (const target of targets) {
      if (target === "sources") continue;
      const fingerprint = fingerprintFor(target);
      const previous = state.processed?.[target]?.fingerprint;
      const shouldProcess = options.force || previous !== fingerprint.digest;
      if (!shouldProcess) {
        run.outputs[target] = { changed: false, reason: "semantic_inputs_unchanged" };
        continue;
      }
      if (target === "recommendations") {
        run.outputs.recommendations = {
          changed: true,
          ...(await processRecommendations(fingerprint.digest, run.logs)),
        };
      } else if (target === "watchlist") {
        run.outputs.watchlist = { changed: true, ...(await processWatchlist(run.logs)) };
      }
      state.processed ||= {};
      state.processed[target] = {
        fingerprint: fingerprint.digest,
        files: fingerprint.files,
        processedAt: new Date().toISOString(),
        runId,
      };
      run.changed = true;
    }

    if (run.changed || !options.skipFetch) {
      await runCommand("/bin/bash", [path.join(root, "scripts", "build_static_site.sh")], {}, run.logs);
    }
    state.updatedAt = new Date().toISOString();
    fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
    run.status = "completed";
    run.completedAt = new Date().toISOString();
    saveRun(run);
    return run;
  } catch (error) {
    run.status = "failed";
    run.completedAt = new Date().toISOString();
    run.error = error.message;
    saveRun(run);
    throw Object.assign(error, { run });
  } finally {
    releaseLock();
  }
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--scope") options.scope = argv[++index];
    else if (token === "--trigger") options.trigger = argv[++index];
    else if (token === "--member") options.requestedBy = argv[++index];
    else if (token === "--skip-fetch") options.skipFetch = true;
    else if (token === "--force") options.force = true;
  }
  return options;
}

if (require.main === module) {
  runRefresh(parseArgs(process.argv.slice(2)))
    .then((run) => {
      console.log(JSON.stringify({
        runId: run.runId,
        status: run.status,
        changed: run.changed,
        sourceChanges: run.sourceChanges,
        outputs: run.outputs,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.message);
      process.exit(error.code === "PIPELINE_BUSY" ? 2 : 1);
    });
}

module.exports = {
  fingerprintFor,
  runRefresh,
  semanticHashFor,
  stripVolatile,
};

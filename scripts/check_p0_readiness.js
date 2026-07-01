const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const snapshotPath = process.argv[2] || path.join(root, "snapshots", "latest.json");
const dataSourcesPath = process.argv[3] || path.join(root, "config", "data_sources.json");
const holdingsPath = process.argv[4] || path.join(root, "data", "live_holdings.json");
const appConfigPath = process.argv[5] || path.join(root, "config", "app_config.json");
const newsEventsPath = process.argv[6] || path.join(root, "data", "live_news_events.json");
const simulationRunPath = process.argv[7] || path.join(root, "data", "simulation_runs", "latest.json");

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const dataSources = JSON.parse(fs.readFileSync(dataSourcesPath, "utf8"));
const holdings = fs.existsSync(holdingsPath) ? JSON.parse(fs.readFileSync(holdingsPath, "utf8")) : { funds: {} };
const appConfig = fs.existsSync(appConfigPath) ? JSON.parse(fs.readFileSync(appConfigPath, "utf8")) : {};
const newsEvents = fs.existsSync(newsEventsPath) ? JSON.parse(fs.readFileSync(newsEventsPath, "utf8")) : { symbols: {} };
const simulationRun = fs.existsSync(simulationRunPath)
  ? JSON.parse(fs.readFileSync(simulationRunPath, "utf8"))
  : null;

const checks = [];

function addCheck(name, ok, detail) {
  checks.push({ name, ok, detail });
}

addCheck("latest snapshot exists", fs.existsSync(snapshotPath), path.relative(root, snapshotPath));
addCheck("web snapshot exists", fs.existsSync(path.join(root, "web", "snapshot.js")), "web/snapshot.js");
addCheck("snapshot has recommendations", Array.isArray(snapshot.recommendations) && snapshot.recommendations.length > 0, `${snapshot.recommendations?.length || 0} recommendations`);
addCheck("snapshot has price source", Boolean(snapshot.marketContext?.priceSource), snapshot.marketContext?.priceSource || "missing");
addCheck("snapshot has simulation assumptions", Boolean(snapshot.simulationAssumptions?.mixed && snapshot.simulationAssumptions?.ultra), "mixed/ultra");
addCheck("data source manifest exists", Array.isArray(dataSources.sources), `${dataSources.sources?.length || 0} sources`);
const fundTickers = (snapshot.recommendations || [])
  .filter((item) => item.type === "etf" || item.type === "fund")
  .map((item) => item.ticker);
const missingHoldings = fundTickers.filter((ticker) => !(holdings.funds?.[ticker]?.holdings?.length > 0));
addCheck("ETF/fund holdings present", missingHoldings.length === 0, missingHoldings.join(", ") || `${fundTickers.length} funds covered`);

const missingCodexAudit = (snapshot.recommendations || []).filter(
  (item) => !item.codexAudit?.skillVersion || !item.codexAudit?.summary?.zh || !item.codexAudit?.summary?.en
);
addCheck("Codex audit fields present", missingCodexAudit.length === 0, missingCodexAudit.map((item) => item.ticker).join(", ") || "all recommendations");

const blockedSources = (dataSources.sources || []).filter((source) => source.status.includes("blocked") || source.status.includes("needs"));
addCheck(
  "P0 external providers ready",
  blockedSources.length === 0,
  blockedSources.map((source) => `${source.id}:${source.status}`).join(", ") || "no blocked P0 sources"
);

const newsMissing = (snapshot.recommendations || []).filter(
  (item) => !(newsEvents.symbols?.[item.ticker]?.items?.length > 0)
);
addCheck(
  "news/events present",
  newsMissing.length === 0,
  newsMissing.map((item) => item.ticker).join(", ") || `${snapshot.recommendations?.length || 0} symbols covered`
);

const futureLeak = simulationRun?.snapshotUsage?.filter((item) => !item.noFutureDataRulePassed) || [];
addCheck(
  "historical snapshot backtest saved",
  Boolean(simulationRun?.runId) && futureLeak.length === 0,
  simulationRun?.runId || "missing simulation run"
);

const members = appConfig.familyMembers || [];
const roles = appConfig.accessControl?.roles || {};
const permissions = appConfig.accessControl?.permissions || {};
const invalidMembers = members.filter((member) => !member.id || !member.name || !roles[member.role] || !(member.permissions || roles[member.role]?.permissions || []).includes("view"));
addCheck(
  "family access configured",
  members.length > 0 && Object.keys(roles).length > 0 && Object.keys(permissions).length > 0 && invalidMembers.length === 0,
  invalidMembers.map((member) => member.id || "(missing id)").join(", ") || `${members.length} members, ${Object.keys(roles).length} roles`
);

checks.forEach((check) => {
  console.log(`${check.ok ? "OK" : "FAIL"} ${check.name} - ${check.detail}`);
});

const failures = checks.filter((check) => !check.ok);
if (failures.length) {
  process.exit(1);
}

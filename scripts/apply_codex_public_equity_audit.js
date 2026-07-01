const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const snapshotPath = process.argv[2] || path.join(root, "snapshots", "scored-live.json");
const auditPath = process.argv[3] || path.join(root, "data", "codex_public_equity_audit.json");
const outputPath = process.argv[4] || snapshotPath;
const configPath = process.argv[5] || path.join(root, "config", "app_config.json");

const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

if (!fs.existsSync(auditPath)) {
  console.error(
    `Missing Codex audit file: ${path.relative(root, auditPath)}. ` +
      "Generate it with the Codex Public Equity Investing workflow, then rerun this script."
  );
  process.exit(1);
}

const auditFile = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const skillVersion = auditFile.skillVersion || config.scoring.codexAuditSkillVersion;

function normalizeAudits(input) {
  if (Array.isArray(input.audits)) {
    return Object.fromEntries(input.audits.map((audit) => [audit.ticker, audit]));
  }
  return input.audits || {};
}

function requireText(value, field, ticker) {
  if (!value || typeof value !== "string") {
    throw new Error(`${ticker}: audit missing ${field}`);
  }
}

function normalizeAudit(ticker, audit) {
  if (!audit) throw new Error(`${ticker}: missing Codex audit`);
  requireText(audit.summary?.zh, "summary.zh", ticker);
  requireText(audit.summary?.en, "summary.en", ticker);
  return {
    skillVersion,
    calledAt: audit.calledAt || auditFile.generatedAt || new Date().toISOString(),
    inputScope: audit.inputScope?.length ? audit.inputScope : ["factor_scores", "price_history", "holdings", "macro"],
    summary: audit.summary,
    conflicts: audit.conflicts || [],
    missingDataWarnings: audit.missingDataWarnings || [],
    familySuitability: audit.familySuitability || null,
    provider: "codex_public_equity_investing_skill",
    workflow: audit.workflow || auditFile.workflow || "public-equity-investing",
    status: "reviewed",
  };
}

function confidenceRank(value) {
  return { low: 0, medium: 1, high: 2 }[value] ?? 0;
}

function lowerConfidence(value) {
  return confidenceRank(value) > confidenceRank("medium") ? "medium" : value;
}

function hasHighConflict(audit) {
  return (audit.conflicts || []).some((conflict) => conflict.severity === "high");
}

try {
  const audits = normalizeAudits(auditFile);
  const reviewed = [];
  const recommendations = snapshot.recommendations.map((item) => {
    const audit = normalizeAudit(item.ticker, audits[item.ticker]);
    reviewed.push(item.ticker);
    const materialConflict = hasHighConflict(audit);
    return {
      ...item,
      action: materialConflict ? "watch" : item.action,
      confidence: materialConflict ? lowerConfidence(item.confidence) : item.confidence,
      codexAudit: audit,
      reviewOverride: materialConflict
        ? {
            reason: "Codex Public Equity Investing audit reported a high-severity conflict; action was downgraded to watch.",
            appliedAt: audit.calledAt,
          }
        : item.reviewOverride,
    };
  });

  const output = {
    ...snapshot,
    generatedAt: new Date().toISOString(),
    codexAuditSkillVersion: skillVersion,
    recommendations,
    codexAuditRun: {
      provider: "codex_public_equity_investing_skill",
      workflow: auditFile.workflow || "public-equity-investing",
      reviewed,
      completedAt: new Date().toISOString(),
      source: path.relative(root, auditPath),
    },
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Applied Codex Public Equity Investing audit for ${reviewed.length} recommendations into ${path.relative(root, outputPath)}.`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

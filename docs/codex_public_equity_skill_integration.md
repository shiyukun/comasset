# Codex Public Equity Investing Skill Integration

This project uses Codex's Public Equity Investing skill as the audit workflow for stocks, ETFs, and mutual funds.

The skill is not a remote website API. The local refresh service invokes the installed Codex CLI as an auditable workflow after changed deterministic scoring, then stores the structured output in the snapshot. If Codex is unavailable or the call fails, the new deterministic snapshot is still published with a visible pending-review status.

Automated output must include `inputFingerprint` and `inputSnapshotId`. The apply step accepts an audit only when one of those fields matches the current scored input, so an older audit cannot be presented as a new review.

## Required Flow

1. Build structured candidate data from prices, fundamentals, fund holdings, macro, and event inputs.
2. Calculate deterministic factor scores with `scripts/score_candidates.js`.
3. Use Codex Public Equity Investing workflow to review each scored candidate for:
   - bilingual explanation quality
   - risk and contradiction review
   - missing-data warnings
   - family-portfolio suitability notes
4. Save the Codex workflow output to `data/codex_public_equity_audit.json`.
5. Apply the audit into the scored snapshot with `scripts/apply_codex_public_equity_audit.js`.
6. Validate and publish the snapshot.

## Audit File Shape

```json
{
  "skillVersion": "codex-public-equity-investing-0.1.29",
  "workflow": "public-equity-investing",
  "generatedAt": "2026-06-25T09:00:00+08:00",
  "audits": {
    "MSFT": {
      "summary": {
        "zh": "Codex 审计摘要。",
        "en": "Codex audit summary."
      },
      "inputScope": ["factor_scores", "fundamentals", "price_history", "macro"],
      "conflicts": [],
      "missingDataWarnings": [],
      "familySuitability": {
        "zh": "适合作为核心仓位复核。",
        "en": "Suitable for core-position review."
      }
    }
  }
}
```

## Apply Command

```bash
/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node \
  scripts/apply_codex_public_equity_audit.js \
  snapshots/scored-live.json \
  data/codex_public_equity_audit.json \
  snapshots/scored-live.json \
  config/app_config.json
```

## Snapshot Fields

Each recommendation must include:

- `codexAudit.skillVersion`
- `codexAudit.calledAt`
- `codexAudit.inputScope`
- `codexAudit.summary.zh`
- `codexAudit.summary.en`
- `codexAudit.conflicts`
- `codexAudit.status`

## Guardrails

- Codex skill output may explain and flag risk, but final `score` must remain tied to structured data and `modelVersion`.
- If the audit reports a high-severity conflict, the apply script downgrades the recommendation action to `watch`.
- If no Codex audit file is available, snapshots may keep `legacy_migrated_needs_codex_review` status, but reports must disclose that they are not fully Codex-reviewed.
- Short-term recommendations should remain low confidence when news/event data is missing.

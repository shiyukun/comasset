# Weekly Recommendation Snapshot Schema

This document defines the weekly snapshot shape used by Comasset Investment Lab. The static prototype currently stores mock data in `web/data.js`; a real backend should generate a snapshot with this structure once per week.

## Goals

1. Preserve every weekly recommendation exactly as it was generated.
2. Make virtual simulations reproducible without future data leakage.
3. Store Claude financial skill analysis metadata for audit and review.
4. Support family notes separately from model-generated recommendations.

## Snapshot Object

```json
{
  "snapshotId": "2026-W25",
  "asOf": "2026-06-17",
  "generatedAt": "2026-06-17T07:58:00+08:00",
  "modelVersion": "comasset-score-v0.1",
  "claudeSkillVersion": "claude-finance-skill-2026.06",
  "dataCutoff": "2026-06-14T23:59:59-04:00",
  "recommendations": [],
  "marketContext": {},
  "simulationAssumptions": {}
}
```

## Recommendation Item

```json
{
  "ticker": "MSFT",
  "name": "Microsoft Corporation",
  "type": "stock",
  "horizon": "ultra",
  "action": "buy",
  "score": 91,
  "confidence": "high",
  "price": 478.22,
  "currency": "USD",
  "expectedRange": {
    "low": 0.09,
    "high": 0.18,
    "period": "12m"
  },
  "factorScores": {
    "fundamentals": 92,
    "valuation": 68,
    "momentum": 77,
    "fundQuality": null,
    "macroSensitivity": 61,
    "riskControl": 82
  },
  "reason": {
    "zh": "云业务、AI 产品化和自由现金流质量支持 2 年以上持有逻辑。",
    "en": "Cloud growth, AI monetization, and free cash flow quality support a 2+ year holding case."
  },
  "risks": {
    "zh": ["估值处于历史偏高区间"],
    "en": ["Valuation is above historical norms"]
  },
  "exitRules": {
    "zh": ["云业务增速连续两个季度显著放缓"],
    "en": ["Cloud growth slows materially for two quarters"]
  },
  "claudeAudit": {
    "skillVersion": "claude-finance-skill-2026.06",
    "calledAt": "2026-06-17T07:42:00+08:00",
    "inputScope": ["10-K", "last_4_quarters", "price_history", "major_news"],
    "summary": {
      "zh": "Skill 摘要强调 Azure、Copilot 商业化和现金流质量。",
      "en": "Skill summary highlights Azure, Copilot monetization, and cash flow quality."
    },
    "conflicts": []
  }
}
```

## Family State

Family state should not be written into the generated snapshot because it is user-owned context. Store it separately and join at display time.

```json
{
  "ticker": "MSFT",
  "status": "watch",
  "note": "Wait for valuation pullback or next earnings update.",
  "updatedBy": "family-user-1",
  "updatedAt": "2026-06-17T20:12:00+08:00"
}
```

Allowed `status` values:

- `watch`
- `owned`
- `review`

## Backtest Rules

1. A simulation may only use snapshots whose `generatedAt` is before the simulated trade date.
2. If a weekly snapshot is missing, the simulator should carry forward the previous valid snapshot.
3. Prices must be split- and dividend-adjusted for return calculation.
4. Fund and ETF recommendations must use data available at `dataCutoff`, not later restated holdings.
5. Claude skill summaries are explanatory inputs; final scoring must remain tied to structured data and `modelVersion`.

## Next Implementation Step

Create a `snapshots/` directory or backend table keyed by `snapshotId`, then replace `web/data.js` with a fetch call that loads the latest snapshot and renders the same UI.

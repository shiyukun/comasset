# Scoring Methodology

This document describes the first deterministic scoring model used by `scripts/score_candidates.js`.

The model is intentionally simple and auditable. Codex Public Equity Investing skill output is required for explanation and risk review, but the final score is calculated from structured factor scores.

`scripts/score_candidates.js` can also read a normalized weekly price file. When enough price points exist for a ticker, the script updates:

- current `price`
- `momentum`, based on 1-week, 1-month, and available 3-month returns
- `riskControl`, based on weekly volatility and maximum drawdown
- `priceSignals`, saved into the scored snapshot for review and reporting

If price data is missing or too short, the candidate remains scoreable from structured factors, but its `priceSignals.status` is marked as `missing`.

## Input Factors

Each candidate uses six factor scores:

- `fundamentals`
- `valuation`
- `momentum`
- `fundQuality`
- `macroSensitivity`
- `riskControl`

Unavailable factors should be `null`. For example, an individual stock usually has `fundQuality: null`.

## Base Weights

### Stock

| Factor | Weight |
| --- | ---: |
| fundamentals | 30% |
| valuation | 15% |
| momentum | 15% |
| macroSensitivity | 10% |
| riskControl | 30% |

### ETF

| Factor | Weight |
| --- | ---: |
| fundamentals | 15% |
| valuation | 15% |
| momentum | 15% |
| fundQuality | 30% |
| macroSensitivity | 10% |
| riskControl | 15% |

### Mutual Fund

| Factor | Weight |
| --- | ---: |
| fundamentals | 15% |
| valuation | 10% |
| momentum | 10% |
| fundQuality | 35% |
| macroSensitivity | 10% |
| riskControl | 20% |

## Horizon Adjustments

Short-term ideas increase momentum weight and reduce fundamental/valuation weight.

Long-term ideas slightly increase fundamentals, valuation, and risk control.

Ultra-long-term ideas increase fundamentals, fund quality, and risk control while reducing momentum.

Weights are normalized over available numeric factors, so missing factors do not automatically become zero.

## Action Rules

The current action rule is:

- Score below 68: `watch`
- Ultra-long ETF/fund with score at or above 68: `dca`
- Score at or above 80: `buy`
- Otherwise: `watch`

## Confidence Rules

- Score 85 or above: `high`
- Score 70 to 84: `medium`
- Score below 70: `low`

## Audit Rules

Each recommendation must include:

- bilingual reason
- bilingual risks
- bilingual exit rules
- Codex Public Equity Investing skill version
- Codex Public Equity Investing skill call time
- Codex Public Equity Investing skill input scope
- bilingual Codex summary

The scoring script should fail validation if these fields are missing after snapshot generation.

## Price Import Rules

`scripts/import_prices.js` accepts either:

- JSON with a top-level `prices` object
- CSV with `ticker,date,close` headers

Each ticker must have at least two price points. For real weekly runs, use adjusted close prices so dividends and splits do not distort momentum or drawdown calculations.

# Scoring Methodology

This document describes the first deterministic scoring model used by `scripts/score_candidates.js`.

The model is intentionally simple and auditable. Claude financial skill output is required for explanation and risk review, but the final score is calculated from structured factor scores.

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
- Claude financial skill version
- Claude skill call time
- Claude skill input scope
- bilingual Claude summary

The scoring script should fail validation if these fields are missing after snapshot generation.

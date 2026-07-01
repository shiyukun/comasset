# Recommendation Report: 2026-W25-scored

Generated at: 2026-06-17T07:58:00+08:00  
Data cutoff: 2026-06-14T23:59:59-04:00  
Model: comasset-score-v0.2  
Codex audit skill: codex-public-equity-investing-0.1.29
Price source: data/prices_sample.json

## Summary

- Raw candidates: 5
- Selected recommendations: 5
- Excluded candidates: 0
- Blocked data sources: 1
- Review data sources: 2
- Price-ready recommendations: 5

## Top Picks

- 1. VFIAX (fund, ultra) - score 85, dca
- 2. MSFT (stock, ultra) - score 83, buy
- 3. VTI (etf, ultra) - score 83, dca
- 4. COST (stock, long) - score 79, watch
- 5. QQQM (etf, long) - score 75, watch

## Watch / No Immediate Action

- COST - watch; main risk: Premium valuation
- QQQM - watch; main risk: Concentrated tech exposure

## Price Signals

- VFIAX - 1w +0.2%, 1m +0.6%, max drawdown -1.0%
- MSFT - 1w +0.3%, 1m +1.4%, max drawdown -1.3%
- VTI - 1w +0.2%, 1m +0.7%, max drawdown -0.9%
- COST - 1w +0.3%, 1m +0.5%, max drawdown -1.2%
- QQQM - 1w +0.3%, 1m +0.3%, max drawdown -2.3%

## Missing Price Signals

- All selected recommendations have usable price series

## Strategy Simulation

Assumptions: $10,000 initial capital, $500 monthly contribution, monthly rebalance, no tax impact.

- Mixed recommendations - final $18,563, total return +16.0%, max drawdown -1.6%, turnover 60
- Ultra-long only - final $17,818, total return +11.4%, max drawdown -1.0%, turnover 36
- SPY benchmark - final $17,376, total return +8.6%, max drawdown -1.3%, turnover 12
- QQQ benchmark - final $18,011, total return +12.6%, max drawdown -1.9%, turnover 12
- Cash - final $16,517, total return +3.2%, max drawdown +0.0%, turnover 12

## Excluded Candidates

- None

## Data Sources Requiring Review

- ETF / Fund Holdings (Issuer factsheets prototype) - 68% coverage
- Codex Public Equity Investing Skill (legacy migrated audit record) - 100% coverage

## Blocked Data Sources

- News and Events (News API prototype) - Needs a real news API or manual import; otherwise short-term ideas should remain lower confidence.

## Low Coverage Sources

- ETF / Fund Holdings - 68% coverage
- News and Events - 43% coverage

## Codex Audit Coverage

- VFIAX: codex-public-equity-investing-0.1.29, legacy_migrated, fund_profile, holdings, expense_ratio, historical_return
- MSFT: codex-public-equity-investing-0.1.29, legacy_migrated, 10-K, last_4_quarters, price_history, major_news
- VTI: codex-public-equity-investing-0.1.29, legacy_migrated, ETF_factsheet, holdings, expense_ratio, price_history
- COST: codex-public-equity-investing-0.1.29, legacy_migrated, last_4_quarters, same_store_sales, valuation, news
- QQQM: codex-public-equity-investing-0.1.29, legacy_migrated, ETF_holdings, expense_ratio, sector_exposure, momentum

## Next Actions

- Review blocked or low-coverage sources before trusting short-term recommendations.
- Review watch-only names before taking any action; they are included for monitoring, not immediate purchase.
- Confirm ETF and mutual fund holding overlap before adding to family portfolio.
- Replace sample price data with an imported weekly price file before using the report for real decisions.
- Re-run snapshot validation after any manual data edits.

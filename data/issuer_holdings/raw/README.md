# Official issuer holding files

Place issuer-downloaded CSV files here as `{TICKER}.csv`, for example:

- `VTI.csv`
- `VFIAX.csv`
- `QQQM.csv`

`scripts/fetch_holdings_official.js` checks this directory first. If no local issuer file is present and no direct issuer CSV URL is configured, it falls back to SEC N-PORT filings.

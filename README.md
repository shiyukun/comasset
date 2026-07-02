# Comasset Investment Lab

家庭内部自用的美股、新加坡股票、ETF、共同基金投资研究网站。

## 当前内容

- PRD：[PRD/us_stock_fund_prediction_website_prd.md](PRD/us_stock_fund_prediction_website_prd.md)
- 静态原型：[web/index.html](web/index.html)
- 原型数据：[web/data.js](web/data.js)
- 家庭组合数据：[web/portfolio.js](web/portfolio.js)
- 数据状态：[web/data_status.js](web/data_status.js)
- 前端交互：[web/app.js](web/app.js)
- 样式：[web/styles.css](web/styles.css)
- 周度快照 Schema：[docs/weekly_snapshot_schema.md](docs/weekly_snapshot_schema.md)
- 评分方法说明：[docs/scoring_methodology.md](docs/scoring_methodology.md)
- 价格样本：[data/prices_sample.json](data/prices_sample.json)
- 应用配置：[config/app_config.json](config/app_config.json)
- 数据源清单：[config/data_sources.json](config/data_sources.json)
- Codex Public Equity Investing skill 接入说明：[docs/codex_public_equity_skill_integration.md](docs/codex_public_equity_skill_integration.md)
- P0 状态：[docs/p0_status.md](docs/p0_status.md)
- AWS 部署说明：[docs/aws_deployment.md](docs/aws_deployment.md)
- 推荐生成报告：[reports/2026-W26-scored.md](reports/2026-W26-scored.md)
- 真实新闻与事件：[data/live_news_events.json](data/live_news_events.json)
- 自选研究定义与实时输出：[data/custom_watchlist.json](data/custom_watchlist.json)、[data/custom_watchlist_live.json](data/custom_watchlist_live.json)
- 历史回测运行记录：[data/simulation_runs/](data/simulation_runs/)

## 如何打开

刷新与定时任务需要本地服务，使用：

```bash
./scripts/start_local_server.sh
```

然后打开 `http://127.0.0.1:4173`。启用登录后不再支持直接打开 `web/index.html`；那种方式会绕过服务端访问控制，也无法执行真实数据刷新。

## 登录

- 本地服务使用单账号登录，所有页面、快照 JSON、健康状态和刷新 API 都要求有效会话。
- 密码使用随机盐和 `scrypt` 哈希保存在本机 `config/auth.json`，不会以明文保存。
- 会话使用 `HttpOnly`、`SameSite=Strict` Cookie，默认有效期 12 小时；服务重启会清空会话。
- 连续登录失败 5 次会锁定来源地址 15 分钟。
- `config/auth.json` 已被 Git 忽略，避免把短密码的哈希上传到公开仓库；仓库只保留 `config/auth.example.json`。

## 自动刷新与主动刷新

- 行情和新闻：每 6 小时自动抓取一次。
- 推荐：每 7 天自动运行一次完整抓取、差异检查、评分、分析、Codex 复核和快照发布。
- 自选：每天自动运行一次行情、财务、持仓、新闻抓取和半年/一年/两年以上分析。
- 配置文件：`config/refresh_schedule.json`。
- 调度状态：`data/scheduler_state.json`。
- 每次运行的审计记录：`data/refresh_runs/`。

页面“刷新推荐”和“刷新自选分析”会调用本地 API 主动抓取数据。系统对规范化后的输入计算指纹；只有输入发生实质变化时才重新分析。推荐变化时会创建唯一快照，自选变化时会更新独立分析文件。

刷新 API：

- `POST /api/refresh/recommendations`
- `POST /api/refresh/watchlist`
- `GET /api/refresh/status?runId=...`
- `GET /api/health`

刷新接口仅允许配置中带 `run_pipeline` 权限的家庭管理员调用。本地服务默认只监听 `127.0.0.1`；若绑定其他地址，必须配置 `COMASSET_REFRESH_TOKEN`。

## AWS 部署

当前版本可构建为静态站点并部署到 S3：

1. 构建静态发布目录：
   `./scripts/build_static_site.sh`
2. 配置 AWS 凭证：
   `/Users/thomas/Library/Python/3.9/bin/aws configure`
3. 发布到 S3 static website：
   `AWS_REGION=us-west-2 AWS_CLI=/Users/thomas/Library/Python/3.9/bin/aws ./scripts/deploy_aws_s3_static_site.sh`

详细说明见 [docs/aws_deployment.md](docs/aws_deployment.md)。注意：本地 Node 服务已有登录保护，但纯 S3 website 无法执行该认证；云端私有部署需要把同一服务运行在 Lambda、ECS 或 EC2，并由 HTTPS 入口转发。

## 数据脚本

当前数据管线是：

1. 拉取真实行情价格到 `data/live_prices.json`：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/fetch_prices_yahoo.js data/raw_candidates.json data/live_prices.json`
2. 拉取 SEC 财务数据到 `data/live_fundamentals.json`。当前覆盖美国股票；新加坡股票暂用候选池里的手工基础指标，后续需接入 SGX/公司公告数据：
   `SEC_USER_AGENT="comasset internal research your-email@example.com" /Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/fetch_fundamentals_sec.js data/raw_candidates.json data/sec_ticker_map.json data/live_fundamentals.json`
3. 拉取 FRED 宏观数据到 `data/live_macro.json`：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/fetch_macro_fred.js data/live_macro.json`
4. 导入 ETF/基金真实官方持仓到 `data/live_holdings.json`。脚本会先读取 `data/issuer_holdings/raw/{TICKER}.csv`，再尝试配置里的发行商 CSV 直链，最后使用官方 SEC N-PORT fallback：
   `SEC_USER_AGENT="comasset internal research your-email@example.com" /Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/fetch_holdings_official.js config/holdings_sources.json data/live_holdings.json`
5. 拉取 ticker 专属真实新闻，并为美国股票叠加 SEC EDGAR 官方申报事件：
   `SEC_USER_AGENT="comasset internal research your-email@example.com" /Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/fetch_news_events.js data/raw_candidates.json data/sec_ticker_map.json data/live_news_events.json`
   行情和新闻脚本默认同时读取 `data/custom_watchlist.json`，因此会刷新 GRAB、SPCX 和 AIQ，但不会把它们写入推荐候选池。
6. 合并真实数据输入，生成 enriched candidates；默认同时读取 `data/live_news_events.json`：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/enrich_candidates_real.js data/raw_candidates.json data/live_prices.json data/live_fundamentals.json data/live_holdings.json data/live_macro.json data/raw_candidates_live.json`
7. 原始候选数据生成 scored snapshot：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/score_candidates.js data/raw_candidates_live.json snapshots/scored-live.json config/app_config.json data/live_prices.json`
8. 可选但推荐：应用 Codex Public Equity Investing 审计结果。先用 Codex workflow 生成 `data/codex_public_equity_audit.json`，再写回 snapshot：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/apply_codex_public_equity_audit.js snapshots/scored-live.json data/codex_public_equity_audit.json snapshots/scored-live.json config/app_config.json`
9. 发布周度 snapshot 到 history、latest、前端 `web/snapshot.js` 和刷新接口文件 `web/latest.json`：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/publish_weekly_snapshot.js snapshots/scored-live.json snapshots/latest.json web/snapshot.js`
10. 运行严格按历史 snapshot 的真实价格回测，并保存到 `data/simulation_runs/`：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/run_snapshot_backtest.js --strategy mixed --initial 10000 --monthly 500 --rebalance monthly --member pipeline`
11. 校验快照：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate_snapshot.js snapshots/latest.json`
12. 从快照重建前端 fallback 数据：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build_data_js.js snapshots/latest.json web/data.js`
13. 生成推荐报告：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/generate_report.js snapshots/scored-live.json data/raw_candidates_live.json web/data_status.js reports/2026-W26-scored.md data/live_holdings.json data/simulation_runs/latest.json`
14. 检查 P0 readiness：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check_p0_readiness.js snapshots/latest.json config/data_sources.json data/live_holdings.json`
15. 校验家庭成员和权限配置：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate_family_access.js config/app_config.json`
16. 生成并校验独立自选分析数据：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build_custom_watchlist.js`
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate_custom_watchlist.js`

手动发行商 CSV 导入器仍可用于测试或后续替换 SEC fallback，CSV 表头见 `data/holdings_template.csv`：
`/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/import_holdings_csv.js data/holdings_template.csv data/live_holdings.json`

## 已实现的原型能力

- Dashboard：本周推荐概览、风险提醒、推荐数量和图表。
- 推荐列表：短期、长期、超长期筛选。
- 推荐刷新：点击推荐页“刷新推荐”会调用后台抓取真实数据；输入发生实质变化时重新评分、生成结构化分析、尝试 Codex Public Equity Investing 复核并创建唯一历史快照，随后原地更新页面。
- 自选分析：GRAB、SPCX（SpaceX）和 AIQ 使用真实行情、新闻/SEC 事件及可用的官方持仓数据形成独立研究页；每只标的展示未来半年、未来一年和两年以上的买进/持有/卖出动作、置信度及升降级触发条件。自选标的明确排除在推荐评分和历史回测选股之外。
- 标的详情：评分、价格、预期区间、因子拆解、风险、退出条件。
- Codex Public Equity Investing 审计：保存 skill 版本、调用时间、输入范围和摘要；通过 `scripts/apply_codex_public_equity_audit.js` 将 Codex workflow 产出的 JSON 写回 snapshot。
- 家庭备注：每个标的可保存观察状态和备注，存储在浏览器 localStorage。
- 家庭成员/权限基础版：可在页面顶部切换本地成员，备注按成员隔离；viewer 角色只读；设置页展示角色权限模型和本地审计日志。
- 家庭组合：展示当前持仓、资产类别暴露，以及本周推荐与已有持仓的重叠风险。
- 数据状态：展示行情、财务、基金持仓、宏观、新闻、Codex audit 的覆盖率、更新时间和阻塞项。
- 设置：展示基础货币、风险偏好、默认模拟参数、快照配置和目标资产配置。
- 因子分析：展示影响股票和基金的主要参数。
- 虚拟演练：可调整初始资金、每月投入、调仓频率和策略来源，动态生成多策略资产曲线、收益、回撤、Sharpe、换手次数、月度收益和交易记录。
- 历史 snapshot 回测：每次交易只使用交易日前已生成的 snapshot 和当时可得价格，使用 `SGDUSD=X` 统一换算新加坡股票，并记录 snapshot 审计链。
- 模拟记录：流水线运行保存到 `data/simulation_runs/`；家庭成员在网页点击“运行并保存”后写入该浏览器的 localStorage，并与正式运行记录一起展示。
- 价格信号：评分脚本可读取导入后的周度价格序列，覆盖动量、风险控制和当前价格。
- 真实数据接入：已增加 Yahoo 行情、Yahoo ticker 新闻、SEC companyfacts/EDGAR 事件、FRED 宏观、ETF/基金官方持仓导入和候选池 enrichment 脚本；当前候选池已包含 SGX 新加坡股票。
- Snapshot 驱动：页面优先读取 `web/snapshot.js`，`web/data.js` 保留为本地 fallback。
- P0 readiness：检查 latest snapshot、前端 snapshot、数据源清单和 Codex audit 字段是否齐备。
- 中英文双语切换。

## 当前 P0 边界

当前已完成的核心项：

1. 真实数据源。
2. Snapshot 驱动前端。
3. 每周 snapshot 存储。
4. Codex Public Equity Investing 审计。
5. 家庭成员和权限基础版。
6. 真实新闻和事件数据。
7. 历史 snapshot 回测与模拟记录。

其他内容先放 backlog，见 [docs/p0_status.md](docs/p0_status.md)。

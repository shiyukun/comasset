# Comasset Investment Lab

家庭内部自用的美股、ETF、共同基金投资研究网站原型。

## 当前内容

- PRD：[PRD/us_stock_fund_prediction_website_prd.md](PRD/us_stock_fund_prediction_website_prd.md)
- 静态原型：[web/index.html](web/index.html)
- 原型数据：[web/data.js](web/data.js)
- 家庭组合数据：[web/portfolio.js](web/portfolio.js)
- 前端交互：[web/app.js](web/app.js)
- 样式：[web/styles.css](web/styles.css)
- 周度快照 Schema：[docs/weekly_snapshot_schema.md](docs/weekly_snapshot_schema.md)
- 评分方法说明：[docs/scoring_methodology.md](docs/scoring_methodology.md)

## 如何打开

直接用浏览器打开 `web/index.html` 即可。当前原型不依赖后端服务，也不需要安装 npm 包。

## 数据脚本

当前数据管线是：

1. 原始候选数据生成 scored snapshot：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/score_candidates.js data/raw_candidates.json snapshots/scored-2026-W25.json`
2. `web/data.js` 导出为周度快照：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/export_snapshot.js`
3. 校验快照：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/validate_snapshot.js snapshots/latest.json`
4. 从快照重建前端数据：
   `/Users/thomas/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build_data_js.js snapshots/latest.json web/data.js`

## 已实现的原型能力

- Dashboard：本周推荐概览、风险提醒、推荐数量和图表。
- 推荐列表：短期、长期、超长期筛选。
- 标的详情：评分、价格、预期区间、因子拆解、风险、退出条件。
- Claude 金融 skill 审计：保存 skill 版本、调用时间、输入范围和摘要。
- 家庭备注：每个标的可保存观察状态和备注，存储在浏览器 localStorage。
- 家庭组合：展示当前持仓、资产类别暴露，以及本周推荐与已有持仓的重叠风险。
- 因子分析：展示影响股票和基金的主要参数。
- 虚拟演练：可调整初始资金、每月投入、调仓频率和策略来源，动态生成资产曲线、收益、回撤、Sharpe 和交易记录。
- 中英文双语切换。

## 下一步建议

1. 接入真实行情、财务、ETF/基金和宏观数据源。
2. 将 `web/data.js` 替换为 API 返回的数据结构。
3. 按 `docs/weekly_snapshot_schema.md` 增加每周推荐快照存储，用于回测和复盘。
4. 接入 Claude 金融 skill 的真实调用与审计日志。
5. 增加家庭成员账号和权限。

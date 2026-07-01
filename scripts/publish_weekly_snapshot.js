const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const snapshotPath = process.argv[2] || path.join(root, "snapshots", "scored-2026-W25.json");
const latestPath = process.argv[3] || path.join(root, "snapshots", "latest.json");
const snapshotJsPath = process.argv[4] || path.join(root, "web", "snapshot.js");
const webLatestPath = process.argv[5] || path.join(root, "web", "latest.json");
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

if (!snapshot.snapshotId) {
  throw new Error("Snapshot must include snapshotId.");
}

const historyDir = path.join(root, "snapshots", "history");
const historyPath = path.join(historyDir, `${snapshot.snapshotId}.json`);

fs.mkdirSync(historyDir, { recursive: true });
fs.writeFileSync(historyPath, `${JSON.stringify(snapshot, null, 2)}\n`);
fs.writeFileSync(latestPath, `${JSON.stringify(snapshot, null, 2)}\n`);
fs.writeFileSync(snapshotJsPath, `window.comassetSnapshot = ${JSON.stringify(snapshot, null, 2)};\n`);
fs.writeFileSync(webLatestPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Published ${snapshot.snapshotId}.`);
console.log(`- ${path.relative(root, historyPath)}`);
console.log(`- ${path.relative(root, latestPath)}`);
console.log(`- ${path.relative(root, snapshotJsPath)}`);
console.log(`- ${path.relative(root, webLatestPath)}`);

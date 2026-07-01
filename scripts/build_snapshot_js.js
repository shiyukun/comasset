const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const snapshotPath = process.argv[2] || path.join(root, "snapshots", "latest.json");
const outputPath = process.argv[3] || path.join(root, "web", "snapshot.js");
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `window.comassetSnapshot = ${JSON.stringify(snapshot, null, 2)};\n`);
console.log(`Wrote ${path.relative(root, outputPath)} from ${path.relative(root, snapshotPath)}.`);

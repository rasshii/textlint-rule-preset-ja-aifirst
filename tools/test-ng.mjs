#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const NG_DIR = "test/ng";

const files = readdirSync(NG_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => join(NG_DIR, f));

if (files.length === 0) {
  console.error(`No .md files found in ${NG_DIR}`);
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["textlint", "--format", "json", ...files],
  { encoding: "utf8" },
);

let report;
try {
  report = JSON.parse(result.stdout || "[]");
} catch (e) {
  console.error("Failed to parse textlint JSON output:");
  console.error(result.stdout);
  console.error(result.stderr);
  process.exit(1);
}

const filesWithoutError = report
  .filter((r) => !r.messages || r.messages.length === 0)
  .map((r) => r.filePath);

if (filesWithoutError.length > 0) {
  console.error("FAIL: Expected at least one error in each ng file, but got 0 errors in:");
  for (const f of filesWithoutError) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`OK: All ${files.length} ng files produced errors as expected.`);
for (const r of report) {
  console.log(`  - ${r.filePath}: ${r.messages.length} error(s)`);
}

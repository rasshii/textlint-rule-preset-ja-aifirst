#!/usr/bin/env node
// preset 統合経路で各 fixture が「想定 rule で実際に検出されている」ことを保証する
// (件数下限のみのチェックは想定 rule の無音化を見逃すため、mustHit + min を assert する)
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const NG_DIR = "test/ng";

// 各 fixture が必ず含むべき rule ID と最小件数の宣言
// mustHit に prefix:"jtf-style/" のような prefix 形式も許容する
const EXPECTATIONS = {
  "abbr-parentheses.md":           { mustHit: ["abbr-within-parentheses"],            min: 2 },
  "abusage.md":                    { mustHit: ["ja-no-abusage"],                       min: 2 },
  "ai-companies.md":               { mustHit: ["prh"],                                  min: 10 },
  "ai-concepts.md":                { mustHit: ["prh"],                                  min: 10 },
  "ai-models.md":                  { mustHit: ["prh"],                                  min: 10 },
  "dev-tools.md":                  { mustHit: ["prh"],                                  min: 15 },
  "doubled-joshi.md":              { mustHit: ["no-doubled-joshi"],                    min: 1 },
  "ja-hiragana.md":                { mustHit: ["no-dropping-the-ra"],                  min: 1 },
  "jtf-style.md":                  { mustHitPrefix: ["jtf-style/"],                    min: 3 },
  "kanji-continuous.md":           { mustHit: ["max-kanji-continuous-len"],            min: 2 },
  "max-ten.md":                    { mustHit: ["max-ten"],                              min: 1 },
  "missing-period.md":             { mustHit: ["ja-no-mixed-period"],                  min: 1 },
  "mixed-alphabet.md":             { mustHitPrefix: ["jtf-style/"],                    min: 2 },
  "programming-langs.md":          { mustHit: ["prh"],                                  min: 3 },
  "redundant.md":                  { mustHit: ["ja-no-redundant-expression"],          min: 4 },
  "sentence-length.md":            { mustHit: ["sentence-length"],                      min: 1 },
  "style-mix.md":                  { mustHit: ["no-mix-dearu-desumasu"],               min: 1 },
  "successive-word.md":            { mustHit: ["ja-no-successive-word"],               min: 2 },
  "weak-phrase.md":                { mustHit: ["ja-no-weak-phrase"],                   min: 1 },
};

const files = readdirSync(NG_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((f) => join(NG_DIR, f));

if (files.length === 0) {
  console.error(`No .md files found in ${NG_DIR}`);
  process.exit(1);
}

// manifest との対称性チェック (fixture 追加時の登録漏れ防止)
const expectedFiles = new Set(Object.keys(EXPECTATIONS));
const actualFiles = new Set(files.map((f) => f.split("/").pop()));
const missingInManifest = [...actualFiles].filter((f) => !expectedFiles.has(f));
const missingInFiles = [...expectedFiles].filter((f) => !actualFiles.has(f));

if (missingInManifest.length > 0) {
  console.error(`FAIL: fixture file is not registered in EXPECTATIONS manifest:`);
  for (const f of missingInManifest) console.error(`  - ${f}`);
  process.exit(1);
}
if (missingInFiles.length > 0) {
  console.error(`FAIL: EXPECTATIONS manifest entry has no matching fixture file:`);
  for (const f of missingInFiles) console.error(`  - ${f}`);
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

let failed = 0;
let passed = 0;

for (const r of report) {
  const fileName = r.filePath.split("/").pop();
  const expectation = EXPECTATIONS[fileName];
  if (!expectation) continue; // 上の symmetry チェックで弾かれているはず

  const messages = r.messages || [];
  const ruleIds = messages.map((m) => m.ruleId);

  let hitCheck = false;
  if (expectation.mustHit) {
    hitCheck = expectation.mustHit.some((id) => ruleIds.includes(id));
  } else if (expectation.mustHitPrefix) {
    hitCheck = expectation.mustHitPrefix.some((prefix) => ruleIds.some((id) => id.startsWith(prefix)));
  }

  const countCheck = messages.length >= expectation.min;

  if (hitCheck && countCheck) {
    console.log(`OK   ${fileName}: ${messages.length} error(s), expected rule hit`);
    passed++;
  } else {
    console.error(`FAIL ${fileName}:`);
    if (!hitCheck) {
      const want = expectation.mustHit
        ? `mustHit one of [${expectation.mustHit.join(", ")}]`
        : `mustHitPrefix one of [${expectation.mustHitPrefix.join(", ")}]`;
    console.error(`  ${want}, got ruleIds: [${[...new Set(ruleIds)].join(", ")}]`);
    }
    if (!countCheck) {
      console.error(`  expected min ${expectation.min}, got ${messages.length}`);
    }
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed (out of ${files.length})`);
if (failed > 0) process.exit(1);

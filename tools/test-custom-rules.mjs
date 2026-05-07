#!/usr/bin/env node
// 独自ルールの unit test
// preset module を直接 require し、@textlint/kernel API で lintText を呼び出して
// invalid 例ではエラー検出、valid 例では 0 errors を保証する。
// devDependencies 追加なし (textlint 14 の transitively な依存のみ使用)。

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { TextlintKernel } = require("@textlint/kernel");
const { moduleInterop } = require("@textlint/module-interop");
const markdownPlugin = moduleInterop(require("@textlint/textlint-plugin-markdown"));
const preset = require("../index.js");

const kernel = new TextlintKernel();

// Sanity: preset module 経由で独自 rule を取り出せること (`index.js` の rule export が
// 壊れていないことを保証。textlint の rule resolver 仕様で `.textlintrc.json` 経由の
// 統合テストは利用者環境 (npm install 後) でしか不可能なため、本 sanity check が
// 実質的な「preset 統合経路の保証」になる)
if (!preset.rules || typeof preset.rules !== "object") {
  console.error("FAIL: preset.rules is not exported");
  process.exit(1);
}
if (typeof preset.rules["no-unbacktick-identifier"] !== "object") {
  console.error("FAIL: preset.rules['no-unbacktick-identifier'] is missing or not exported as object");
  process.exit(1);
}
if (typeof preset.rules["no-unbacktick-identifier"].linter !== "function") {
  console.error("FAIL: preset.rules['no-unbacktick-identifier'].linter is missing");
  process.exit(1);
}
if (typeof preset.rules["no-unbacktick-identifier"].fixer !== "function") {
  console.error("FAIL: preset.rules['no-unbacktick-identifier'].fixer is missing");
  process.exit(1);
}
console.log("OK   sanity: preset.rules['no-unbacktick-identifier'] exports linter + fixer");

if (typeof preset.rules["no-vague-heading"] !== "object") {
  console.error("FAIL: preset.rules['no-vague-heading'] is missing or not exported as object");
  process.exit(1);
}
if (typeof preset.rules["no-vague-heading"].linter !== "function") {
  console.error("FAIL: preset.rules['no-vague-heading'].linter is missing");
  process.exit(1);
}
console.log("OK   sanity: preset.rules['no-vague-heading'] exports linter");

const TEST_CASES = {
  "no-unbacktick-identifier": {
    rule: preset.rules["no-unbacktick-identifier"],
    options: preset.rulesConfig["no-unbacktick-identifier"],
    invalid: [
      {
        name: "npm install をバッククォートなしで使用",
        text: "プロジェクトに npm install を実行する。",
        expectedMessageIncludes: "npm install",
      },
      {
        name: "npx create-next-app をバッククォートなしで使用",
        text: "雛形は npx create-next-app で作成する。",
        expectedMessageIncludes: "npx create-next-app",
      },
      {
        name: "yarn add も検出",
        text: "依存追加は yarn add some-pkg で行う。",
        expectedMessageIncludes: "yarn add",
      },
      {
        name: "pnpm install も検出",
        text: "高速化のため pnpm install を選ぶ。",
        expectedMessageIncludes: "pnpm install",
      },
      {
        name: "1 行に複数のコマンドが混在しても全件検出",
        text: "npm install のあと npm run build を流す。",
        expectedCount: 2,
      },
      {
        name: "Heading 内のコマンドも検出",
        text: "## npm install の使い方\n",
        expectedMessageIncludes: "npm install",
      },
      {
        name: "options.patterns で Docker コマンドを検出",
        text: "Docker run app を実行する。",
        expectedMessageIncludes: "Docker run",
        optionsOverride: {
          patterns: [{ source: "\\b[Dd]ocker\\s+\\w+", label: "Docker コマンド" }],
        },
      },
      {
        name: "g フラグなしの patterns でも無限ループせず正常検出",
        text: "TODO を残してはいけない。",
        expectedMessageIncludes: "TODO",
        optionsOverride: {
          patterns: [{ source: "TODO", flags: "i", label: "TODO" }],
        },
      },
    ],
    valid: [
      {
        name: "バッククォートで囲まれていれば OK",
        text: "プロジェクトに `npm install` を実行する。",
      },
      {
        name: "コードブロック内は対象外",
        text: "```sh\nnpm install\n```",
      },
      {
        name: "インラインコード内は対象外",
        text: "依存追加は `yarn add some-pkg` で行う。",
      },
      {
        name: "コマンドではない単語は誤検知しない",
        text: "npm 公式サイトを参照する。",
      },
      {
        name: "Markdown link 内のラベルにマッチしない",
        text: "詳細は [npm 公式](https://www.npmjs.com/) を参照する。",
      },
    ],
  },
  "no-vague-heading": {
    rule: preset.rules["no-vague-heading"],
    options: preset.rulesConfig["no-vague-heading"],
    invalid: [
      {
        name: "2 文字見出し『概要』 (default minLength=4)",
        text: "# 概要\n",
        expectedMessageIncludes: "概要",
      },
      {
        name: "3 文字見出し『使い方』",
        text: "## 使い方\n",
        expectedMessageIncludes: "使い方",
      },
      {
        name: "深い階層 (####) でも検出",
        text: "#### まとめ\n",
        expectedMessageIncludes: "まとめ",
      },
      {
        name: "本文があっても見出しの長さのみで判定",
        text: "# 概要\n\n本文は判定対象外で、見出しの 2 文字のみで警告される。\n",
        expectedMessageIncludes: "概要",
        expectedCount: 1,
      },
      {
        name: "options.minLength=6 で『TIPS』 (4 文字) も検出",
        text: "# TIPS\n",
        expectedMessageIncludes: "TIPS",
        optionsOverride: { minLength: 6 },
      },
      {
        name: "options.vagueWords=['TIPS'] で『TIPS』 (default minLength=4 OK でも) を検出",
        text: "# TIPS\n",
        expectedMessageIncludes: "vagueWords",
        optionsOverride: { vagueWords: ["TIPS"] },
      },
      {
        name: "options.vagueWords で 4 文字以上の日本語曖昧語『メモ書き』を検出 (minLength では拾えない)",
        text: "## メモ書き\n",
        expectedMessageIncludes: "vagueWords",
        optionsOverride: { vagueWords: ["メモ書き", "サンプル"] },
      },
      {
        name: "vagueWords 完全一致のみ判定 (前後文字を含む見出しは見逃さない方針: 完全一致のみ)",
        text: "# Tips for v1.1.0\n",
        expectedMessageIncludes: "Tips",
        optionsOverride: { vagueWords: ["Tips for v1.1.0"] },
      },
    ],
    valid: [
      {
        name: "4 文字 (TIPS) は default minLength=4 + vagueWords=[] で OK",
        text: "# TIPS\n",
      },
      {
        name: "長い見出し『v1.1.0 リリース概要』は OK",
        text: "## v1.1.0 リリース概要\n",
      },
      {
        name: "本文のみ (見出しなし) は対象外",
        text: "本文だけのテキスト。見出しが無いので警告されない。\n",
      },
      {
        name: "InlineCode を含む見出しは合算文字数で判定 (`npm install` の手順 = 13 文字)",
        text: "## `npm install` の手順\n",
      },
      {
        name: "vagueWords default = [] のため案件外 (preset は machinery のみ提供)",
        text: "## TIPS\n## Notes\n## Memo\n",
      },
      {
        name: "vagueWords 部分一致は誤検出しない (完全一致のみ)",
        text: "## TIPS for v1.1.0 リリース\n",
        // optionsOverride で vagueWords=['TIPS'] を渡しても "TIPS for v1.1.0 リリース" 全体は一致しない
      },
    ],
  },
};

const baseLintOptions = {
  filePath: "test.md",
  ext: ".md",
  plugins: [{ pluginId: "markdown", plugin: markdownPlugin }],
  filterRules: [],
};

let failed = 0;
let passed = 0;

for (const [ruleId, spec] of Object.entries(TEST_CASES)) {
  const ruleEntry = {
    ruleId,
    rule: spec.rule,
    options: spec.options ?? true,
  };

  for (const c of spec.invalid) {
    const entryForCase = c.optionsOverride
      ? { ...ruleEntry, options: c.optionsOverride }
      : ruleEntry;
    const result = await kernel.lintText(c.text, { ...baseLintOptions, rules: [entryForCase] });
    const messages = result.messages;
    const ruleHits = messages.filter((m) => m.ruleId === ruleId);
    const matchesIncludes = c.expectedMessageIncludes
      ? ruleHits.some((m) => m.message.includes(c.expectedMessageIncludes))
      : true;
    const matchesCount = c.expectedCount ? ruleHits.length === c.expectedCount : ruleHits.length >= 1;

    if (matchesIncludes && matchesCount) {
      console.log(`OK   [${ruleId}] invalid: ${c.name}`);
      passed++;
    } else {
      console.error(`FAIL [${ruleId}] invalid: ${c.name}`);
      console.error(`  text: ${JSON.stringify(c.text)}`);
      console.error(`  hits: ${ruleHits.map((m) => m.message).join(" | ") || "(none)"}`);
      if (c.expectedMessageIncludes) console.error(`  expected message to include: ${c.expectedMessageIncludes}`);
      if (c.expectedCount) console.error(`  expected count: ${c.expectedCount}, got: ${ruleHits.length}`);
      failed++;
    }
  }

  for (const c of spec.valid) {
    const result = await kernel.lintText(c.text, { ...baseLintOptions, rules: [ruleEntry] });
    const ruleHits = result.messages.filter((m) => m.ruleId === ruleId);

    if (ruleHits.length === 0) {
      console.log(`OK   [${ruleId}] valid:   ${c.name}`);
      passed++;
    } else {
      console.error(`FAIL [${ruleId}] valid:   ${c.name}`);
      console.error(`  text: ${JSON.stringify(c.text)}`);
      console.error(`  unexpected: ${ruleHits.map((m) => m.message).join(" | ")}`);
      failed++;
    }
  }
}

// fix payload の検証 (autofix が backtick 置換を生成するか)
{
  const ruleEntry = {
    ruleId: "no-unbacktick-identifier",
    rule: preset.rules["no-unbacktick-identifier"],
    options: preset.rulesConfig["no-unbacktick-identifier"] ?? true,
  };
  const result = await kernel.lintText("npm install を実行する。", {
    ...baseLintOptions,
    rules: [ruleEntry],
  });
  const hit = result.messages.find((m) => m.ruleId === "no-unbacktick-identifier");
  const expectedFixText = "`npm install`";
  if (hit && hit.fix && hit.fix.text === expectedFixText) {
    console.log(`OK   [no-unbacktick-identifier] fix:    autofix が backtick 置換 (${expectedFixText}) を生成`);
    passed++;
  } else {
    console.error("FAIL [no-unbacktick-identifier] fix:    autofix の fix payload が不正");
    console.error(`  hit: ${JSON.stringify(hit)}`);
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

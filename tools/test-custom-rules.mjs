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
    const result = await kernel.lintText(c.text, { ...baseLintOptions, rules: [ruleEntry] });
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

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

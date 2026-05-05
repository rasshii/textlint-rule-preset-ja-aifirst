const path = require("path");
const { moduleInterop } = require("@textlint/module-interop");

const jtfStyle = moduleInterop(require("textlint-rule-preset-jtf-style"));

module.exports = {
  rules: {
    ...jtfStyle.rules,
    "no-dropping-the-ra": moduleInterop(require("textlint-rule-no-dropping-the-ra")),
    "ja-hiragana-fukushi": moduleInterop(require("textlint-rule-ja-hiragana-fukushi")),
    "ja-hiragana-hojodoushi": moduleInterop(require("textlint-rule-ja-hiragana-hojodoushi")),
    "ja-hiragana-daimeishi": moduleInterop(require("textlint-rule-ja-hiragana-daimeishi")),
    "ja-keishikimeishi": moduleInterop(require("textlint-rule-ja-keishikimeishi")),
    "prh": moduleInterop(require("textlint-rule-prh")),
  },
  rulesConfig: {
    ...jtfStyle.rulesConfig,
    "no-dropping-the-ra": true,
    "ja-hiragana-fukushi": true,
    "ja-hiragana-hojodoushi": true,
    "ja-hiragana-daimeishi": true,
    "ja-keishikimeishi": {
      detection_hou_kata: false,
      detection_ue: false,
    },
    "prh": {
      rulePaths: [path.resolve(__dirname, "prh.yml")],
    },
  },
};

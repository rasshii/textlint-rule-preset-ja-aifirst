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
    // AI 文書品質 (高品質日本語文書全般)
    "no-mix-dearu-desumasu": moduleInterop(require("textlint-rule-no-mix-dearu-desumasu")),
    "ja-no-redundant-expression": moduleInterop(require("textlint-rule-ja-no-redundant-expression")),
    "sentence-length": moduleInterop(require("textlint-rule-sentence-length")),
    "max-ten": moduleInterop(require("textlint-rule-max-ten")),
    "no-doubled-joshi": moduleInterop(require("textlint-rule-no-doubled-joshi")),
    "max-kanji-continuous-len": moduleInterop(require("textlint-rule-max-kanji-continuous-len")),
    "no-mixed-zenkaku-and-hankaku-alphabet": moduleInterop(require("textlint-rule-no-mixed-zenkaku-and-hankaku-alphabet")),
  },
  rulesConfig: {
    ...jtfStyle.rulesConfig,
    // AI ファースト方針: 半角スペース・半角コロンを許容 (技術文書慣習)
    "3.1.1.全角文字と半角文字の間": false,
    "4.2.7.コロン(：)": false,
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
    // AI 文書品質
    "no-mix-dearu-desumasu": {
      preferInHeader: "",
      preferInBody: "ですます",
      preferInList: "である",
      strict: false,
    },
    "ja-no-redundant-expression": true,
    "sentence-length": {
      max: 100,
    },
    "max-ten": {
      max: 4,
    },
    "no-doubled-joshi": {
      min_interval: 1,
      strict: false,
    },
    "max-kanji-continuous-len": {
      max: 6,
    },
    "no-mixed-zenkaku-and-hankaku-alphabet": true,
  },
  filters: {
    comments: moduleInterop(require("textlint-filter-rule-comments")),
  },
  filtersConfig: {
    comments: true,
  },
};

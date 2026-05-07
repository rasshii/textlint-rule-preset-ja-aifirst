// AI grep 最適化のための独自ルール (Phase 2)
// 短すぎる見出し / 曖昧語の見出しを警告する
// (見出しは AI が文書内検索の起点とするため、最低限の具体性と低情報量語の排除が必要)

const DOCS_URL =
  "https://github.com/rasshii/textlint-rule-preset-ja-aifirst#含まれるルール";

const DEFAULT_MIN_LENGTH = 4;
// preset 側では default 空。利用者が自プロジェクト固有の曖昧語を define する。
// 推奨セット例: ['TIPS', 'Tips', 'TBD', 'TBA', 'FYI', 'WIP', 'Notes', 'Memo']
const DEFAULT_VAGUE_WORDS = [];

function extractHeadingText(node) {
  let text = "";
  for (const child of node.children || []) {
    if (typeof child.value === "string") {
      text += child.value;
    } else if (child.children) {
      text += extractHeadingText(child);
    }
  }
  return text;
}

const reporter = (context, options = {}) => {
  const { Syntax, RuleError, report } = context;
  const minLength =
    typeof options.minLength === "number" && options.minLength > 0
      ? options.minLength
      : DEFAULT_MIN_LENGTH;
  const vagueWordsSet = new Set(
    Array.isArray(options.vagueWords) ? options.vagueWords : DEFAULT_VAGUE_WORDS
  );

  return {
    [Syntax.Header](node) {
      const text = extractHeadingText(node).trim();
      if (text.length === 0) return;
      if (text.length < minLength) {
        report(
          node,
          new RuleError(
            `見出し "${text}" が短すぎます (${text.length} 文字 < minLength=${minLength})。AI grep 用に内容を具体化してください [${DOCS_URL}]`
          )
        );
        return;
      }
      if (vagueWordsSet.has(text)) {
        report(
          node,
          new RuleError(
            `見出し "${text}" は曖昧語リスト (vagueWords) に含まれます。AI grep 用に文脈を補ってください (例: "${text} for X" / "X の ${text}") [${DOCS_URL}]`
          )
        );
      }
    },
  };
};

module.exports = {
  linter: reporter,
};

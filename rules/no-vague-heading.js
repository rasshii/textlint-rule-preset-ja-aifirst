// AI grep 最適化のための独自ルール (Phase 2)
// 短すぎる見出しを警告する (見出しは AI が文書内検索の起点とするため、最低限の具体性が必要)

const DEFAULT_MIN_LENGTH = 4;

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

  return {
    [Syntax.Header](node) {
      const text = extractHeadingText(node).trim();
      if (text.length === 0) return;
      if (text.length < minLength) {
        report(
          node,
          new RuleError(
            `見出し "${text}" が短すぎます (${text.length} 文字 < minLength=${minLength})。AI grep 用に内容を具体化してください`
          )
        );
      }
    },
  };
};

module.exports = {
  linter: reporter,
};

let analysis = require("./analysis");

function scanner(src) {
  let chars = stream(src);
  let tokens = [];

  while (chars.hasMore()) {
    if (analysis.isWhiteSpace(chars.peek())) {
      chars.take();
      continue;
    }

    if (chars.peek() === ",") {
      chars.take();
      continue;
    }

    if (chars.peek() === "(") {
      let start = chars.loc();
      let end = chars.loc();
      tokens.push({ type: "OpenParen", value: chars.take(), start, end });
      continue;
    }

    if (chars.peek() === ")") {
      let start = chars.loc();
      let end = chars.loc();
      tokens.push({ type: "CloseParen", value: chars.take(), start, end });
      continue;
    }

    if (chars.peek() === "{") {
      let start = chars.loc();
      let end = chars.loc();
      tokens.push({ type: "OpenCurly", value: chars.take(), start, end });
      continue;
    }

    if (chars.peek() === "}") {
      let start = chars.loc();
      let end = chars.loc();
      tokens.push({ type: "CloseCurly", value: chars.take(), start, end });
      continue;
    }

    if (chars.peek() === "[") {
      let start = chars.loc();
      let end = chars.loc();
      tokens.push({ type: "OpenSquare", value: chars.take(), start, end });
      continue;
    }

    if (chars.peek() === "]") {
      let start = chars.loc();
      let end = chars.loc();
      tokens.push({ type: "CloseSquare", value: chars.take(), start, end });
      continue;
    }

    if (chars.peek() === "|") {
      let start = chars.loc();
      let end = chars.loc();
      tokens.push({ type: "Pipe", value: chars.take(), start, end });
      continue;
    }

    if (chars.peek() === "#") {
      let value = [chars.take()];

      while (chars.peek() !== "\n") {
        value.push(chars.take());
      }

      continue;
    }

    if (chars.peek() === ":") {
      let start = chars.loc();
      let value = [chars.take()];

      while (analysis.isValidIdentifierCharacter(chars.peek())) {
        value.push(chars.take());
      }

      let end = chars.lastLoc();
      tokens.push({ type: "Keyword", value: value.join(""), start, end });
      continue;
    }

    if (analysis.isNumber(chars.peek())) {
      let start = chars.loc();
      let value = [];

      while (analysis.isNumber(chars.peek())) {
        value.push(chars.take());
      }

      if (chars.peek() === ".") {
        value.push(chars.take());
      }

      while (analysis.isNumber(chars.peek())) {
        value.push(chars.take());
      }

      let end = chars.lastLoc();

      tokens.push({ type: "Number", value: value.join(""), start, end });
      continue;
    }

    if (chars.peek() === '"') {
      let start = chars.loc();
      let value = [chars.take()];

      while (true) {
        if (chars.peek() === "\\") {
          value.push(chars.take(), chars.take());
        }

        if (chars.peek() === '"') {
          value.push(chars.take());
          break;
        }

        if (chars.length === 0) {
          throw new Error("Unterminated string");
        }

        value.push(chars.take());
      }

      let end = chars.lastLoc();

      tokens.push({ type: "String", value: value.join(""), start, end });

      continue;
    }

    if (chars.peek() === "/") {
      let start = chars.loc();
      let value = [chars.take()];

      while (true) {
        if (chars.peek() === "\\") {
          value.push(chars.take(), chars.take());
        }

        if (chars.peek() === "/") {
          value.push(chars.take());
          break;
        }

        if (chars.length === 0) {
          throw new Error("Unterminated regex");
        }

        value.push(chars.take());
      }

      let end = chars.lastLoc();

      tokens.push({ type: "Regex", value: value.join(""), start, end });

      continue;
    }

    if (analysis.isValidIdentifierCharacter(chars.peek())) {
      let start = chars.loc();
      let value = [];

      while (analysis.isValidIdentifierCharacter(chars.peek())) {
        value.push(chars.take());
      }

      let end = chars.lastLoc();
      tokens.push({ type: "Identifier", name: value.join(""), start, end });
      continue;
    }

    throw new Error(`Unexpected character: "${chars.peek()}"`);
  }

  return tokens;
}

function stream(src) {
  let cursor = 0;
  let row = 1;
  let col = 1;
  let lastRow = 1;
  let lastCol = 1;

  return {
    peek() {
      return src[cursor];
    },
    take() {
      let char = this.peek();

      lastRow = row;
      lastCol = col;

      if (char === "\n") {
        row += 1;
        col = 1;
      } else {
        col += 1;
      }

      cursor += 1;

      return char;
    },
    loc() {
      return { row, col };
    },
    lastLoc() {
      return { row: lastRow, col: lastCol };
    },
    hasMore() {
      return cursor < src.length;
    }
  }
}

module.exports = scanner;

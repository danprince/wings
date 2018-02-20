let assert = require("./assert");
let errors = require("./errors");

function parser(tokens, src) {
  function Program() {
    let body = [];

    while (tokens.length > 0) {
      body.push(Expression());
    }

    let start = { row: 1, line: 1 };

    let end = tokens.length > 0
      ? tokens[tokens.length - 1].end
      : { row: 1, line: 1 };

    return { type: "Program", body, start, end };
  }

  function Expression() {
    if (tokens.length === 0) {
      errors.SyntaxError({
        message: "Unexpected end of input!",
        description: ``,
        src
      });
    }

    switch (tokens[0].type) {
      case "OpenParen": return CallExpression();
      case "OpenSquare": return ListLiteral();
      case "OpenCurly": return ObjectLiteral();
      case "String": return StringLiteral();
      case "Number": return NumberLiteral();
      case "Keyword": return KeywordLiteral();
      case "Regex": return RegexLiteral();
      case "Identifier": return Identifier();

      default: errors.SyntaxError({
        node: tokens[0],
        message: "Unexpected token!",
        description: ``,
        src
      });
    }
  }

  function CallExpression() {
    let openParen = tokens.shift();
    let body = [];

    while (tokens[0].type !== "CloseParen") {
      body.push(Expression());

      if (tokens.length === 0) {
        errors.SyntaxError({
          node: openParen,
          message: "Unterminated call!",
          description: `There is no bracket to close this call.`,
          src
        });
      }
    }

    let closeParen = tokens.shift();
    let start = openParen.start;
    let end = closeParen.end;

    return { type: "CallExpression", body, start, end };
  }

  function ListLiteral() {
    let openBrace = tokens.shift();
    let elements = [];

    while (tokens[0].type !== "CloseSquare") {
      elements.push(Expression());

      if (tokens.length === 0) {
        errors.SyntaxError({
          node: openBrace,
          message: "Unterminated list",
          description: `There is no closing brace to close this list.`,
          src
        });
      }
    }

    let closeBrace = tokens.shift();
    let start = openBrace.start;
    let end = closeBrace.end;

    return { type: "ListLiteral", elements, start, end };
  }

  function ObjectLiteral() {
    let openBrace = tokens.shift();
    let merges = [];
    let properties = [];

    while (tokens[0].type !== "CloseCurly") {
      let key = tokens.shift();

      if (key.type !== "Identifier") {
        errors.SyntaxError({
          node: key,
          message: "Object keys must be identifiers!",
          description: ``,
          src
        });
      }

      // If the key is followed by an assignment, then parse the value.
      if (tokens[0].type === "Identifier" && tokens[0].name === "=") {
        tokens.shift();
        let value = Expression();
        properties.push({ key, value });
      }

      // If the key is followed by a pipe, then merge the object
      else if (tokens[0].type === "Pipe") {
        tokens.shift();
        merges.push(key);
      }

      // Otherwise, treat it as a shorthand assignment to a variable
      // of the same name.
      else {
        properties.push({ key, value: key });
      }

      if (tokens.length === 0) {
        errors.SyntaxError({
          node: openBrace,
          message: "Unterminated object",
          description: `There is no closing brace for this object.`,
          src
        });
      }
    }

    let closeBrace = tokens.shift();
    let start = openBrace.start;
    let end = closeBrace.end;

    return { type: "ObjectLiteral", properties, merges, start, end };
  }

  function NumberLiteral() {
    let token = tokens.shift();
    let start = token.start;
    let end = token.end;
    return { type: "NumberLiteral", value: Number(token.value), start, end };
  }

  function KeywordLiteral() {
    let token = tokens.shift();
    let start = token.start;
    let end = token.end;
    return { type: "KeywordLiteral", value: token.value.slice(1), start, end };
  }

  function StringLiteral() {
    let token = tokens.shift();
    let start = token.start;
    let end = token.end;
    return { type: "StringLiteral", value: token.value, start, end };
  }

  function RegexLiteral() {
    let token = tokens.shift();
    let start = token.start;
    let end = token.end;
    return { type: "RegexLiteral", value: token.value, start, end };
  }

  function Identifier() {
    let token = tokens.shift();
    let start = token.start;
    let end = token.end;
    return { type: "Identifier", name: token.name, start, end };
  }

  return Program();
}

module.exports = parser;

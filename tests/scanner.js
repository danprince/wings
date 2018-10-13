let test = require("tape");
let scanner = require("../lib/scanner");

test("scanner", t => {
  t.same(
    scanner("3").map(token => token.type),
    ["Number"],
    "should lex numbers"
  );

  t.same(
    scanner("(hello 3)").map(token => token.type),
    ["OpenParen", "Identifier", "Number", "CloseParen"],
    "should lex basic expressions"
  );

  t.same(
    scanner(`"hello"`).map(token => token.type),
    ["String"],
    "should lex string literals"
  );

  t.same(
    scanner("[1 2 3]").map(token => token.type),
    ["OpenSquare", "Number", "Number", "Number", "CloseSquare"],
    "should lex basic list literals"
  );

  t.same(
    scanner("{ foo 3 }").map(token => token.type),
    ["OpenCurly", "Identifier", "Number", "CloseCurly"],
    "should lex basic object literals"
  );

  t.end();
});

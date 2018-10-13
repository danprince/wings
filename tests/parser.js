let test = require("tape");
let snap = require("assert-snapshot");
let scanner = require("../lib/scanner");
let parser = require("../lib/parser");

let compile = src => {
  let tokens = scanner(src);
  let ast = parser(tokens, src);
  let json = JSON.stringify(ast, null, 2);
  return json;
};

test("parser", t => {
  t.test("call expressions", () => {
    snap(t, compile("(foo bar baz)"))
    t.end();
  })

  t.end();
});

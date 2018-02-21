let scanner = require("./scanner");
let parser = require("./parser");
let transformer = require("./transformer");
let printer = require("./printer");

function compiler(src) {
  let tokens = scanner(src);
  let ast = parser(tokens, src);
  ast = transformer(ast);
  let js = printer(ast);
  return js;
}

module.exports = compiler;

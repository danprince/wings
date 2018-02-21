let scanner = require("./scanner");
let parser = require("./parser");
let transformer = require("./transformer");
let generator = require("./generator");

function compiler(src) {
  let tokens = scanner(src);
  let ast = parser(tokens, src);
  ast = transformer(ast);
  let js = generator(ast);
  return js;
}

module.exports = compiler;

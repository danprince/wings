let scanner = require("./scanner");
let parser = require("./parser");
let generator = require("./generator");

function compiler(src) {
  let tokens = scanner(src);
  let ast = parser(tokens, src);
  let js = generator(ast);
  return js;
}

module.exports = compiler;

let fs = require("fs");
let compiler = require("./compiler");

function compile(path) {
  let src = fs.readFileSync(path, "utf8");
  let js = compiler(src);
  return js;
}

module.exports = {
  compile
}

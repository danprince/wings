let generator = require("./generator");

function flip(...args) {
  return {
    type: "CallExpression",
    body: args.reverse()
  }
}

module.exports = {
  flip
}

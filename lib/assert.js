function nodeType(node, type, message) {
  if (node.type !== type) {
    throw new SyntaxError(message);
  }
}

module.exports = {
  nodeType
};

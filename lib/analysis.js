function isNumber(char) {
  return char && /[0-9]/.test(char);
}

function isValidIdentifierCharacter(char) {
  return char && /[a-zA-Z*/+=_$?\-.]/.test(char);
}

function isWhiteSpace(char) {
  return /[\s\n]/.test(char);
}

module.exports = {
  isNumber,
  isValidIdentifierCharacter,
  isWhiteSpace
}

let nodes = {
  Program(program) {
    return `
// Generated from Wings Lisp

${program.body.map(printer).join(";\n")}
`;
  },

  RawExpression(expr) {
    return expr.value;
  },

  CallExpression(node) {
    let callee = printer(node.callee);
    let args = node.args.map(printer);
    return `${callee}(${args.join(", ")})`;
  },

  ListLiteral(node) {
    let elements = node.elements.map(printer);
    return `[${elements.join(", ")}]`;
  },

  ObjectLiteral(node) {
    let properties = node.properties.map(prop =>
      `"${prop.key.name}": ${printer(prop.value)}`
    );
    let merges = node.merges.map(printer);
    let literal = `{${properties.join(",")}}`;

    if (merges.length > 0) {
      return `Object.assign({}, ${merges.join(", ")}, ${literal})`;
    } else {
      return literal;
    }
  },

  NumberLiteral(node) {
    return node.value;
  },

  StringLiteral(node) {
    return node.value;
  },

  Identifier(node) {
    return node.name
      .replace(/-/g, "_")
      .replace(/\?/g, "");
  },

  RegexLiteral(node) {
    return node.value;
  },

  ImportStatement(node) {
    let { name, path } = node;

    if (name === "*") {
      return `Object.assign(global, require(${path}));`;
    } else {
      return `var ${name} = require(${path})`;
    }
  },

  ExportStatement(node) {
    return node.exports
      .map(name => `exports.${name} = ${name}`)
      .join(";\n");
  },

  VariableAssignment(node) {
    let name = node.name;
    let value = printer(node.value);
    return `var ${node.name} = ${value}`;
  },

  FunctionDeclaration(node) {
    let name = node.name;
    let params = node.parameters.map(printer);
    let body = node.body.map(printer);
    let returns = body.pop();
    let contents = [...body, `return ${returns};`];
    return (
      `function ${name}(${params.join(",")}) {\n  ${contents.join(";\n  ")}\n}`
    );
  },

  DoExpression(node) {
    let body = node.body.map(printer);
    return `(${body.join(", ")})`;
  },

  IfExpression(node) {
    let condition = printer(node.condition);
    let trueBranch = printer(node.trueBranch);
    let falseBranch = printer(node.falseBranch);
    return `(${condition}) \n  ? (${trueBranch}) \n  : (${falseBranch})`;
  },

  MultiplicationOperator(node) {
    let args = node.args.map(printer);
    return args.join(" * ");
  },

  DivisionOperator(node) {
    let args = node.args.map(printer);
    return args.join(" / ");
  },

  AdditionOperator(node) {
    let args = node.args.map(printer);
    return args.join(" + ");
  },

  SubtractionOperator(node) {
    let args = node.args.map(printer);
    return args.join(" - ");
  },

  AndOperator(node) {
    let args = node.args.map(printer);
    return args.join(" && ");
  },

  OrOperator(node) {
    let args = node.args.map(printer);
    return args.join(" || ");
  },

  EqualsOperator(node) {
    let [lhs, rhs] = node.args.map(printer);
    return `${lhs} === ${rhs}`;
  },

  NotEqualsOperator(node) {
    let [lhs, rhs] = node.args.map(printer);
    return `${lhs} === ${rhs}`;
  },

  GreaterThanOperator(node) {
    let [lhs, rhs] = node.args.map(printer);
    return `${lhs} > ${rhs}`;
  },

  LessThanOperator(node) {
    let [lhs, rhs] = node.args.map(printer);
    return `${lhs} < ${rhs}`;
  },

  GreaterThanOrEqualOperatorOperator(node) {
    let [lhs, rhs] = node.args.map(printer);
    return `${lhs} >= ${rhs}`;
  },

  LessThanOrEqualOperator(node) {
    let [lhs, rhs] = node.args.map(printer);
    return `${lhs} <= ${rhs}`;
  }
};

function printer(ast) {
  if (ast.type in nodes) {
    return nodes[ast.type](ast);
  } else {
    throw new Error(`Can't generate ${ast.type}`);
  }
}

module.exports = printer;

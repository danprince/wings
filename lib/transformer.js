let assert = require("assert");

let nodes = {
  Program(node) {
    let body = node.body.map(transformer);
    return { type: "Program", body };
  },

  CallExpression(node) {
    let [callee, ...args] = node.body;

    if (callee.name === "import") {
      let name = args[0];
      let path = args[2];
      assert(name.type === "Identifier");
      assert(path.type === "StringLiteral");
      return { type: "ImportStatement", name, path };
    }

    if (callee.name === "export") {
      return {
        type: "ExportStatement",
        exports: args.map(arg => arg.name)
      };
    }

    if (callee.name === "def") {
      let [name, value] = args;

      return {
        type: "VariableAssignment",
        name: name.name,
        value: transformer(value)
      };
    }

    if (callee.name === "fun") {
      let [name, params, ...body] = args;

      return {
        type: "FunctionDeclaration",
        name: name.name,
        parameters: params.elements.map(transformer),
        body: body.map(transformer)
      };
    }

    if (callee.name === "do") {
      let body = args.map(transformer);
      return { type: "DoExpression", body };
    }

    if (callee.name === "if") {
      let [condition, trueBranch, falseBranch] = args;

      return {
        type: "IfExpression",
        condition: transformer(condition),
        trueBranch: transformer(trueBranch),
        falseBranch: transformer(falseBranch)
      };
    }

    if (callee.name === "when") {
      let [condition, trueBranch] = args;

      return {
        type: "IfExpression",
        condition: transformer(condition),
        trueBranch: transformer(trueBranch),
        falseBranch: { type: "RawExpression", value: "undefined" }
      };
    }

    if (callee.name === "cond") {
      let conditions = [];

      while (args.length > 0) {
        let clause = args.shift();
        let then = args.shift();

        conditions.push({
          clause: transformer(clause),
          condition: transformer(condition)
        });
      }

      // TODO: Not sure which JS structure to convert to
      return { type: "" };
    }

    if (callee.name === "case") {
      let cases = [];
      let value = args.shift();

      while (args.length > 0) {
        let compare = args.shift();
        let then = args.shift();

        cases.push({
          compare: transformer(compare),
          then: transformer(then)
        });
      }

      return {
        type: "CaseStatement",
        value: transformer(value),
        cases
      };
    }

    if (callee.name === "match") {
      let value = args.shift();
      let cases = [];

      while (args.length > 0) {
        let pattern = args.shift();
        let returns = args.shift();

        cases.push({
          pattern: transformer(pattern),
          returns: transformer(returns)
        });
      }

      return {
        type: "MatchExpression",
        value: transformer(value),
        cases
      };
    }

    if (callee.name === "*") {
      return { type: "MultiplicationOperator", args: args.map(transformer) };
    }

    if (callee.name === "/") {
      return { type: "DivisionOperator", args: args.map(transformer) };
    }

    if (callee.name === "+") {
      return { type: "AdditionOperator", args: args.map(transformer) };
    }

    if (callee.name === "-") {
      return { type: "SubtractionOperator", args: args.map(transformer) };
    }

    if (callee.name === "and") {
      return { type: "AndOperator", args: args.map(transformer) };
    }

    if (callee.name === "or") {
      return { type: "OrOperator", args: args.map(transformer) };
    }

    if (callee.name === "=") {
      return { type: "EqualsOperator", args: args.map(transformer) };
    }

    if (callee.name === "!=") {
      return { type: "NotEqualsOperator", args: args.map(transformer) };
    }

    if (callee.name === ">") {
      return { type: "GreaterThanOperator", args: args.map(transformer) };
    }

    if (callee.name === "<") {
      return { type: "LessThanOperator", args: args.map(transformer) };
    }

    if (callee.name === ">=") {
      return { type: "GreaterThanOrEqualOperator", args: args.map(transformer) };
    }

    if (callee.name === "<=") {
      return { type: "LessThanOrEqualOperator", args: args.map(transformer) };
    }

    return {
      type: "CallExpression",
      callee: transformer(callee),
      args: args.map(transformer)
    };
  },

  ObjectLiteral(node) {
    return {
      type: "ObjectLiteral",
      properties: node.properties.map(prop => ({
        key: prop.key.name,
        value: transformer(prop.value)
      })),
      merges: node.merges.map(transformer)
    };
  },

  ListLiteral(node) {
    return {
      type: "ListLiteral",
      elements: node.elements.map(transformer)
    };
  },

  NumberLiteral(node) {
    return {
      type: "NumberLiteral",
      value: node.value
    }
  },

  StringLiteral(node) {
    return {
      type: "StringLiteral",
      value: node.value
    }
  },

  Identifier(node) {
    return { type: "Identifier", name: node.name };
  },

  RegexLiteral(node) {
    return { type: "RegexLiteral", value: node.value };
  }
};

function transformer(node) {
  if (node.type in nodes) {
    return nodes[node.type](node);
  } else {
    throw new Error(`Can't transform ${node.type}`);
  }
}

module.exports = transformer;

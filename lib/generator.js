let macros = require("./macros");

function generator(ast) {
  let nodes = {
    Program(program) {
      return `
// Generated from Wings Lisp

${program.body.map(generator).join(";\n")}
`;
    },
    RawExpression(expr) {
      return expr.value;
    },
    CallExpression(expr) {
      let [callee, ...args] = expr.body;

      if (callee.name in macros) {
        let macro = macros[callee.name];
        let newExpr = macro(...args);
        return generator(newExpr);
      }

      if (callee.name === "import") {
        let name = generator(args[0]);
        let path = generator(args[2]);

        if (name === "*") {
          return `Object.assign(global, require(${path}));`;
        } else {
          return `var ${name} = require(${path})`;
        }
      }

      // TODO: Most of these can probably become macros

      if (callee.name === "export") {
        let exports = args.map(generator);
        return exports.map(name => `exports.${name} = ${name}`).join(";\n");
      }

      if (callee.name === "def") {
        let name = generator(args[0]);
        let value = generator(args[1]);
        return `var ${name} = ${value}`;
      }

      if (callee.name === "fun") {
        let name = generator(args[0]);
        let params = args[1].elements.map(generator);
        let body = args.slice(2, -1).map(generator);
        let ret = generator(args[args.length - 1]);

        return `function ${name}(${params.join(", ")}) {\n ${body.join(";\n")}\n return ${ret};\n}`;
      }

      if (callee.name === "fn") {
        let params = args[0].elements.map(generator);
        let body = args.slice(1).map(generator);

        return `function (${params.join(", ")}) {\n  return ${body.join(",\n")};\n}`;
      }

      if (callee.name === "do") {
        let exprs = args.map(generator);
        return `(${exprs.join(",\n")})`;
      }

      if (callee.name === "if") {
        let condition = generator(args[0]);
        let trueBranch = generator(args[1]);
        let falseBranch = generator(args[2]);
        return `(${condition}) \n  ? (${trueBranch}) \n  : (${falseBranch})`;
      }

      if (callee.name === "when") {
        let condition = generator(args[0]);
        let result = generator(args[1]);
        let otherwise = "undefined";
        return `((${condition}) ? ${result} : ${otherwise})`;
      }

      if (callee.name === "cond") {
        let conditions = [];

        while (args.length > 0) {
          let clause = generator(args.shift());
          let then = generator(args.shift());
          conditions.push({ clause, then });
        }

        return `
          (${conditions.map((cond => {
            return `${cond.clause} && ${cond.then}`
          })).join(",\n")})
        `;
      }

      if (callee.name === "case") {
        let cases = [];
        let value = generator(args.shift());

        while (args.length > 0) {
          let compare = generator(args.shift());
          let then = generator(args.shift());
          cases.push({ compare, then });
        }

        return `
          (${cases.map((c => {
            return `${value} === ${c.compare} && ${c.then}`
          })).join(",\n")})
        `;
      }

      if (callee.name === "*") {
        return args.map(generator).join(" * ");
      }

      if (callee.name === "/") {
        return args.map(generator).join(" / ");
      }

      if (callee.name === "+") {
        return args.map(generator).join(" + ");
      }

      if (callee.name === "-") {
        return args.map(generator).join(" - ");
      }

      if (callee.name === "and") {
        return args.map(generator).join(" && ");
      }

      if (callee.name === "or") {
        return args.map(generator).join(" || ");
      }

      if (callee.name === "=") {
        return `${generator(args[0])} === ${generator(args[1])}`;
      }

      if (callee.name === "!=") {
        return `${generator(args[0])} !== ${generator(args[1])}`;
      }

      if (callee.name === ">") {
        return `${generator(args[0])} > ${generator(args[1])}`;
      }

      if (callee.name === "<") {
        return `${generator(args[0])} < ${generator(args[1])}`;
      }

      if (callee.name === ">=") {
        return `${generator(args[0])} >= ${generator(args[1])}`;
      }

      if (callee.name === "<=") {
        return `${generator(args[0])} <= ${generator(args[1])}`;
      }

      return `${generator(callee)}(${args.map(generator).join(", ")})`;
    },
    ListLiteral(expr) {
      return `[${expr.elements.map(generator).join(", ")}]`;
    },
    ObjectLiteral(expr) {
      let literal = `{${expr.properties.map(prop =>
        `"${prop.key.name}": ${generator(prop.value)}`
      ).join(", ")}}`;

      if (expr.merges.length > 0) {
        return `Object.assign({}, ${expr.merges.map(generator).join(", ")}, ${literal})`;
      } else {
        return literal;
      }
    },
    NumberLiteral(expr) {
      return expr.value;
    },
    StringLiteral(expr) {
      return expr.value;
    },
    Identifier(expr) {
      return expr.name
        .replace(/-/g, "_")
        .replace(/\?/g, "");
    },
    RegexLiteral(expr) {
      return expr.value;
    },
    KeywordLiteral(expr) {
      return `"${expr.value.replace(/-/g, "_").replace(/\?/g, "")}"`;
    }
  };

  if (ast.type in nodes) {
    return nodes[ast.type](ast);
  } else {
    throw new Error(`Can't generate ${ast.type}`);
  }
}

module.exports = generator;

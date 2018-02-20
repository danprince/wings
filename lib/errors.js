let chalk = require("chalk");

function SyntaxError({ node, message, description, src }) {
  console.log(chalk.red(message));
  console.log();

  if (description) {
    console.log(`${description}\n`);
  }

  if (node) {
    let rows = src.split("\n").map((line, row) => {
      return line.split("").map((char, col) => {
        if (
          row + 1 >= node.start.row &&
          col + 1 >= node.start.col &&
          row < node.end.row &&
          col < node.end.col
        ) {
          return chalk.red.underline(char);
        } else {
          return char;
        }
      }).join("");
    });

    let start = Math.max(1, node.start.row - 2);
    let end = Math.min(rows.length - 1, node.end.row + 2);


    for (let row = start; row <= end; row++) {
      console.log(`${chalk.blue(`${row} |`)} ${rows[row - 1]}`);
    }

    console.log();
  }

  process.exit(1);
}

module.exports = {
  SyntaxError
}

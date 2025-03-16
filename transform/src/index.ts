import { Parser } from "assemblyscript/dist/assemblyscript.js";
import { SimpleParser, TransformVisitor } from "visitor-as/dist/index.js";

const entrypointFunctionText = `

export function barbaz(): i32 {
  return 42;
}
`;
// const entrypointFunctionText = `
// export const KlineArray_ID = idof<StaticArray<Kline>>();

// export function setKline(
//   klines: StaticArray<Kline>,
//   index: i32,
//   timestamp: i64,
//   open: f64,
//   close: f64,
//   low: f64,
//   high: f64,
//   volume: f64
// ): void {
//   klines[index] = new Kline(timestamp, open, close, low, high, volume);
// }

// export function entrypoint(klines: StaticArray<Kline>, len: i32): i32 {
//   if (len === 0) {
//     return 0;
//   }
//   return screener(klines.slice(0, len));
// }
// `;

class EntrypointTransformer extends TransformVisitor {
  afterParse(parser: Parser): void {
    const sources = parser.sources;

    sources.forEach((source) => {
      if (!source.text) return;

      if (source.simplePath === "screener") {
        // Add an entrypoint function to the module
        // Parse the entrypoint function text into an AST node
        const entrypointFunction = SimpleParser.parseTopLevelStatement(
          entrypointFunctionText
        );

        // Add the entrypoint function to the source file
        source.statements.push(entrypointFunction);
      }

      this.visit(source);
    });
  }
}

export default EntrypointTransformer;

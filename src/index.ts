#!/usr/bin/env node

import * as fs from "fs/promises";
import readline from "readline";
import * as z from "zod";
import loader from "@assemblyscript/loader";

const KlineSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  close: z.number(),
  low: z.number(),
  high: z.number(),
  volume: z.number(),
});

export type Kline = z.infer<typeof KlineSchema>;

export interface ModuleExports {
  memory: WebAssembly.Memory;
  __pin: (ptr: number) => number;
  __unpin: (ptr: number) => void;
  __collect: () => void;
  __new: (size: number, id: number) => number;
  __newArray: <T>(id: number, arr: T[]) => number;
  __getArrayView: (arr: number) => unknown;
  entrypoint: (rawData: number) => number;
  StaticArray_ID: number;
}

async function main() {
  if (process.argv.length < 4) {
    throw new Error("Usage: node dist/index.js <screenerPath> <dataPath> [depth]");
  }
  const [screenerPath, klinesPath] = process.argv.slice(2);

  const maxDepth = parseInt(process.argv[4] || "1", 10);
  if (isNaN(maxDepth) || maxDepth <= 0) {
    throw new Error("Usage: node dist/index.js <screenerPath> <dataPath> [depth]");
  }

  const wasmBuffer = await fs.readFile(screenerPath);

  const fileStream = await fs.open(klinesPath);
  const rl = readline.createInterface({
    input: fileStream.createReadStream(),
    crlfDelay: Infinity,
  });

  const KlineDataSchema = z.object({
    id: z.string(),
    data: z.array(z.array(z.number()).min(7)),
  });

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      const data = KlineDataSchema.parse(parsed);
      const { id } = data;
      const klines: Kline[] = data.data.map((arr) => {
        return {
          timestamp: arr[0],
          open: arr[1],
          high: arr[2],
          low: arr[3],
          close: arr[4],
          volume: arr[6],
        };
      });

      console.log(id);
      for (let i = 0; i < Math.min(maxDepth, klines.length); i++) {
        const timestamp = klines[0].timestamp;

        const result = await analyzeKlines(wasmBuffer, klines);

        console.log(" *", new Date(timestamp * 1000), result);
      }
    } catch (e) {
      console.error("Error processing line:", e);
    }
  }
}

// Check each required export is present
function checkRequiredExport(exports: WebAssembly.Exports, prop: string): void {
  if (!exports[prop]) {
    throw new Error(`Required WASM export missing: ${prop}`);
  }
}

async function analyzeKlines(wasmBuffer: BufferSource, klines: Kline[]): Promise<number> {
  let __getString: any;

  const imports = {
    env: {
      abort(msg: number, file: number, line: number, column: number) {
        console.error("abort called at index.ts:" + line + ":" + column);
      },
    },
    log: {
      debug: (msg: number) => {
        console.debug(`DBG: ${(msg && __getString(msg)) || msg}`);
      },
      info: (msg: number) => {
        console.log(`INFO: ${(msg && __getString(msg)) || msg}`);
      },
      warn: (msg: number) => {
        console.warn(`WARN: ${(msg && __getString(msg)) || msg}`);
      },
      error: (msg: number) => {
        console.error(`ERR: ${(msg && __getString(msg)) || msg}`);
      },
    },
  };

  const wasmModule = await loader.instantiate(wasmBuffer, imports);
  const exports = wasmModule.instance.exports;
  __getString = wasmModule.exports.__getString;

  checkRequiredExport(exports, "entrypoint");
  checkRequiredExport(exports, "StaticArray_ID");

  const { __pin, __unpin, __collect, __newArray } = wasmModule.exports as unknown as ModuleExports;
  const { entrypoint, StaticArray_ID } = exports as unknown as ModuleExports;

  // Create flat array of raw data
  const rawData: number[] = [];
  for (const k of klines) {
    rawData.push(Number(k.timestamp), k.open, k.high, k.low, k.close, k.volume);
  }

  // Create StaticArray in WASM memory
  const arrayPtr = __newArray(StaticArray_ID, rawData);
  const pinnedPtr = __pin(arrayPtr);

  // Pass raw data array and length (number of klines)
  const result = entrypoint(pinnedPtr);

  // Cleanup
  __unpin(pinnedPtr);
  __collect();

  return result;
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

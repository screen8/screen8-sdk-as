#!/usr/bin/env node

import * as fs from 'fs/promises'
import readline from 'readline'
import * as z from 'zod'

const KlineSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  close: z.number(),
  low: z.number(),
  high: z.number(),
  volume: z.number()
})

export type Kline = z.infer<typeof KlineSchema>

export interface ModuleExports {
  memory: WebAssembly.Memory
  __pin: (ptr: number) => number
  __unpin: (ptr: number) => void
  __collect: () => void
  __new: (size: number, id: number) => number
  __newArray: <T>(id: number, arr: T[]) => number
  KlineArray_ID: number
  setKline: (
    arr: number,
    index: number,
    timestamp: bigint,
    open: number,
    close: number,
    low: number,
    high: number,
    volume: number
  ) => void
  default: (arr: number, length: number) => number
}

async function main() {
  if (process.argv.length < 4) {
    throw new Error('Usage: node dist/index.js <screenerPath> <dataPath> [depth]')
  }
  const [screenerPath, klinesPath] = process.argv.slice(2)

  const maxDepth = parseInt(process.argv[4] || '1', 10)
  if (isNaN(maxDepth) || maxDepth <= 0) {
    throw new Error('Usage: node dist/index.js <screenerPath> <dataPath> [depth]')
  }

  const wasmBuffer = await fs.readFile(screenerPath)

  const fileStream = await fs.open(klinesPath)
  const rl = readline.createInterface({
    input: fileStream.createReadStream(),
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line)
      const KlineDataSchema = z.object({
        symbol: z.string(),
        interval: z.string(),
        klines: z.array(z.tuple([
          z.number(), // timestamp
          z.number(), // open
          z.number(), // close
          z.number(), // high
          z.number(), // low
          z.number(), // volume
        ]))
      })
      const data = KlineDataSchema.parse(parsed)
      const { symbol, interval } = data
      const klines: Kline[] = data.klines.map(arr => {
        return {
          timestamp: arr[0],
          open: arr[1],
          close: arr[2],
          low: arr[3],
          high: arr[4],
          volume: arr[5],
        }
      })

      const results: Record<number, number> = {}
      for (let i = 0; i < Math.min(maxDepth, klines.length); i++) {
        const subklines = klines.slice(i, i + 100)
        const timestamp = subklines[0].timestamp

        // console.debug(symbol, interval, new Date(timestamp*1000), subklines.length, subklines[0].open)
        const result = await analyzeKlines(wasmBuffer, subklines)

        if (result > 0) {
          results[timestamp] = result
        }
      }
      if (Object.keys(results).length > 0) {
        console.log(symbol, interval)
        console.log(Object.keys(results).map(t => new Date(Number(t) * 1000)))
      }
    } catch (e) {
      console.error('Error processing line:', e)
    }
  }
}

// Check each required export is present
function checkRequiredExport(exports: WebAssembly.Exports, prop: string): void {
  if (!exports[prop]) {
    throw new Error(`Required WASM export missing: ${prop}`)
  }
}

async function analyzeKlines(wasmBuffer: BufferSource, klines: Kline[]): Promise<number> {
  const env = {
    abort(_msg: string, _file: string, line: number, column: number) {
      console.error("abort called at index.ts:" + line + ":" + column)
    },
  }

  const wasmModule = await WebAssembly.instantiate(wasmBuffer, { env })
  const exports = wasmModule.instance.exports

  // Verify all required exports
  checkRequiredExport(exports, '__new')
  checkRequiredExport(exports, '__pin')
  checkRequiredExport(exports, '__unpin')
  checkRequiredExport(exports, '__collect')
  checkRequiredExport(exports, 'KlineArray_ID')
  checkRequiredExport(exports, 'setKline')
  checkRequiredExport(exports, 'default')

  const { __new, __pin, __unpin, __collect, KlineArray_ID, setKline, default: main } = exports as unknown as ModuleExports

  const arrayPtr = __pin(__new(klines.length * 4, KlineArray_ID))

  let result = 0

  try {
    klines.forEach((kline, index) => {
      setKline(
        arrayPtr,
        index,
        BigInt(kline.timestamp),
        kline.open,
        kline.close,
        kline.low,
        kline.high,
        kline.volume,
      )
    })
    result = main(arrayPtr, klines.length)
  } catch (e) {
    console.error(e)
  } finally {
    __unpin(arrayPtr)
    __collect()
  }
  return result
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})

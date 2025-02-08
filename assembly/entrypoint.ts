import { Kline } from "./types"

// The ID of the StaticArray<Kline> type.
export const KlineArray_ID = idof<StaticArray<Kline>>()

// Initializes a new Kline struct at the given index in the array.
export function setKline(
  klines: StaticArray<Kline>,
  index: i32,
  timestamp: i64,
  open: f64,
  close: f64,
  low: f64,
  high: f64,
  volume: f64
): void {
  klines[index] = new Kline(timestamp, open, close, low, high, volume)
}

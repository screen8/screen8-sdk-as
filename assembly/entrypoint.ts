import { Kline } from "./types";

// The ID of the StaticArray<Kline> type.
export const KlineArray_ID = idof<StaticArray<Kline>>();

// The ID of the StaticArray<f64> type.
export const StaticArray_ID = idof<StaticArray<f64>>();

// Creates an array of Kline structs from a StaticArray<f64> of data.
// The data array should be in the following order: timestamp, open, high, low, close, volume.
// The length of the data array should be 6 times the number of Kline structs.
// Returns an array of Kline structs.
export function createKlines(data: StaticArray<f64>): Kline[] {
  const length = data.length / 6;
  const klines = new Array<Kline>(length);
  for (let i = 0; i < length; i++) {
    const offset = i * 6;
    klines[i] = new Kline(
      i64(data[offset]), // timestamp
      data[offset + 1], // open
      data[offset + 2], // high
      data[offset + 3], // low
      data[offset + 4], // close
      data[offset + 5] // volume
    );
  }
  return klines;
}

import { Kline, BollingerBands } from "./types";

// Highest
export function highest(data: f64[], length: i32): f64 {
  if (data.length === 0 || length <= 0) {
    return 0;
  }

  return data.slice(0, length).reduce<f64>((min, val) => Math.max(val, min), data[0]);
}

// Lowest
export function lowest(data: f64[], length: i32): f64 {
  if (data.length === 0 || length <= 0) {
    return 0;
  }

  return data.slice(0, length).reduce<f64>((min, val) => Math.min(val, min), data[0]);
}

// Open
export function open(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => k.open);
}

// High
export function high(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => k.high);
}

// Low
export function low(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => k.low);
}

// Close
export function close(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => k.close);
}

// Volume
export function volume(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => k.volume);
}

// HLC3 - Average of High, Low, and Close
export function hlc3(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => (k.high + k.low + k.close) / 3);
}

// HL2 - Average of High and Low
export function hl2(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => (k.high + k.low) / 2);
}

// OHLC4 - Average of Open, High, Low, and Close
export function ohlc4(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => (k.open + k.high + k.low + k.close) / 4);
}

// HLCC4 - Average of High, Low, and twice the Close
export function hlcc4(klines: Kline[], limit: i32 = klines.length): f64[] {
  return klines.slice(0, limit).map<f64>((k) => (k.high + k.low + k.close + k.close) / 4);
}

// SMA (Simple Moving Average)
export function sma(source: f64[], length: i32, limit: i32 = source.length): f64[] {
  const result: f64[] = [];
  for (let i = 0; i < Math.min(limit, source.length); i++) {
    result.push(smaValue(source.slice(i), length));
  }
  return result;
}

export function smaValue(source: f64[], length: i32): f64 {
  const slicedData = source.slice(0, length);
  const sum = slicedData.reduce<f64>((acc, val) => acc + val, 0);
  return sum / length;
}

// Standard Deviation
export function stdev(source: f64[], length: i32, limit: i32 = source.length): f64[] {
  const result: f64[] = [];
  for (let i = 0; i < Math.min(limit, source.length); i++) {
    result.push(stdevValue(source.slice(i), length));
  }
  return result;
}

export function stdevValue(source: f64[], length: i32): f64 {
  const slicedData = source.slice(0, length);
  const avg = sma(slicedData, length, 1);
  let sumOfSquareDeviations: f64 = 0;
  for (let j = 0; j < slicedData.length; j++) {
    const diff = slicedData[j] - avg[0];
    sumOfSquareDeviations += diff * diff;
  }
  return Math.sqrt(sumOfSquareDeviations / length);
}

// Bollinger Bands
export function bb(
  source: f64[],
  length: i32,
  mult: f64,
  limit: i32 = source.length
): BollingerBands[] {
  const result: BollingerBands[] = [];
  for (let i = 0; i < Math.min(limit, source.length); i++) {
    result.push(bbValue(source.slice(i), length, mult));
  }
  return result;
}

export function bbValue(source: f64[], length: i32, mult: f64): BollingerBands {
  const basis = smaValue(source, length);
  const dev = mult * stdevValue(source, length);
  return new BollingerBands(basis, basis + dev, basis - dev);
}

// Bollinger Bands Width
export function bbw(source: f64[], length: i32, mult: f64, limit: i32 = source.length): f64[] {
  const result: f64[] = [];
  for (let i = 0; i < Math.min(limit, source.length); i++) {
    result.push(bbwValue(source.slice(i), length, mult));
  }
  return result;
}

export function bbwValue(source: f64[], length: i32, mult: f64): f64 {
  const basis = smaValue(source, length);
  const dev = mult * stdevValue(source, length);
  return (100 * (basis + dev - (basis - dev))) / basis;
}

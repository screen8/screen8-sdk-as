import { Kline } from "../types";

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

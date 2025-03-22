import { BollingerBands } from "../types";

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

// Relative Strength Index (RSI)
export function rsi(source: f64[], length: i32, limit: i32 = source.length): f64[] {
  const result: f64[] = [];
  for (let i = 0; i < Math.min(limit, source.length); i++) {
    result.push(rsiValue(source.slice(i), length));
  }
  return result;
}

export function rsiValue(source: f64[], length: i32): f64 {
  if (source.length <= length) {
    return 50.0; // Default value when not enough data
  }

  let gainSum: f64 = 0.0;
  let lossSum: f64 = 0.0;

  // First calculate initial averages
  // Note: source[0] is today, source[1] is yesterday, etc.
  for (let i = 0; i < length; i++) {
    if (i + 1 >= source.length) break;
    const change = source[i] - source[i + 1];
    if (change > 0) {
      gainSum += change;
    } else {
      lossSum += Math.abs(change);
    }
  }

  let avgGain = gainSum / length;
  let avgLoss = lossSum / length;

  // Calculate smoothed averages for remaining periods
  for (let i = length; i < source.length - 1; i++) {
    const change = source[i] - source[i + 1];
    let currentGain = 0.0;
    let currentLoss = 0.0;

    if (change > 0) {
      currentGain = change;
    } else {
      currentLoss = Math.abs(change);
    }

    avgGain = (avgGain * (length - 1) + currentGain) / length;
    avgLoss = (avgLoss * (length - 1) + currentLoss) / length;
  }

  if (avgLoss === 0) {
    return 100.0;
  }

  const rs = avgGain / avgLoss;
  return 100.0 - 100.0 / (1.0 + rs);
}

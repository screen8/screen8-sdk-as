import { BollingerBands } from "./types"

// Highest value
export const highest = (data: f64[], length: i32): f64 => {
  return data.length === 0 ? 0 : data
    .slice(0, length)
    .reduce<f64>((min, val) => Math.max(val, min), data[0])
}

// Lowest value
export const lowest = (data: f64[], length: i32): f64 => {
  return data.length === 0 ? 0 : data
    .slice(0, length)
    .reduce<f64>((min, val) => Math.min(val, min), data[0])
}

// Simple Moving Average
export const sma = (data: f64[], length: i32): f64 => {
  return data
    .slice(0, length)
    .reduce<f64>((acc, val) => acc + val, 0) / length
}

// Standard Deviation
export const stdev = (data: f64[], length: i32): f64 => {
  // avg = ta.sma(src, length)
  // sumOfSquareDeviations = 0.0
  // for i = 0 to length - 1
  //     sum = SUM(src[i], -avg)
  //     sumOfSquareDeviations := sumOfSquareDeviations + sum * sum
  // stdev = math.sqrt(sumOfSquareDeviations / length)
  const avg = sma(data, length);
  let sumOfSquareDeviations: f64 = 0;
  for (let i = 0; i < length; i++) {
    const sum = data[i] - avg;
    sumOfSquareDeviations += sum * sum;
  }
  return Math.sqrt(sumOfSquareDeviations / length);
}

// Bollinger Bands
export const bb = (data: f64[], length: i32, mult: f64): BollingerBands => {
  // float basis = ta.sma(src, length)
  // float dev = mult * ta.stdev(src, length)
  // [basis, basis + dev, basis - dev]

  // const slicedData = data.slice(0, length);
  // const squaredDiffs = slicedData.map(val => Math.pow(val - smaValue, 2));
  // const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / length);
  const basis = sma(data, length);
  const dev = mult * stdev(data, length);
  // return { sma: basis, bbUp: basis + dev, bbDown: basis - dev };
  return new BollingerBands(basis, basis + dev, basis - dev);
};


// Bollinger Bands Width
export const bbw = (data: f64[], length: i32, mult: number): f64[] => {
  const result: f64[] = [];
  for (let i = 0; i < data.length; i++) {
    const slicedData = data.slice(i, i + length);
    const smaValue = sma(slicedData, length);

    let sumOfSquaredDiffs: f64 = 0;
    for (let j = 0; j < slicedData.length; j++) {
      const diff = slicedData[j] - smaValue;
      sumOfSquaredDiffs += diff * diff;
    }
    const stdDev = Math.sqrt(sumOfSquaredDiffs / length);
    const dev = mult * stdDev;

    result.push(((smaValue + dev) - (smaValue - dev)) / smaValue);
  }
  return result;
}

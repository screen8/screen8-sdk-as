import { Kline, StaticArray_ID, createKlines, log, ta } from "../assembly";

export function entrypoint(data: StaticArray<f64>): i32 {
  const klines = createKlines(data);

  const source = ta.hlc3(klines);
  const sma = ta.sma(source, 60);
  const stdev = ta.stdev(source, 60);
  const bbw = ta.bbw(source, 60, 2);

  log.info(`TIMESTAMP,SOURCE,SMA,STDEV,BBW`);
  for (let i = 0; i < klines.length; i++) {
    // const date = new Date(klines[i].timestamp * 1000);
    // const formattedDate = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    log.info(`${klines[i].timestamp},${source[i]},${sma[i]},${stdev[i]},${bbw[i]}`);
  }

  return score(klines[0]);
}

function score(kline: Kline): i32 {
  return i32(1000 * percentChange(kline));
}

function percentChange(kline: Kline): f64 {
  return (100 * (kline.close - kline.open)) / kline.open;
}

export { StaticArray_ID };

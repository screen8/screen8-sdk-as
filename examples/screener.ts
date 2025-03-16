import { Kline, log, ta } from "../assembly";

export const StaticArray_ID = idof<StaticArray<f64>>();

function createKlines(data: StaticArray<f64>): Kline[] {
  const length = data.length / 6;
  const klines = new Array<Kline>(length);
  for (let i = 0; i < length; i++) {
    const offset = i * 6;
    klines[i] = new Kline(
      i64(data[offset]), // timestamp
      data[offset + 1], // open
      data[offset + 2], // close
      data[offset + 3], // low
      data[offset + 4], // high
      data[offset + 5] // volume
    );
  }
  return klines;
}

export function entrypoint(data: StaticArray<f64>): i32 {
  const klines = createKlines(data);

  const kline = klines[0];
  // log.debug(
  //   `open: ${kline.open} close: ${kline.close} low: ${kline.low} high: ${kline.high} volume: ${kline.volume}`
  // );


  const source = ta.hlc3(klines);
  const sma = ta.sma(source, 60);
  const stdev = ta.stdev(source, 60);
  const bbw = ta.bbw(source, 60, 2);

  for (let i = 0; i < klines.length; i++) {
    const date = new Date(klines[i].timestamp*1000);
    const formattedDate = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`;
    // log.debug(`SMA60 ${formattedDate} | ${sma[i]}`);
    // log.debug(`STDEV50 ${formattedDate} | ${stdev[i]}`);
    // log.debug(`HLC3 ${formattedDate} | ${source[i]}`);
    log.debug(`BBW ${formattedDate} | ${bbw[i]}`);
    // log.info(`${klines[i].timestamp},${source[i]},${sma[i]},${stdev[i]}`);
  }


  return i32(kline.open);
}

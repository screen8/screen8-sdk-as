export class Kline {
  constructor(
    public timestamp: i64 = 0,  // 8 bytes
    public open: f64 = 0,       // 8 bytes
    public high: f64 = 0,       // 8 bytes
    public low: f64 = 0,        // 8 bytes
    public close: f64 = 0,      // 8 bytes
    public volume: f64 = 0,     // 8 bytes
  ) {}
}

export class BollingerBands {
  constructor(
    public basis: f64 = 0,
    public up: f64 = 0,
    public down: f64 = 0,
  ) { }
}

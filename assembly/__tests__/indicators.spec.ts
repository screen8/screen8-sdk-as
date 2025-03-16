import { Kline, ta } from "..";
import { describe, expect } from "./expect";

describe("Should serialize booleans", () => {
  const klines: Kline[] = [
    new Kline(1, 1, 1, 1, 1, 1),
    new Kline(2, 2, 2, 2, 2, 2),
    new Kline(3, 3, 3, 3, 3, 3),
  ];
  expect(ta.hlc3(klines, 1)).toBe([1]);
});

export function main(): void {}

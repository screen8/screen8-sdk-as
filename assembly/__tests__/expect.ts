export function describe(description: string, routine: () => void): void {
  routine();
}

export function expect<T>(left: T): Expectation<T> {
  return new Expectation(left);
}

class Expectation<T> {
  public left: T;

  constructor(left: T) {
    this.left = left;
  }
  toBe(right: T): void {
    if (this.left != right) {
      console.log(`  (expected) ->  ${right}`);
      console.log(`  (received) ->  ${this.left}`);
      process.exit(1);
    }
  }
}

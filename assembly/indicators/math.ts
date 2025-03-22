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

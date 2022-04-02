export function identity() {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

export function translate(i, [ tx, ty, tz ]) {
  return new Float32Array([
    i[0], i[1], i[2], i[3],
    i[4], i[5], i[6], i[7],
    i[8], i[9], i[10], i[11],
    tx, ty, tz, i[15],
  ]);
}
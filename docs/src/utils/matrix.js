export function matrixMult(a, b) {
  let ret = [];
  for (let i = 0; i < 9; i++)
    ret.push(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        ret[i * 3 + k] += a[i * 3 + j] * b[j * 3 + k];
      }
    }
  }
  return ret;
}
export function matrixAdd(a, b) {
  let ret = a;
  for (let i = 0; i < a.length; i++) {
    ret[i] += b[i];
  }
  return ret;
}

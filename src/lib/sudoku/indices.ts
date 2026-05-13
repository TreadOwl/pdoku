export const ROW_OF: readonly number[] = Array.from({ length: 81 }, (_, i) => Math.floor(i / 9))

export const COL_OF: readonly number[] = Array.from({ length: 81 }, (_, i) => i % 9)

export const BOX_OF: readonly number[] = Array.from({ length: 81 }, (_, i) => {
  const r = Math.floor(i / 9)
  const c = i % 9
  return Math.floor(r / 3) * 3 + Math.floor(c / 3)
})

export const ALL_DIGITS_MASK = 0b111111111

export const BIT_TO_COLOR: readonly number[] = (() => {
  const t = new Array<number>(513).fill(0)
  for (let i = 0; i < 9; i++) t[1 << i] = i + 1
  return t
})()

export function popcount9(x: number): number {
  let count = 0
  let v = x
  while (v !== 0) {
    v &= v - 1
    count++
  }
  return count
}

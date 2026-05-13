import type { Board, Color } from './types'
import { BOX_OF, COL_OF, ROW_OF } from './indices'

export function findConflictCells(board: Board, idx: number, color: Color): number[] {
  const r = ROW_OF[idx]
  const c = COL_OF[idx]
  const b = BOX_OF[idx]
  const conflicts: number[] = []
  for (let j = 0; j < 81; j++) {
    if (j === idx) continue
    if (board[j] !== color) continue
    if (ROW_OF[j] === r || COL_OF[j] === c || BOX_OF[j] === b) {
      conflicts.push(j)
    }
  }
  return conflicts
}

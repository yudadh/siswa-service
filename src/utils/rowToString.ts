import { CellValue } from "exceljs";

export function parseRowToStrings(values: CellValue[], startIndex = 1): string[] {
  return values.slice(startIndex).map(cell =>
    cell === null || cell === undefined ? '' : cell.toString().trim()
  )
}
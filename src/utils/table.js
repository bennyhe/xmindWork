/**
 * 给予row class
 * @param {*} param0 
 * @returns 
 */
export function tableRowClassName({ row }) {
  let cls = ''
  if (+row.type === 0) {
    cls += ' row-outgoings'
  } else if (+row.type === 1) {
    cls += ' row-incomes'
  }
  return cls
}
/**
 * 给予col class
 * @param {*} param0 
 * @returns 
 */
export function tableCellClassName({ row, column }) {
  return `col-${column.property}`
}
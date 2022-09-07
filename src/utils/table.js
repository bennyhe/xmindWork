/**
 * 给予row class
 * @param {*} param0 
 * @returns 
 */
export function tableRowClassName({ row }) {
  let cls = ''
  if (row.spId === 'summary') {
    cls += ' row-summary'
  }
  if (+row.type === 0 || (row.spId === 'summary' && row.valType === 'outgoings')) {
    cls += ' row-outgoings'
  } else if (+row.type === 1 || (row.spId === 'summary' && row.valType === 'incomes')) {
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
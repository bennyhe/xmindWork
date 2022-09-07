/**
 * 将输入的任意对象转换成 Date，如果装换失败将返回当前时间
 * silly-datetime组件，https://github.com/csbun/silly-datetime/blob/master/src/index.js
 * @param  {any} datetime 需要被格式化的时间
 * @return {Date}         转换好的 Date
 */
function getDateObject(datetime) {
  let t = datetime instanceof Date ? datetime : new Date(datetime)
  if (!t.getDate()) {
    t = new Date()
  }
  return t
}
/**
 * 格式化时间
 * silly-datetime组件，https://github.com/csbun/silly-datetime/blob/master/src/index.js
 * @param  {Date}   datetime  需要被格式化的时间
 * @param  {string} formatStr 格式化字符串，默认为 'YYYY-MM-DD HH:mm:ss'
 * @return {string}           格式化后的时间字符串
 */
export function formatTime(datetime, formatStr) {
  const t = getDateObject(datetime)
  let i = 0
  formatStr = formatStr || 'YYYY-MM-DD HH:mm:ss'
  const hours = t.getHours()
  const o = [
    ['M+', t.getMonth() + 1],
    ['D+', t.getDate()],
    // H 24小时制
    ['H+', hours],
    // h 12小时制
    ['h+', hours > 12 ? hours - 12 : hours],
    ['m+', t.getMinutes()],
    ['s+', t.getSeconds()]
  ]
  // 替换 Y
  if (/(Y+)/.test(formatStr)) {
    formatStr = formatStr.replace(RegExp.$1, (t.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  // 替换 M, D, H, h, m, s
  for (; i < o.length; i++) {
    if (new RegExp('(' + o[i][0] + ')').test(formatStr)) {
      formatStr = formatStr.replace(RegExp.$1, RegExp.$1.length === 1 ? o[i][1] : ('00' + o[i][1]).substr(('' + o[i][1]).length))
    }
  }
  // 替换 a/A 为 am, pm
  return formatStr.replace(/a/ig, hours > 11 ? 'pm' : 'am')
}

/**
 * 用来判断数据串是否存在
 * @param {*} path 
 * @param {*} parent 
 * @param {*} num 
 * @returns 
 */
export function get(path, parent, num) {
  if (typeof parent !== 'object') {
    parent = this
  }
  const pathArr = path.replace(/\[/g, '.')
    .replace(/\]/g, '')
    .split('.')
  const res = pathArr.reduce((o, k) => (o || {})[k], parent)
  if ((Array.isArray(res) && num)) {
    return res.length >= num ? res.slice(0, num) : undefined
  }
  return res
}

/**
 * 分割价格
 * @param {*} price 
 * @param {*} small 
 * @returns 
 */
export function splitPrice(price, pointSize = 2) {
  price = Number(price).toFixed(pointSize)
  if (price === 0) {
    return {
      value: 0,
      digit: 0
    }
  }
  const splitPirce = price.split('.')
  return {
    value: splitPirce[0],
    digit: +splitPirce[1] ? splitPirce[1] : null
  }
}

export function getDayOfTheMonthLastDay(datetime){
  const ti = datetime instanceof Date ? datetime : new Date(datetime)
  const thisYear = ti.getFullYear()
  const month = ti.getMonth() + 1
  const thisMonthDays = new Date(thisYear, month, 0)
  return thisMonthDays.getTime() - 1
}
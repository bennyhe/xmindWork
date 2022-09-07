import categoriesData from '../data/categories.js'
import billsData from '../data/bills.js'
const mApi = {
  /**
 * 查询类目
 */
  getCategories: () => {
    return new Promise((resolve, reject) => {
      const res = {
        code: 1,
        data: categoriesData
      }
      if (res.code) {
        resolve(res)
      } else {
        reject(res)
      }
    }).catch(err => {
      reject(err)
    })
  },
  /**
 * 查询账单
 */
  getBills: () => {
    return new Promise((resolve, reject) => {
      const res = {
        code: 1,
        data: billsData
      }
      if (res.code) {
        resolve(res)
      } else {
        reject(res)
      }
    }).catch(err => {
      reject(err)
    })
  },
  /**
 * 新增账单
 */
  addBills: param => {
    param = param || {}
    if (param.amount!=='' && param.time && param.category && param.type) {
      return new Promise((resolve, reject) => {
        const res = {
          code: 1,
          msg: '新增成功'
        }
        if (res.code) {
          resolve(res)
        } else {
          reject(res)
        }
      }).catch(err => {
        reject(err)
      })
    }
    return ''
  }
}
export {
  mApi
}
import categoriesData from '../data/categories.js'
import billsData from '../data/bills.js'
const mApi = {
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
  }
}
export {
  mApi
}
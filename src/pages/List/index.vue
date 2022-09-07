<template>
  <div class="page page--list">
    <div class="page__title">
      <h2>流水管理</h2>
    </div>
    <div class="page__content">
      <ElDatePicker
        v-model="pickMonth"
        type="monthrange"
        start-placeholder="开始月份"
        end-placeholder="结束月份"
      />
      <el-table
      v-bind:key="tableKey"
        :data="useBillsData"
        style="width: 100%"
        empty-text="暂无数据"
        highlight-current-row
        :row-class-name="tableRowClassName"
        :cell-class-name="tableCellClassName"
      >
        <el-table-column prop="time" label="时间">
          <template #default="scope">
            {{ scope.row.time ? formatTime(+scope.row.time) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="type" width="60" label="类型">
          <template #default="scope">
            {{ scope.row.type ? getColoum("type", scope.row.type) : "" }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类">
          <template #default="scope">
            {{
              scope.row.category
                ? getColoum("category", scope.row.category)
                : ""
            }}
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="金额"
          cell-class-name="col-amount"
        >
          <template #default="scope">
            <template v-if="scope.row.spId === 'summary'"
              >{{ scope.row.valTitle }}：</template
            >
            <cptPrice :dataSource="scope.row.amount" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, watch, computed } from 'vue'
import { ElMessage, ElTable, ElDatePicker } from 'element-plus'
import CptPrice from '../../components/price/index.vue'
import { get, formatTime, getDayOfTheMonthLastDay } from '../../utils/index.js'
import { tableRowClassName, tableCellClassName } from '../../utils/table.js'

export default defineComponent({
  name: 'PageList',
  props: [],
  components: {
    CptPrice
  },
  setup(props, context) {
    const { ctx: that, proxy: ROOT } = getCurrentInstance()
    const categoriesData = ref([])
    const orgiBillsData = ref([])
    const billsDataAfterFilter = ref([])
    const pickMonth = ref('')
    const tableKey = ref(Math.random())
    const billTypesData = ref([
      {
        id: 0,
        name: '支出'
      },
      {
        id: 1,
        name: '收入'
      }
    ])

    const initData = async () => {
      const requestAll = [ROOT.$api.getCategories(), ROOT.$api.getBills()]
      return await Promise.all(requestAll)
        .then(res => {
          console.log(res)
          if (get('data', res[0], 1)) {
            // 数组至少长度为1
            categoriesData.value = res[0].data
          }
          if (get('data', res[1], 1)) {
            // 数组至少长度为1
            // 进行个排序处理
            const resSort = res[1].data.sort((a, b) => {
              return +a.time - +b.time
            })
            orgiBillsData.value = [...resSort]
            billsDataAfterFilter.value = [...resSort]
          }
        })
        .catch(err => {
          // console.log('err', err)
          ElMessage({
            message: '请求数据失败！请稍后重试！',
            type: 'warning'
          })
        })
    }
    initData()

    const getColoum = (type, id) => {
      if (type === 'type') {
        const res = billTypesData.value.find(sItem => +sItem.id === +id)
        if (get('name', res)) {
          return res.name
        }
      } else if (type === 'category') {
        const res = categoriesData.value.find(sItem => sItem.id === id)
        if (get('name', res)) {
          return res.name
        }
      }
      return id
    }

    // 动态生成计算合计
    const useBillsData = computed(() => {
      if (billsDataAfterFilter.value.length > 0) {
        let incomes = 0,
          outgoings = 0,
          sum = 0
        billsDataAfterFilter.value.forEach(item => {
          const curNumber = parseFloat(item.amount)
          if (!Number.isNaN(curNumber)) {
            if (item.type === '0') {
              // 支出
              outgoings += curNumber
              sum -= curNumber
            } else {
              incomes += curNumber
              sum += curNumber
            }
          }
        })
        // console.log('触发计算', billsDataAfterFilter.value.map(item=>item.amount))
        const newArr = [
          ...billsDataAfterFilter.value,
          {
            spId: 'summary',
            valTitle: '总收入',
            valType: 'incomes',
            amount: incomes
          },
          {
            spId: 'summary',
            valTitle: '总支出',
            valType: 'outgoings',
            amount: outgoings
          },
          {
            spId: 'summary',
            valTitle: '结余',
            amount: sum
          }
        ]
        return newArr
      }
      return billsDataAfterFilter.value
    })

    const filterDataFromTime = (startTime, stopTime) => {
      const res = orgiBillsData.value.filter(
        item => +item.time >= startTime && +item.time <= stopTime
      )
      billsDataAfterFilter.value = res
      // console.log('filter time res', res,  billsDataAfterFilter.value.map(item=>item.amount))
    }
    watch(pickMonth, val => {
      if (val) {
        // console.log('时间筛选', val)
        const startTime = new Date(val[0]).getTime()
        const stopTime = getDayOfTheMonthLastDay(new Date(val[1]).getTime())
        filterDataFromTime(startTime, stopTime)
      } else {
        billsDataAfterFilter.value = [...orgiBillsData.value]
      }
      tableKey.value = Math.random()
    })

    return {
      formatTime,
      ElTable,
      ElDatePicker,
      categoriesData,
      billTypesData,
      getColoum,
      tableRowClassName,
      tableCellClassName,
      pickMonth,
      useBillsData,
      tableKey
    }
  }
})
</script>

<style lang="scss">
@use "./index.scss";
</style>
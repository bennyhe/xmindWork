<template>
  <div class="page page--list">
    <div class="page__title">
      <h2>流水管理</h2>
    </div>
    <div class="page__content">
      <el-table
        :data="billsData"
        style="width: 100%"
        empty-text="暂无数据"
        highlight-current-row
        :row-class-name="tableRowClassName"
        :cell-class-name="tableCellClassName"
      >
        <el-table-column type="index" width="100" label="序号" />
        <el-table-column prop="type" label="类型">
          <template #default="scope">
            {{ getColoum("type", scope.row.type) }}
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间">
          <template #default="scope">
            {{ formatTime(+scope.row.time) }}
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类">
          <template #default="scope">
            {{ getColoum("category", scope.row.category) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="amount"
          label="金额"
          cell-class-name="col-amount"
        >
          <template #default="scope">
            <cptPrice :dataSource="scope.row.amount" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { defineComponent, getCurrentInstance, ref } from 'vue'
import { ElMessage, ElTable, ElDatePicker } from 'element-plus'
import CptPrice from '../../components/price/index.vue'
import { get, formatTime } from '../../utils/index.js'

export default defineComponent({
  name: 'PageList',
  props: [],
  components: {
    CptPrice
  },
  setup(props, context) {
    const { proxy: ROOT } = getCurrentInstance()
    const categoriesData = ref([])
    const billsData = ref([])
    const billTypesData = ref([
      {
        id: 0,
        name: '收入'
      },
      {
        id: 1,
        name: '支出'
      }
    ])

    const getData = async () => {
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
            billsData.value = res[1].data
          }
        })
        .catch(err => {
          console.log('err', err)
          ElMessage({
            message: '请求数据失败！请稍后重试！',
            type: 'warning'
          })
        })
    }
    getData()

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
    const tableRowClassName = ({ row }) => {
      if (+row.type === 0) {
        return 'row-incomes'
      } else if (+row.type === 1) {
        return 'row-outgoings'
      }
      return ''
    }
    const tableCellClassName = ({ row, column }) => {
      return `col-${column.property}`
    }
    return {
      formatTime,
      ElTable,
      ElDatePicker,
      categoriesData,
      billsData,
      billTypesData,
      getColoum,
      tableRowClassName,
      tableCellClassName
    }
  }
})
</script>

<style lang="scss">
@use "./index.scss";
</style>
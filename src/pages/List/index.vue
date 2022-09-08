<template>
  <div class="page page--list">
    <div class="page__title">
      <h2>账单管理</h2>
    </div>
    <!-- S 账单列表 -->
    <div class="page__content" v-if="isShowTableView">
      <div class="tb">
        <div class="tb-top">
          <p class="page__btn-wrap">
            <el-button type="primary" @click="handleClickChangeView()"
              >记一笔</el-button
            >
          </p>
          <div class="tb-top__extra">
            <ElDatePicker
              v-model="pickMonth"
              type="monthrange"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
            />
          </div>
        </div>
        <el-table
          v-bind:key="tableKey"
          :data="billsDataAfterFilter"
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
          <el-table-column prop="type" width="120" label="类型">
            <template #default="scope">
              {{ scope.row.type ? getColoum("type", scope.row.type) : "" }}
            </template>
          </el-table-column>
          <el-table-column
            prop="category"
            label="分类"
            :filters="categoriesData"
            :filter-method="fnFilterCate"
          >
            <template #default="scope">
              {{
                scope.row.category
                  ? getColoum("category", scope.row.category)
                  : ""
              }}
            </template>
          </el-table-column>
          <el-table-column prop="amountFloat" label="金额" sortable :sort-by="['type', 'amountFloat', 'category']">
            <template #default="scope">
              <cptPrice
                v-bind:key="`${scope.row.time}_${scope.row.amount}`"
                :dataSource="scope.row.amount"
              />
            </template>
          </el-table-column>
        </el-table>
        <div class="tb-summary" v-if="billsDataAfterFilter.length > 0">
          <p
            class="row-summary"
            :class="{
              'row-outgoings': row.valType === 'outgoings',
              'row-incomes': row.valType === 'incomes',
            }"
            v-for="row in arrSummary"
            v-bind:key="row.id"
          >
            {{ row.valTitle }}：
            <span class="col-amount"
              ><cptPrice :dataSource="row.amount"
            /></span>
          </p>
        </div>
      </div>
      <p class="page__btn-wrap">
        <el-button type="primary" @click="handleClickChangeView()"
          >记一笔</el-button
        >
      </p>
    </div>
    <!-- E 账单列表 -->
    <!-- S 新增账单 -->
    <div class="page__content" v-else>
      <el-form
        :model="form"
        label-width="60px"
        ref="ruleFormRef"
        :rules="rules"
        status-icon
      >
        <el-form-item>
          <el-button
            :icon="ArrowLeft"
            type="default"
            @click="handleClickCloseView"
            >返回上一页</el-button
          >
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="form.useType">
            <el-radio
              :label="biType.id"
              v-for="biType in billTypesData"
              v-bind:key="biType.id"
              >{{ biType.name }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类" prop="cate">
          <el-select
            v-model="form.cate"
            :placeholder="`请选择${form.useType === '0' ? '支出' : '收入'}分类`"
          >
            <el-option
              :label="`${form.useType === '0' ? '支出' : '收入'}-${
                cateItem.name
              }`"
              :value="cateItem.id"
              v-for="cateItem in categoriesDataInForm[+form.useType]"
              v-bind:key="cateItem.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-col :span="11">
            <el-date-picker
              v-model="form.date1"
              type="date"
              placeholder="请选择日期"
              style="width: 100%"
              :clearable="false"
            />
          </el-col>
          <el-col :span="2" class="text-center">
            <span class="text-gray-500">-</span>
          </el-col>
          <el-col :span="11">
            <el-time-picker
              v-model="form.date2"
              placeholder="请选择时间"
              style="width: 100%"
              :clearable="false"
            />
          </el-col>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleClickSubmitForm(ruleFormRef)"
            >记一笔</el-button
          >
          <el-button type="default" @click="handleClickResetForm(ruleFormRef)"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>
    <!-- E 新增账单 -->
  </div>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, watch, reactive } from 'vue'
import {
  ElMessage,
  ElTable,
  ElDatePicker,
  ElForm,
  ElFormItem,
  ElInput,
  ElTimePicker,
  ElCol
} from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
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
    const { proxy: ROOT } = getCurrentInstance()
    const categoriesData = ref([]) // 原始分类数据
    const categoriesDataInForm = ref([]) // 为了减少多次筛选记一笔的分类，一次性生成
    const orgiBillsData = ref([]) // 原始账单数据，接口获取&新增&筛选使用
    const billsDataAfterFilter = ref([]) // 指定条件筛选后的数据
    const pickMonth = ref(null) // 月份筛选
    const tableKey = ref(Math.random()) // eltable ID
    const billTypesData = ref([
      // 账单类型
      {
        id: '0',
        name: '支出'
      },
      {
        id: '1',
        name: '收入'
      }
    ])
    const isShowTableView = ref(true) // 切换页面状态
    const arrSummary = ref([])
    // 表单相关变量
    const form = reactive({
      amount: '',
      useType: '0',
      cate: '',
      date1: new Date(),
      date2: new Date()
    })
    const ruleFormRef = ref()
    const validateAmount = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入金额！'))
      } else if (!/^[+-]?(0|([1-9]\d*))(\.\d+)?$/g.test(value)) {
        callback(new Error('请输入正确的数字！'))
      } else {
        if (value !== '') {
          if (!ruleFormRef.value) return
        }
        callback()
      }
    }
    const validateCate = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请选择分类！'))
      } else {
        if (value !== '') {
          if (!ruleFormRef.value) return
          const res = categoriesData.value.find(sitem => sitem.id === value)
          if (res && res.type !== form.useType) {
            callback(new Error('该分类不属于该类型下！请重新选择！'))
          }
        }
        callback()
      }
    }
    const rules = reactive({
      amount: [{ validator: validateAmount, trigger: 'blur' }],
      cate: [{ validator: validateCate, trigger: 'change' }]
    })

    /**
     * 初始化数据
     */
    const initData = async () => {
      const requestAll = [ROOT.$api.getCategories(), ROOT.$api.getBills()]
      return await Promise.all(requestAll)
        .then(res => {
          console.log(res)
          if (get('data', res[0], 1)) {
            // 数组至少长度为1
            categoriesData.value = res[0].data
            const formCate = [[], []]
            res[0].data.forEach(item => {
              // 表格筛选用
              item.value = item.id
              item.text = `${item.type === '0' ? '支出' : '收入'}-${item.name}`
              if (item.type === '0') {
                formCate[0].push(item)
              } else if (item.type === '1') {
                formCate[1].push(item)
              }
            })
            categoriesDataInForm.value = formCate
          }
          if (get('data', res[1], 1)) {
            // 数组至少长度为1
            // 进行个时间排序处理
            const resSort = res[1].data.sort((a, b) => {
              return +a.time - +b.time
            })
            resSort.forEach(item => {
              item.amountFloat = parseFloat(item.amount)
            })
            orgiBillsData.value = [...resSort]
            billsDataAfterFilter.value = [...resSort]
            getArrSummary()
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
    initData() // 初始化数据

    /**
     * 表格显示关联的字段名称
     */
    const getColoum = (type, id) => {
      if (type === 'type') {
        const res = billTypesData.value.find(sItem => sItem.id === id)
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

    /**
     * 动态计算带合计的数据(用来显示)
     */
    const getArrSummary = () => {
      let incomes = 0,
        outgoings = 0,
        sum = 0
      const newArr = [
        {
          spId: 'summary',
          valTitle: '总收入',
          valType: 'incomes',
          amount: incomes,
          id: Math.random()
        },
        {
          spId: 'summary',
          valTitle: '总支出',
          valType: 'outgoings',
          amount: outgoings,
          id: Math.random()
        },
        {
          spId: 'summary',
          valTitle: '结余',
          amount: sum,
          id: Math.random()
        }
      ]
      if (billsDataAfterFilter.value.length > 0) {
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
        newArr[0].amount = incomes
        newArr[1].amount = outgoings
        newArr[2].amount = sum
        newArr[0].id = Math.random()
        newArr[1].id = Math.random()
        newArr[2].id = Math.random()
      }
      arrSummary.value = newArr
    }
    /**
     * 筛选符合时间段内的数据
     */
    const filterDataFromTime = (startTime, stopTime) => {
      const res = orgiBillsData.value.filter(
        item => +item.time >= startTime && +item.time <= stopTime
      )
      billsDataAfterFilter.value = res
      // console.log('filter time res', res,  billsDataAfterFilter.value.map(item=>item.amount))
    }
    // 监听月份筛选
    watch(pickMonth, val => {
      if (val) {
        const startTime = new Date(val[0]).getTime()
        const stopTime = getDayOfTheMonthLastDay(new Date(val[1]).getTime())
        filterDataFromTime(startTime, stopTime)
      } else {
        // 不选择时间时还原全部数据
        billsDataAfterFilter.value = [...orgiBillsData.value]
      }
      getArrSummary()
      tableKey.value = Math.random() // 用来解决elmentui在变更数据源时导致数据显示残留在表格里
    })

    /**
     * 记一笔
     */
    const handleClickChangeView = () => {
      isShowTableView.value = false
      form.amount = ''
      form.useType = '0'
      form.cate = ''
      form.date1 = new Date()
      form.date2 = new Date()
    }
    /**
     * 关闭新增账单
     */
    const handleClickCloseView = () => {
      isShowTableView.value = true
    }
    /**
     * 提交新增
     */
    const handleClickSubmitForm = formRef => {
      if (!formRef) return
      formRef.validate(valid => {
        if (valid) {
          console.log('submit!')
          const postData = {
            amount: form.amount,
            // 时间需要日期+时间重新合并下
            time: (
              new Date(new Date(form.date1).toDateString()).getTime() +
              (new Date(form.date2).getTime() -
                new Date(new Date(form.date2).toDateString()).getTime())
            ).toString(),
            category: form.cate,
            type: form.useType
          }
          ROOT.$api
            .addBills(postData)
            .then(res => {
              const newArr = [
                ...orgiBillsData.value,
                {
                  ...postData,
                  amountFloat: parseFloat(postData.amount)
                }
              ]
              const resSort = newArr.sort((a, b) => {
                return +a.time - +b.time
              })
              orgiBillsData.value = resSort
              billsDataAfterFilter.value = resSort
              getArrSummary()
              ElMessage({
                message: '新增数据成功！',
                type: 'success'
              })
              // 跳回列表页
              isShowTableView.value = true
              pickMonth.value = null
            })
            .catch(err => {
              // console.log('err', err)
              ElMessage({
                message: '添加数据失败！请稍后尝试！',
                type: 'warning'
              })
            })
        } else {
          // console.log('error submit!')
          return false
        }
      })
    }
    /**
     * 重置表单
     */
    const handleClickResetForm = formRef => {
      if (!formRef) return
      formRef.resetFields()
      form.useType = '0'
    }

    const fnFilterCate = (value, row) => {
      console.log(value, row)
      return row.category === value
    }

    const handleSortAmount = (row, column) => {
      console.log(row, column)
    }

    return {
      formatTime,
      // el组件
      ElTable,
      ElDatePicker,
      ElForm,
      ElFormItem,
      ElInput,
      ElTimePicker,
      ElCol,
      ArrowLeft,
      // 组件内
      categoriesData,
      billTypesData,
      getColoum,
      tableRowClassName,
      tableCellClassName,
      pickMonth,
      tableKey,
      handleClickChangeView,
      handleClickCloseView,
      isShowTableView,
      form,
      handleClickSubmitForm,
      handleClickResetForm,
      ruleFormRef,
      rules,
      categoriesDataInForm,
      billsDataAfterFilter,
      arrSummary,
      // 表格操作
      fnFilterCate,
      handleSortAmount
    }
  }
})
</script>

<style lang="scss">
@use "./index.scss";
</style>
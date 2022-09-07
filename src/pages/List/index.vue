<template>
  <div class="page">
    <div class="page__title">
      <h2>账单管理</h2>
    </div>
  </div>
</template>

<script>
import { defineComponent, getCurrentInstance, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { get } from '../../utils/index.js'

export default defineComponent({
  name: 'PageList',
  props: [],
  components: {},
  setup(props, context) {
    const { proxy: ROOT } = getCurrentInstance()
    const categoriesData = ref([])
    const billsData = ref([])

    const getData = async () => {
      const requestAll = [ROOT.$api.getCategories(), ROOT.$api.getBills()]
      return await Promise.all(requestAll)
        .then(res => {
          console.log(res)
          if (get('data', res[0], 1)) {
            categoriesData.value = res[0].data
          }
          if (get('data', res[1], 1)) {
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
    return {
      categoriesData,
      billsData
    }
  }
})
</script>

<style lang="scss">
@use "./index.scss";
</style>
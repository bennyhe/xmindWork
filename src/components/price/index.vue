<template>
  <span class="mod-price" v-if="dataSource">
    <span class="mod-price__yen" v-if="showYen">&yen;</span>
    <span class="mod-price__num mod-price__num--big">{{ newPrice.value }}</span>
    <span class="mod-price__point" v-if="newPrice.digit">.</span>
    <span class="mod-price__num mod-price__num--small" v-if="newPrice.digit">{{
      newPrice.digit
    }}</span>
  </span>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { splitPrice } from '../../utils/index.js'

export default defineComponent({
  name: 'CptPrice',
  props: {
    dataSource: {
      type: Number,
      default: null
    },
    showYen: {
      type: Boolean,
      default: true
    },
    priceDigit: {
      type: Number,
      default: 2
    },
    keepZero: {
      type: Boolean,
      default: true
    }
  },
  setup(props, context) {
    const newPrice = ref(props.dataSource)
    const fortmatPrice = () => {
      if (newPrice.value === '' || newPrice.value === undefined) {
        return {
          value: '',
          digit: ''
        }
      }
      const price = splitPrice(newPrice.value, props.priceDigit)
      if (props.keepZero && !price.digit) {
        price.digit = new Array(props.priceDigit).fill(0).join('')
      }
      newPrice.value = price
    }
    fortmatPrice()
    return {
      newPrice
    }
  }
})
</script>

<style lang="scss">
@use "./index.scss";
</style>
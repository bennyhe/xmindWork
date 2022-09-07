import { createApp } from 'vue'
import 'babel-polyfill'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './style/reset.scss'
import App from './App.vue'
import { mApi } from './api/index.js'

const app = createApp(App)
app.config.globalProperties.$api = mApi
app.use(ElementPlus)
app.mount('#app')

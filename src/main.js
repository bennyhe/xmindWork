import { createApp } from 'vue'
import 'babel-polyfill'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import './style/reset.scss'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')

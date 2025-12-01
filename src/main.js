import { createApp, h, defineComponent } from 'vue'
import { createPinia } from 'pinia'
import Antd, { Table } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './assets/styles/theme.css'
import './styles/responsive.css'  // 全局响应式样式
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)

// 全局包装 a-table：启用列宽自适应文本长度
const AutoWidthTable = defineComponent({
  name: Table.name,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        Table,
        {
          // 透传原有属性
          ...attrs,
          // 统一使用自动布局，让列宽根据内容自适应
          tableLayout: 'auto',
        },
        slots,
      )
  },
})

// 覆盖全局 <a-table> 组件
app.component(Table.name, AutoWidthTable)

app.mount('#app')

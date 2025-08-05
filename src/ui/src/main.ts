import 'virtual:uno.css'
import '@/styles/app.less'
import 'virtual:svg-icons-register'

import { createHead } from '@unhead/vue/client'

import App from '@/App.vue'
import router from '@/router'
import pinia from '@/stores'

import vscodePlugin from './plugins/vscode'

const app = createApp(App)

const head = createHead()

app.use(head)
app.use(router)
app.use(pinia)
app.use(i18n)

app.use(vscodePlugin)

// ---- 同步 <html lang>
function setLangAttr(code: string) {
  return document.documentElement.setAttribute('lang', code)
}

// 初次加载
setLangAttr(i18n.global.locale.value)

// 语言切换时实时更新
watch(i18n.global.locale, newCode => setLangAttr(newCode))

app.mount('#app')

// 👇 全局监听 message 事件
// ✅ 监听插件传来的初始化数据
window.addEventListener('message', (event) => {
  const msg = event.data
  if (msg.type === 'load-config') {
    const store = useConfigStore()
    store.load(msg.data, msg.path)
    router.push(msg.route || '/config')
  }
})

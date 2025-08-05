import messages from '@intlify/unplugin-vue-i18n/messages'
import type { PickerColumn } from 'vant'
import { Locale } from 'vant'
import enUS from 'vant/es/locale/lang/en-US'
import zhCN from 'vant/es/locale/lang/zh-CN'
import { createI18n } from 'vue-i18n'

const FALLBACK_LOCALE = 'en-US'

const vantLocales = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

export const languageColumns: PickerColumn = [
  { text: 'English', value: 'en-US' },
  { text: '简体中文', value: 'zh-CN' },
]

export const i18n = setupI18n()
type I18n = typeof i18n

export const locale = computed({
  get() {
    return i18n.global.locale.value
  },
  set(language: string) {
    setLang(language, i18n)
  },
})

export const bcp47Locale = computed(() => locale.value.split('-')[0].toUpperCase())

export function setLanguageByBcp47(bcp47: string) {
  const language = languageColumns.find(lang => (lang.value as string).split('-')[0].toUpperCase() === bcp47)?.value || languageColumns[0].value
  setLang(language as string, i18n)
}

function setupI18n() {
  const locale = getI18nLocale()
  const i18n = createI18n({
    locale,
    legacy: false,
    messages,
  })
  setLang(locale, i18n)
  return i18n
}

async function setLang(lang: string, i18n: I18n) {
  await loadLocaleMsg(lang, i18n)

  document.querySelector('html').setAttribute('lang', lang)
  localStorage.setItem('language', lang)
  i18n.global.locale.value = lang

  // 设置 vant 组件语言包
  Locale.use(lang, vantLocales[lang])
}

// 加载本地语言包
async function loadLocaleMsg(locale: string, i18n: I18n) {
  const messages = await import(`../locales/${locale}.json`)
  i18n.global.setLocaleMessage(locale, messages.default)
}

// 获取当前语言对应的语言包名称
function getI18nLocale() {
  const storedLocale = localStorage.getItem('language') // || navigator.language

  const langs = languageColumns.map(v => v.value as string)

  // 存在当前语言的语言包 或 存在当前语言的任意地区的语言包
  const foundLocale = langs.find(v => v === storedLocale || v.indexOf(storedLocale) === 0)

  // 若未找到，则使用 默认语言包
  const locale = foundLocale || FALLBACK_LOCALE

  return locale
}

const windowWidth = ref(window.innerWidth) // 单例
const appWidth = ref(window.innerWidth) // 单例
let isInit = false // 确保只初始化一次

export function useAppWidth() {
  if (!isInit) {
    const update = () => {
      const appEl = document.getElementById('app')
      appWidth.value = appEl?.clientWidth
      windowWidth.value = window.innerWidth
    }

    update() // 首次计算
    window.addEventListener('resize', update) // 全局监听
    isInit = true
  }

  return {
    appWidth,
    appWidthPx: computed(() => `${appWidth.value}px`),
    appOffsetWidth: computed(() => (windowWidth.value - appWidth.value) / 2),
    appOffsetWidthPx: computed(() => `${(windowWidth.value - appWidth.value) / 2}px`),
  }
}

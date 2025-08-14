export const useConfigStore = defineStore('config', () => {
  const config = ref<Record<string, any>>({})
  const loaded = ref(false)

  function load(newConfig: Record<string, any>) {
    config.value = newConfig
    loaded.value = true
  }

  function reset() {
    config.value = {}
    loaded.value = false
  }

  return { config, loaded, load, reset }
})

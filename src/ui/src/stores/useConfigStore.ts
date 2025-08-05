export const useConfigStore = defineStore('config', () => {
  const config = ref<Record<string, any>>({})
  const path = ref('')
  const loaded = ref(false)

  function load(newConfig: Record<string, any>, newPath: string) {
    config.value = newConfig
    path.value = newPath
    loaded.value = true
  }

  function reset() {
    config.value = {}
    path.value = ''
    loaded.value = false
  }

  return { config, path, loaded, load, reset }
})
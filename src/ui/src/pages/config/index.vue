<script setup lang="ts">
import { extractConfigFromGroups, populateConfigFieldValues } from './hexoConfigFields'

const vscode = getCurrentInstance()?.appContext.config.globalProperties.$vscode

const configStore = useConfigStore()

const groups = ref([])

onMounted(() => {
  // Load initial config data
  groups.value = populateConfigFieldValues(configStore.config)
})

function save() {
  const config = extractConfigFromGroups(groups.value)
  vscode.postMessage({
    type: 'save-config',
    data: JSON.parse(JSON.stringify(config)),
  })
}
</script>

<template>
  <form v-if="configStore.loaded" class="w-full" @submit.prevent="save">
    <h2 class="text-center mb-6 text-xl font-semibold">
      配置设置
    </h2>

    <config-group-renderer id="root" v-model="groups" />
    <button
      type="submit"
      class="w-full py-2 bg-blue-500 text-white rounded-md text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-blue-600"
    >
      保存
    </button>
  </form>
</template>

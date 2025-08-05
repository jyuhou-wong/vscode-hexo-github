<script setup lang="ts">
const vscode = getCurrentInstance()?.appContext.config.globalProperties.$vscode

const configStore = useConfigStore()

function save() {
  // Ensure data is serializable (deep clone)
  vscode.postMessage({
    type: 'save-config',
    data: JSON.parse(JSON.stringify(configStore.config)),
    path: configStore.path,
  })
}
</script>

<template>
  <form
    v-if="configStore.loaded"
    class="w-full"
    @submit.prevent="save"
  >
    <h2 class="text-center mb-6 text-xl font-semibold">
      配置设置
    </h2>
    <div
      v-for="(val, key) in configStore.config"
      :key="key"
      class="mb-5 flex flex-col"
    >
      <label :for="key" class="mb-1 font-medium">{{ key }}</label>
      <input
        :id="key"
        v-model="configStore.config[key]"
        class="px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2"
      >
    </div>
    <button
      type="submit"
      class="w-full py-2 bg-blue-500 text-white rounded-md text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-blue-600"
    >
      保存
    </button>
  </form>
</template>

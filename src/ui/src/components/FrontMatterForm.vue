<script setup lang="ts">
// VSCode WebView API（VSCode 会注入 acquireVsCodeApi）
const vscode = acquireVsCodeApi()

const title = ref('')
const tags = ref('')

function save() {
  vscode.postMessage({
    type: 'save',
    data: {
      title: title.value,
      tags: tags.value.split(',').map(t => t.trim()),
    },
  })
}
</script>

<template>
  <form @submit.prevent="save">
    <div class="mb-2">
      <label class="block mb-1">标题：</label>
      <input v-model="title" class="w-full border p-1">
    </div>

    <div class="mb-2">
      <label class="block mb-1">标签（用逗号分隔）：</label>
      <input v-model="tags" class="w-full border p-1">
    </div>

    <button type="submit" class="px-4 py-1 bg-blue-500 text-white rounded">
      保存
    </button>
  </form>
</template>

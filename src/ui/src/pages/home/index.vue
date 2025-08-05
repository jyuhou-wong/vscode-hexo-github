<script setup lang="ts">
</script>

<template>
  <div class="p-4">
    <h1 class="text-xl font-bold">
      Hexo 管理器
    </h1>
    <p class="mt-2">
      欢迎使用 Hexo VSCode 插件。
    </p>
    <router-link to="/config" class="mt-4 inline-block text-blue-500 underline">
      前往配置编辑器
    </router-link>
  </div>
</template>

<route lang="json5">
{
  name: 'home',
  path: '/',
}
</route>

<style scoped>
</style>

<script setup lang="ts">
const { isClickable = true, padding = 0 } = defineProps<{
  name: SvgIconName
  size?: number
  height?: number
  width?: number
  color?: string
  isClickable?: boolean
  padding?: number
}>()
</script>

<template>
  <div
    class="svg-icon flex items-center justify-center" :style="{
      padding: vw(padding),
      cursor: isClickable ? 'pointer' : 'default',
    }"
  >
    <svg
      :style="{
        width: vw(width ?? size),
        height: vw(height ?? size),
        color: color ?? 'var(--white)',
      }" aria-hidden="true"
    >
      <use :xlink:href="`#icon-${name}`" />
    </svg>
  </div>
</template>

<style scoped>
</style>

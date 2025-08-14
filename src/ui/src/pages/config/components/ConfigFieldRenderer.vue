<!-- components/ConfigFieldRenderer.vue -->
<script setup lang="ts">
defineProps<{
  id: string
  modelValue: any
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <!-- Boolean: Switch -->
  <input
    v-if="typeof modelValue === 'boolean'" :id="id" :checked="modelValue" type="checkbox" class="w-6 h-6"
    @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
  >

  <!-- Array: Select -->
  <select
    v-else-if="Array.isArray(modelValue)" :id="id" :value="modelValue"
    class="px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2"
    @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-for="option in modelValue" :key="option" :value="option">
      {{ option }}
    </option>
  </select>

  <!-- String / Number -->
  <input
    v-else :id="id" :value="modelValue" :type="typeof modelValue === 'number' ? 'number' : 'text'"
    class="px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>

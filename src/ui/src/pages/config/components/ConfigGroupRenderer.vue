<script setup lang="ts">
// 默认的 v-model 对应 `modelValue` 和 `update:modelValue` 事件
const props = defineProps<{
  id: string
  modelValue: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// 双向绑定的本地变量
const value = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})
</script>

<template>
  <div>
    <template v-if="Array.isArray(value)">
      <fieldset v-for="group in value" :key="group.label" class="border rounded-md p-3 mb-2 mb-5">
        <legend class="font-medium">
          {{ group.label }}
        </legend>

        <template v-for="(field, index) in group.fields" :key="field.label">
          <config-group-renderer
            v-if="field?.fields !== undefined" :id="field.key"
            v-model="group.fields[index]"
          />

          <div v-else class="mb-5 flex flex-col">
            <label :for="`${id}.${field.key}`" class="mb-1 font-medium">
              {{ field.label }}
            </label>
            <config-field-renderer :id="`${id}.${field.key}`" v-model="field.value" />
          </div>
        </template>
      </fieldset>
    </template>

    <template v-else>
      <fieldset class="border rounded-md p-3 mb-2 mb-5">
        <legend class="font-medium">
          {{ value.label }}
        </legend>

        <template v-for="(field, index) in value.fields" :key="field.label">
          <config-group-renderer
            v-if="field?.fields !== undefined" :id="field.key ?? ''"
            v-model="value.fields[index]"
          />

          <div v-else class="mb-5 flex flex-col">
            <label :for="`${id}.${field.key}`" class="mb-1 font-medium">
              {{ modelValue.label }}
            </label>
            <config-field-renderer :id="`${id}.${field.key}`" v-model="value.fields[index].value" />
          </div>
        </template>
      </fieldset>
    </template>
  </div>
</template>

<script setup lang="ts">
const vscode = getCurrentInstance()?.appContext.config.globalProperties.$vscode

useHead({
  title: 'SkyForces',
  meta: [
    {
      name: 'description',
      content: 'SkyForces',
    },
    {
      name: 'theme-color',
      content: () => isDark.value ? '#F4F6F8' : '#F4F6F8',
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: () => preferredDark.value ? '/favicon-dark.svg' : '/favicon.svg', // 跟随系统
    },
  ],
})

const mode = computed(() => isDark.value ? 'dark' : 'light')

const router = useRouter()
const route = useRoute()

// 确保路由准备就绪后再获取首选主题
router.isReady().then(() => {
  watchEffect(() => {
    const forced = route.meta?.isPreferredDark

    // 如果设置了强制值，且当前主题与强制值不一致，则以强制值为准
    if (typeof forced === 'boolean' && forced !== isDark.value) {
      toggleDark(forced)
    }

    // 如果没有强制值，则使用首选主题
    else if (typeof forced === 'undefined' && preferredDark.value !== isDark.value) {
      toggleDark(preferredDark.value)
    }
  })
})

onMounted(() => {
  vscode.postMessage({
    type: 'app-ready',
  })
})
</script>

<template>
  <van-config-provider :theme="mode">
    <router-view v-slot="{ Component }">
      <keep-alive
        exclude="Login,Register,ResetPassword,Me,WinlyDetail,Product,MyProducts,TrialBot,AddBot,UpgradeOrRenewBot,Withdraw,WithdrawHistory"
      >
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </van-config-provider>
</template>

<style scoped>
:deep(.van-cell__value) {
  margin-left: 0;
}
</style>

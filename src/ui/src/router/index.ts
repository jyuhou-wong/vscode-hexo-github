// import 'nprogress/nprogress.css'

// import NProgress from 'nprogress'
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

// NProgress.configure({ showSpinner: false, parent: '#app' })

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 刷新页面时，回到顶部
    if (from.fullPath === to.fullPath) {
      return { left: 0, top: 0 }
    }

    // 浏览器 前进/后退 时，恢复滚动位置
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        top: 0,
        behavior: 'smooth',
      }
    }

    // 普通跳转一律滚到顶部
    return { left: 0, top: -10 }
  },
})

// This will update routes at runtime without reloading the page
if (import.meta.hot)
  handleHotUpdate(router)

initNavDirection(router)

router.beforeEach((to, from) => {
  // NProgress.start()

  // // Set page title
  // setPageTitle(to.meta.title)
})

router.afterEach((to, from) => {
  // NProgress.done()
})

export default router

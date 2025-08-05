// nav-routerDirection.ts
import type { Router } from 'vue-router'

export type Direction = 'forward' | 'back' | 'replace' | 'unknown'

/** 全局单例状态 */
export const routerDirection: Ref<Direction> = ref('unknown')
export const delta = ref(0)
let lastPos: number | null = null
let inited = false

export function initNavDirection(router: Router) {
  if (inited)
    return // 避免重复注册（HMR 可加额外保护）
  inited = true

  router.afterEach((to, from) => {
    const s = window.history.state as any
    const pos = typeof s?.position === 'number' ? s.position : 0
    const replaced = !!s?.replaced

    if (lastPos === null) {
      routerDirection.value = 'forward'
      delta.value = 0
    }
    else {
      const d = pos - lastPos
      delta.value = d
      if (d > 0) {
        routerDirection.value = 'forward'
      }
      else if (d < 0) {
        routerDirection.value = 'back'
      }
      else {
        routerDirection.value = replaced || to.fullPath === from.fullPath ? 'replace' : 'unknown'
      }
    }
    lastPos = pos
  })
}

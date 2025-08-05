import type { App, CSSProperties } from 'vue'

import loading from '@/assets/images/loading.png'

export interface LoadingOptions {
  src?: string
  size?: number
  overlay?: boolean
  overlayColor?: string
  closeOnClickOverlay?: boolean
}

/* ========== 单例状态 ========== */
let mountNode: HTMLElement | null = null
let vueApp: App | null = null

const isLoadingRef = ref(false)
export const isLoading = computed(() => isLoadingRef.value)

export function showLoading(options: LoadingOptions = {}) {
  if (mountNode)
    return

  const {
    src = loading,
    size = 32,
    overlay = true,
    overlayColor = 'transparent',
    closeOnClickOverlay = false,
  } = options

  const LoadingComp = defineComponent(() => {
    const overlayStyle: CSSProperties = {
      position: 'fixed',
      width: '100dvw',
      height: '100dvh',
      top: 0,
      left: 0,
      backgroundColor: overlayColor,
      zIndex: 9998,
    }
    const containerStyle: CSSProperties = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--background-mask)',
      zIndex: 9999,
      borderRadius: '24px',
      pointerEvents: 'none',
    }

    return () =>
      h('div', [
        overlay
        && h('div', {
          style: overlayStyle,
          onClick: () => {
            if (closeOnClickOverlay)
              hideLoading()
          },
        }),
        h(
          'div',
          { style: containerStyle },
          h('img', {
            src,
            width: size,
            height: size,
            style: {
              objectFit: 'contain',
              animation: 'spin 1s linear infinite',
            },
          }),
        ),
        h('style', {}, `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }
        `),
      ])
  })

  mountNode = document.createElement('div')
  document.body.appendChild(mountNode)
  vueApp = createApp(LoadingComp)
  vueApp.mount(mountNode)
  isLoadingRef.value = true
}

export function hideLoading() {
  if (!mountNode)
    return

  vueApp?.unmount()
  mountNode.parentNode?.removeChild(mountNode)
  mountNode = null
  vueApp = null
  isLoadingRef.value = false
}

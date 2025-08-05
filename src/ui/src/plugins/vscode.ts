import type { App } from 'vue'

export interface VscodeApi {
  postMessage: (msg: any) => void
  setState?: (state: any) => void
  getState?: () => any
}

export const vscode: VscodeApi = typeof acquireVsCodeApi === 'function'
  ? acquireVsCodeApi()
  : {
      postMessage: console.log,
      setState: () => {},
      getState: () => null,
    }

export default {
  install(app: App) {
    app.config.globalProperties.$vscode = vscode
  },
}

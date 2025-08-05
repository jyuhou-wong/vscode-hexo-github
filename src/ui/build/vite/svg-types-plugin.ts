import { log } from 'node:console'
import path from 'node:path'

import chokidar from 'chokidar'
import type { Plugin } from 'vite'

import { generateSvgTypes } from '../scripts/generate-svg-types'

export function svgTypesPlugin(): Plugin {
  const iconDir = path.resolve(__dirname, '../../src/assets/icons')

  log(`SVG 图标目录: ${iconDir}`)
  return {
    name: 'vite:svg-types-generator',
    apply: 'serve', // dev 环境才生效
    configureServer() {
      // 初始执行一次
      generateSvgTypes()

      // 监听新增/删除 svg 文件
      const watcher = chokidar.watch(iconDir, {
        ignoreInitial: true,
        persistent: true,
      })

      watcher.on('add', () => generateSvgTypes())
      watcher.on('unlink', () => generateSvgTypes())
    },
  }
}

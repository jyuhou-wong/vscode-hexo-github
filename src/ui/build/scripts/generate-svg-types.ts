import fs from 'node:fs'
import path from 'node:path'

export function generateSvgTypes() {
  const iconDir = path.resolve(__dirname, '../../src/assets/icons')
  const outputPath = path.resolve(__dirname, '../../src/types/svg-icon.d.ts')

  const files = fs.readdirSync(iconDir)
  const svgNames = files
    .filter(file => file.endsWith('.svg'))
    .map(file => `'${file.replace('.svg', '')}'`)

  const content = `declare type SvgIconName =\n  ${svgNames.join(' |\n  ')};\n`

  fs.writeFileSync(outputPath, content)
}

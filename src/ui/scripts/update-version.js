// scripts/update-version.js
// 自增 VITE_APP_TEST_VERSION_CODE，并写入短 commit hash
import { execSync } from 'node:child_process'
import fs from 'node:fs'

const targetFiles = ['.env']

function readOldCode(file) {
  if (!fs.existsSync(file))
    return 0
  const m = fs.readFileSync(file, 'utf8').match(/VITE_APP_TEST_VERSION_CODE=(\d+)/)
  return m ? Number(m[1]) : 0
}

// 取任意一个 env 文件里的旧版本号（没有就从 0 开始）
const currentCode = targetFiles.reduce((acc, f) => acc || readOldCode(f), 0)
const nextCode = currentCode + 1
const commitHash = execSync('git rev-parse --short HEAD').toString().trim()

for (const file of targetFiles) {
  let content = ''
  if (fs.existsSync(file)) {
    content = fs.readFileSync(file, 'utf8')
    // 保留其他变量，只更新指定变量
    content = content.replace(/VITE_APP_TEST_VERSION_CODE=\d+/, `VITE_APP_TEST_VERSION_CODE=${nextCode}`)
    content = content.replace(/VITE_APP_COMMIT_HASH=.*/, `VITE_APP_COMMIT_HASH=${commitHash}`)
  }
  else {
    // 如果文件不存在，创建新的内容
    content = `VITE_APP_TEST_VERSION_CODE=${nextCode}\nVITE_APP_COMMIT_HASH=${commitHash}\n`
  }

  fs.writeFileSync(file, content)
  // 只把 test 版本那个文件加入暂存区；dev 用的本地文件通常不提交
  if (file.includes('.test.'))
    execSync(`git add ${file}`)
}

console.log(`🔄 build #${nextCode} • ${commitHash}`)

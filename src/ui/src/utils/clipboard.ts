export async function copyText(text: string): Promise<void> {
  // ① 现代浏览器：异步 Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  // ② 回退：创建隐藏文本框执行 execCommand
  const textarea = document.createElement('textarea')
  textarea.value = text
  // 设置不可见 & 避免触发键盘（移动端）
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)

  if (!ok) {
    throw new Error('Failed to copy text')
  }
}

import { createRemToPxProcessor } from '@unocss/preset-wind4/utils'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const BASE_FONT_SIZE = 14

export default defineConfig({
  shortcuts: [
    ['h0-medium', 'font-[Roboto_Slab] font-500 text-58px leading-76px no-underline tracking-normal'],
    ['h1-medium', 'font-[Roboto_Slab] font-500 text-40px leading-54px no-underline tracking-normal'],
    ['h1-regular', 'font-[Roboto_Slab] font-400 text-40px leading-54px no-underline tracking-normal'],
    ['h2-medium', 'font-[Roboto_Slab] font-500 text-32px leading-44px no-underline tracking-normal'],
    ['h2-regular', 'font-[Roboto_Slab] font-400 text-32px leading-44px no-underline tracking-normal'],
    ['h2-pfmedium', 'font-[PingFang_SC] font-500 text-32px leading-46px no-underline tracking-normal'],
    ['h2-pfregular', 'font-[PingFang_SC] font-400 text-32px leading-46px no-underline tracking-normal'],
    ['h3-medium', 'font-[Roboto_Slab] font-500 text-24px leading-32px no-underline tracking-normal'],
    ['h3-regular', 'font-[Roboto_Slab] font-400 text-24px leading-32px no-underline tracking-normal'],
    ['h3-pfmedium', 'font-[PingFang_SC] font-500 text-24px leading-34px no-underline tracking-normal'],
    ['h3-pfregular', 'font-[PingFang_SC] font-400 text-24px leading-34px no-underline tracking-normal'],
    ['h4-bold', 'font-[Roboto_Slab] font-700 text-20px leading-26px no-underline tracking-normal'],
    ['h4-medium', 'font-[Roboto_Slab] font-500 text-20px leading-26px no-underline tracking-normal'],
    ['h4-regular', 'font-[Roboto_Slab] font-400 text-20px leading-26px no-underline tracking-normal'],
    ['h4-pfmedium', 'font-[PingFang_SC] font-500 text-20px leading-28px no-underline tracking-normal'],
    ['h4-pfregular', 'font-[PingFang_SC] font-400 text-20px leading-28px no-underline tracking-normal'],
    ['h5-regular', 'font-[PingFang_SC] font-400 text-18px leading-26px no-underline tracking-normal'],
    ['h5-medium', 'font-[PingFang_SC] font-500 text-18px leading-26px no-underline tracking-normal'],
    ['h5-rsregular', 'font-[Roboto_Slab] font-400 text-18px leading-24px no-underline tracking-normal'],
    ['h5-rsmedium', 'font-[Roboto_Slab] font-500 text-18px leading-24px no-underline tracking-normal'],
    ['h6-regular', 'font-[PingFang_SC] font-400 text-16px leading-24px no-underline tracking-normal'],
    ['h6-medium', 'font-[PingFang_SC] font-500 text-16px leading-24px no-underline tracking-normal'],
    ['h6-bold', 'font-[PingFang_SC] font-600 text-16px leading-24px no-underline tracking-normal'],
    ['h6-rsmedium', 'font-[Roboto_Slab] font-500 text-16px leading-22px no-underline tracking-normal'],
    ['body-14-regular', 'font-[PingFang_SC] font-400 text-14px leading-20px no-underline tracking-normal'],
    ['body-14-medium', 'font-[PingFang_SC] font-500 text-14px leading-20px no-underline tracking-normal'],
    ['body-14-regular-underline', 'font-[PingFang_SC] font-400 text-14px leading-20px underline tracking-normal'],
    ['body-12-regular', 'font-[PingFang_SC] font-400 text-12px leading-18px no-underline tracking-normal'],
    ['body-12-medium', 'font-[PingFang_SC] font-500 text-12px leading-18px no-underline tracking-normal'],
    ['body-12-regular-underline', 'font-[PingFang_SC] font-400 text-12px leading-18px underline tracking-normal'],
    ['logo-regular', 'text-20px text-[--black] leading-25px tracking-0 font-[Roboto_Serif] font-400'],
  ],
  presets: [
    presetWind4({
      preflights: {
        theme: {
          process: createRemToPxProcessor(BASE_FONT_SIZE),
        },
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
  ],
  postprocess: [
    createRemToPxProcessor(BASE_FONT_SIZE),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})

/**
 * 节日配置
 * 包含：礼花效果、滚动文字
 */
// 图片需要在 components/Ceremony/Fireworks 文件预先定义
import { FestivalConfig } from '@/types/config'
import sd from '@imgs/ceremony/sd.png'
import yd from '@imgs/ceremony/yd.png'

export const festivalConfigList: FestivalConfig[] = [
  {
    date: '2025-01-01',
    name: '元旦',
    image: yd,
    scrollText: '新年快乐！SEBM校园物品租借系统祝您在2025年万事如意，学业进步，生活愉快！'
  },
  {
    date: '2024-12-25',
    name: '圣诞节',
    image: sd,
    scrollText: 'Merry Christmas！SEBM校园物品租借系统祝您圣诞快乐，愿节日的欢乐与祝福如雪花般纷至沓来！'
  }
]

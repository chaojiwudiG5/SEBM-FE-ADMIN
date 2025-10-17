/**
 * 快速入口配置
 * 包含：应用列表、快速链接等配置
 */
import { RoutesAlias } from '@/router/routesAlias'
import { WEB_LINKS } from '@/utils/constants'
import type { FastEnterConfig } from '@/types/config'

const fastEnterConfig: FastEnterConfig = {
  // 显示条件（屏幕宽度）
  minWidth: 1200,
  // 应用列表
  applications: [
    {
      name: '用户管理',
      description: '查看和管理用户信息',
      icon: '&#xe7b9;',
      iconColor: '#377dff',
      path: '/user',
      enabled: true,
      order: 1
    },
    {
      name: '设备管理',
      description: '管理可租借设备信息',
      icon: '&#xe86e;',
      iconColor: '#ff6b6b',
      path: '/device',
      enabled: true,
      order: 2
    },
    {
      name: '消息通知',
      description: '查看系统消息与通知',
      icon: '&#xe788;',
      iconColor: '#10b981',
      path: '/message',
      enabled: true,
      order: 3
    }
  ],
  // 快速链接
  quickLinks: [
    {
      name: '用户管理',
      path: '/user',
      enabled: true,
      order: 1
    },
    {
      name: '设备管理',
      path: '/device',
      enabled: true,
      order: 2
    },
    {
      name: '消息通知',
      path: '/message',
      enabled: true,
      order: 3
    }
  ]
}

export default Object.freeze(fastEnterConfig)

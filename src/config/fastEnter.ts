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
      description: '设备信息管理与监控',
      icon: '&#xe7b9;',
      iconColor: '#20a0ff',
      path: '/device',
      enabled: true,
      order: 2
    },
    {
      name: '模版管理',
      description: '模版配置与管理',
      icon: '&#xe7b9;',
      iconColor: '#67c23a',
      path: '/template',
      enabled: true,
      order: 3
    },
    {
      name: '通知查询',
      description: '查看通知记录',
      icon: '&#xe7b9;',
      iconColor: '#8b5cf6',
      path: '/notification-records',
      enabled: true,
      order: 4
    },
    {
      name: '官方文档',
      description: '使用指南与开发文档',
      icon: '&#xe788;',
      iconColor: '#ffb100',
      path: WEB_LINKS.DOCS,
      enabled: true,
      order: 5
    },
    {
      name: '消息通知',
      description: '查看系统消息与通知',
      icon: '&#xe7b9;',
      iconColor: '#10b981',
      path: '/message',
      enabled: true,
      order: 6
    },
    {
      name: '哔哩哔哩',
      description: '技术分享与交流',
      icon: '&#xe6b4;',
      iconColor: '#FB7299',
      path: WEB_LINKS.BILIBILI,
      enabled: true,
      order: 7
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
      name: '模版管理',
      path: '/template',
      enabled: true,
      order: 3
    },
    {
      name: '通知查询',
      path: '/notification-records',
      enabled: true,
      order: 4
    },
    {
      name: '消息通知',
      path: '/message',
      enabled: true,
      order: 5
    }
  ]
}

export default Object.freeze(fastEnterConfig)

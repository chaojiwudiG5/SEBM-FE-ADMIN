import { RoutesAlias } from '../routesAlias'
import { AppRouteRecord } from '@/types/router'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 前端静态配置 - 直接使用本文件中定义的路由配置
 * 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 *
 * RoutesAlias.Layout 指向的是布局组件，后端返回的菜单数据中，component 字段需要指向 /index/index
 * 路由元数据（meta）：异步路由在 asyncRoutes 中配置，静态路由在 staticRoutes 中配置
 */
export const asyncRoutes: AppRouteRecord[] = [
  // Promote system management children to top-level routes
  {
    path: '/user',
    name: 'User',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.user',
      icon: '&#xe7b9;',
      roles: ['R_ADMIN']
    },
    children: [
      {
        path: '',
        name: 'UserIndex',
        component: RoutesAlias.User,
        meta: {
          title: 'menus.system.user',
          keepAlive: true,
          roles: ['R_ADMIN']
        }
      }
    ]
  },
  {
    path: '/role',
    name: 'Role',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.role',
      icon: '&#xe7b9;',
      roles: ['R_ADMIN']
    },
    children: [
      {
        path: '',
        name: 'RoleIndex',
        component: RoutesAlias.Role,
        meta: {
          title: 'menus.system.role',
          keepAlive: true,
          roles: ['R_ADMIN']
        }
      }
    ]
  },
  {
    path: '/device',
    name: 'Device',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.device',
      icon: '&#xe7b9;',
      roles: ['R_ADMIN']
    },
    children: [
      {
        path: '',
        name: 'DeviceIndex',
        component: RoutesAlias.Device,
        meta: {
          title: 'menus.system.device',
          keepAlive: true,
          roles: ['R_ADMIN']
        }
      }
    ]
  },
  {
    path: '/menu',
    name: 'Menus',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.menu',
      icon: '&#xe7b9;',
      roles: ['R_ADMIN']
    },
    children: [
      {
        path: '',
        name: 'MenuIndex',
        component: RoutesAlias.Menu,
        meta: {
          title: 'menus.system.menu',
          keepAlive: true,
          roles: ['R_ADMIN'],
          authList: [
            { title: '新增', authMark: 'add' },
            { title: '编辑', authMark: 'edit' },
            { title: '删除', authMark: 'delete' }
          ]
        }
      }
    ]
  },
  {
    path: '/user-center',
    name: 'UserCenter',
    component: RoutesAlias.Layout,
    meta: {
      title: 'menus.system.userCenter',
      icon: '&#xe7b9;',
      isHide: true,
      keepAlive: true,
      isHideTab: true
    },
    children: [
      {
        path: '',
        name: 'UserCenterIndex',
        component: RoutesAlias.UserCenter,
        meta: {
          title: 'menus.system.userCenter',
          keepAlive: true,
          isHide: true,
          isHideTab: true
        }
      }
    ]
  }
]

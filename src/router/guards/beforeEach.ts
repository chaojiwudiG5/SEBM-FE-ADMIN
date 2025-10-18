import type { Router, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { ref, nextTick } from 'vue'
import NProgress from 'nprogress'
import { useSettingStore } from '@/store/modules/setting'
import { useUserStore } from '@/store/modules/user'
import { useMenuStore } from '@/store/modules/menu'
import { setWorktab } from '@/utils/navigation'
import { setPageTitle, setSystemTheme } from '../utils/utils'
import { fetchGetMenuList } from '@/api/system-manage'
import { registerDynamicRoutes } from '../utils/registerRoutes'
import { AppRouteRecord } from '@/types/router'
import { RoutesAlias } from '../routesAlias'
import { menuDataToRouter } from '../utils/menuToRouter'
import { asyncRoutes } from '../routes/asyncRoutes'
import { loadingService } from '@/utils/ui'
import { useCommon } from '@/composables/useCommon'
import { useWorktabStore } from '@/store/modules/worktab'
import { fetchGetUserInfo } from '@/api/auth'

// 前端权限模式 loading 关闭延时，提升用户体验
const LOADING_DELAY = 50

// 是否已注册动态路由
const isRouteRegistered = ref(false)

// 跟踪是否需要关闭 loading
const pendingLoading = ref(false)

/**
 * 设置路由全局前置守卫
 */
export function setupBeforeEachGuard(router: Router): void {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      try {
        await handleRouteGuard(to, from, next, router)
      } catch (error) {
        console.error('路由守卫处理失败:', error)
        next('/exception/500')
      }
    }
  )

  // 设置后置守卫以关闭 loading 和进度条
  setupAfterEachGuard(router)
}

/**
 * 设置路由全局后置守卫
 */
function setupAfterEachGuard(router: Router): void {
  router.afterEach(() => {
    // 关闭进度条
    const settingStore = useSettingStore()
    if (settingStore.showNprogress) {
      NProgress.done()
    }

    // 关闭 loading 效果
    if (pendingLoading.value) {
      nextTick(() => {
        loadingService.hideLoading()
        pendingLoading.value = false
      })
    }
  })
}

/**
 * 处理路由守卫逻辑
 */
async function handleRouteGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  console.log('🛡️ 路由守卫被触发:', from.path, '->', to.path)
  
  const settingStore = useSettingStore()
  const userStore = useUserStore()

  console.log('📊 路由状态检查:')
  console.log('  - 用户已登录:', userStore.isLogin)
  console.log('  - 路由已注册:', isRouteRegistered.value)
  console.log('  - 目标路径:', to.path)

  // 处理进度条
  if (settingStore.showNprogress) {
    NProgress.start()
  }

  // 设置系统主题
  setSystemTheme(to)

  // 处理登录状态
  if (!(await handleLoginStatus(to, userStore, next))) {
    console.log('❌ 登录状态检查失败')
    return
  }

  // 处理动态路由注册
  if (!isRouteRegistered.value && userStore.isLogin) {
    console.log('🔧 需要注册动态路由')
    await handleDynamicRoutes(to, from, next, router)
    return
  }

  // 处理根路径跳转到首页
  if (userStore.isLogin && isRouteRegistered.value && handleRootPathRedirect(to, next)) {
    return
  }

  // 处理已知的匹配路由
  if (to.matched.length > 0) {
    setWorktab(to)
    setPageTitle(to)
    next()
    return
  }

  // 尝试刷新路由重新注册
  if (userStore.isLogin && !isRouteRegistered.value) {
    await handleDynamicRoutes(to, from, next, router)
    return
  }

  // 未匹配到路由，跳转到 404
  next(RoutesAlias.Exception404)
}

/**
 * 处理登录状态
 */
async function handleLoginStatus(
  to: RouteLocationNormalized,
  userStore: ReturnType<typeof useUserStore>,
  next: NavigationGuardNext
): Promise<boolean> {
  if (!userStore.isLogin && to.path !== RoutesAlias.Login && !to.meta.noLogin) {
    userStore.logOut()
    next(RoutesAlias.Login)
    return false
  }
  return true
}

/**
 * 处理动态路由注册
 */
async function handleDynamicRoutes(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
  router: Router
): Promise<void> {
  try {
    console.log('🔄 开始处理动态路由注册, 目标路径:', to.path)
    
    // 显示 loading 并标记 pending
    pendingLoading.value = true
    loadingService.showLoading()

    // 获取用户信息
    const userStore = useUserStore()
    const isRefresh = from.path === '/'
    console.log('📊 用户登录状态:', userStore.isLogin)
    console.log('🔄 是否刷新页面:', isRefresh)
    console.log('👤 当前用户信息存在:', !!userStore.info && Object.keys(userStore.info).length > 0)
    
    if (isRefresh || !userStore.info || Object.keys(userStore.info).length === 0) {
      console.log('⚠️ 用户信息为空，但用户已登录 - 可能是页面刷新导致的状态丢失')
      // 如果用户已登录但信息丢失，尝试重新获取
      if (userStore.isLogin && userStore.accessToken) {
        try {
          console.log('🔄 尝试重新获取用户信息...')
          const data = await fetchGetUserInfo()
          userStore.setUserInfo(data)
        } catch (error) {
          console.error('❌ 重新获取用户信息失败，登出用户', error)
          userStore.logOut()
          next(RoutesAlias.Login)
          return
        }
      }
    }

    await getMenuData(router)
    console.log('✅ 菜单数据获取完成')

    // 处理根路径跳转
    if (handleRootPathRedirect(to, next)) {
      console.log('🏠 已处理根路径跳转')
      return
    }

    console.log('📍 准备跳转到目标路径:', to.path)
    next({
      path: to.path,
      query: to.query,
      hash: to.hash,
      replace: true
    })
    console.log('✅ 路由跳转命令已发出')
  } catch (error) {
    console.error('动态路由注册失败:', error)
    next('/exception/500')
  }
}

/**
 * 获取菜单数据
 */
async function getMenuData(router: Router): Promise<void> {
  try {
    if (useCommon().isFrontendMode.value) {
      await processFrontendMenu(router)
    } else {
      await processBackendMenu(router)
    }
  } catch (error) {
    handleMenuError(error)
    throw error
  }
}

/**
 * 处理前端控制模式的菜单逻辑
 */
async function processFrontendMenu(router: Router): Promise<void> {
  console.log('🏗️ 开始处理前端菜单...')
  const menuList = asyncRoutes.map((route) => menuDataToRouter(route))
  console.log('📋 原始菜单列表长度:', menuList.length)
  
  const userStore = useUserStore()
  const roles = userStore.info?.roles
  console.log('👤 用户角色:', roles)
  console.log('👤 用户信息:', userStore.info)

  // 当后端未返回角色或角色为空时，默认放行所有菜单，避免阻塞登录后的跳转
  const filteredMenuList = !roles || roles.length === 0
    ? menuList
    : filterMenuByRoles(menuList, roles)

  if (!roles || roles.length === 0) {
    console.warn('⚠️ 未获取到用户角色，已默认放行全部菜单用于继续流程')
  }

  console.log('✅ 权限过滤后的菜单数量:', filteredMenuList.length)
  
  if (filteredMenuList.length === 0) {
    console.error('❌ 过滤后菜单为空！这会导致无法跳转')
    console.log('📊 原始菜单:', menuList)
    // 如果过滤后为空，使用原始菜单
    await registerAndStoreMenu(router, menuList)
  } else {
    // 添加延时以提升用户体验
    await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY))
    await registerAndStoreMenu(router, filteredMenuList)
  }
  
  console.log('🎯 菜单注册完成')
}

/**
 * 处理后端控制模式的菜单逻辑
 */
async function processBackendMenu(router: Router): Promise<void> {
  const { menuList } = await fetchGetMenuList()
  await registerAndStoreMenu(router, menuList)
}

/**
 * 递归过滤空菜单项
 */
function filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
  return menuList
    .map((item) => {
      // 如果有子菜单，先递归过滤子菜单
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterEmptyMenus(item.children)
        return {
          ...item,
          children: filteredChildren
        }
      }
      return item
    })
    .filter((item) => {
      // 过滤掉布局组件且没有子菜单的项
      const isEmptyLayoutMenu =
        item.component === RoutesAlias.Layout && (!item.children || item.children.length === 0)

      // 过滤掉组件为空字符串且没有子菜单的项，但保留有外链的菜单项
      const isEmptyComponentMenu =
        item.component === '' &&
        (!item.children || item.children.length === 0) &&
        item.meta.isIframe !== true &&
        !item.meta.link

      return !(isEmptyLayoutMenu || isEmptyComponentMenu)
    })
}

/**
 * 注册路由并存储菜单数据
 */
async function registerAndStoreMenu(router: Router, menuList: AppRouteRecord[]): Promise<void> {
  if (!isValidMenuList(menuList)) {
    throw new Error('获取菜单列表失败，请重新登录')
  }
  const menuStore = useMenuStore()
  // 递归过滤掉为空的菜单项
  const list = filterEmptyMenus(menuList)
  menuStore.setMenuList(list)
  registerDynamicRoutes(router, list)
  isRouteRegistered.value = true
  useWorktabStore().validateWorktabs(router)
}

/**
 * 处理菜单相关错误
 */
function handleMenuError(error: unknown): void {
  console.error('菜单处理失败:', error)
  useUserStore().logOut()
  throw error instanceof Error ? error : new Error('获取菜单列表失败，请重新登录')
}

/**
 * 根据角色过滤菜单
 */
const filterMenuByRoles = (menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] => {
  return menu.reduce((acc: AppRouteRecord[], item) => {
    const itemRoles = item.meta?.roles
    const hasPermission = !itemRoles || itemRoles.some((role) => roles?.includes(role))

    if (hasPermission) {
      const filteredItem = { ...item }
      if (filteredItem.children?.length) {
        filteredItem.children = filterMenuByRoles(filteredItem.children, roles)
      }
      acc.push(filteredItem)
    }

    return acc
  }, [])
}

/**
 * 验证菜单列表是否有效
 */
function isValidMenuList(menuList: AppRouteRecord[]): boolean {
  return Array.isArray(menuList) && menuList.length > 0
}

/**
 * 重置路由相关状态
 */
export function resetRouterState(): void {
  isRouteRegistered.value = false
  const menuStore = useMenuStore()
  menuStore.removeAllDynamicRoutes()
  menuStore.setMenuList([])
}

/**
 * 处理根路径跳转到首页
 */
function handleRootPathRedirect(to: RouteLocationNormalized, next: NavigationGuardNext): boolean {
  if (to.path === '/') {
    const { homePath } = useCommon()
    const targetPath = homePath.value || '/dashboard/console'
    console.log('🏠 根路径跳转，目标路径:', targetPath)
    next({ path: targetPath, replace: true })
    return true
  }
  return false
}

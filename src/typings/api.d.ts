/**
 * namespace: Api
 *
 * 所有接口相关类型定义
 * 在.vue文件中可以直接使用 Api.xxx.xxx 访问类型
 * 如果 TypeScript 报错"找不到命名空间 Api"，请在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 注册参数 */
    interface RegisterParams {
      username: string      // 用户昵称
      password: string      // 登录密码（最少6位）
      checkPassword: string // 确认密码（必须与password一致）
      phone: string         // 手机号码（唯一标识）
    }

    /** 登录响应 */
    interface LoginResponse extends UserInfo {
      // 登录响应包含完整的用户信息
    }

    /** 用户信息 */
    interface UserInfo {
      id: number
      username: string
      email: string
      phone: string
      gender: number
      avatarUrl: string | null
      userRole: number // 后端返回的角色ID：1=ADMIN
      userStatus: number
      age: number
      createTime: string
      updateTime: string
      token?: string
      active: boolean
      // 前端处理后的字段
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      // 后端原始字段
      id: number
      username: string
      password?: string        // 密码字段（通常不显示）
      email: string
      phone: string
      gender: number // 0=未知，1=男，2=女
      avatarUrl: string | null
      userRole: number // 0=普通用户，1=管理员，2=技工
      userStatus: number // 0=正常，1=禁用
      age: number
      level: number
      overdueTimes: number
      borrowedDeviceCount: number
      maxBorrowedDeviceCount: number
      maxOverdueTimes: number
      createTime: string
      updateTime: string
      isDelete: number         // 是否删除：0=未删除，1=已删除
      isActive: boolean
      token?: string
      // 前端显示用的映射字段
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      role: string           // 角色名称
      statusText: string     // 状态文本
      createBy: string
      updateBy: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = {
      // 分页参数（必填）
      pageNumber: number    // 页码，必填，最小值为1
      pageSize: number      // 每页条数，必填，最小值为1
      // 搜索条件（可选）
      id?: number
      username?: string
      email?: string
      phone?: string
      gender?: number       // 0=未知，1=男，2=女
      userStatus?: number   // 0=正常，1=禁用
    }

    /** 用户添加参数 */
    type UserAddParams = {
      username: string
      password?: string
      email: string
      phone: string
      gender: number
      userRole: number
      userStatus: number
      age?: number
      level?: number
      maxBorrowedDeviceCount?: number
      maxOverdueTimes?: number
    }

    /** 用户更新参数 - 管理员可修改的所有字段 */
    type UserUpdateParams = {
      id: number                          // 必填：用户ID
      username?: string                   // 用户昵称
      email?: string                      // 邮箱地址
      phone?: string                      // 电话号码
      gender?: number                     // 性别：0=未知，1=男，2=女
      avatarUrl?: string                  // 头像URL
      age?: number                        // 年龄
      userRole?: number                   // 角色：0=普通用户，1=管理员，2=技工
      userStatus?: number                 // 状态：0=正常
      isActive?: boolean                  // 激活状态
      level?: number                      // 用户等级
      overdueTimes?: number               // 逾期次数
      borrowedDeviceCount?: number        // 已借设备数量
      maxBorrowedDeviceCount?: number     // 最大可借设备数量
      maxOverdueTimes?: number            // 最大允许逾期次数
    }

    /** 设备状态类型 */
    type DeviceStatus = 0 | 1 | 2 | 3 // 0=可用，1=借出，2=维修，3=预留

    /** 设备列表 */
    type DeviceList = Api.Common.PaginatedResponse<DeviceListItem>

    /** 设备列表项 */
    interface DeviceListItem {
      id: number
      deviceName: string
      deviceType: string
      status: DeviceStatus
      location: string
      description: string
      image?: string
      createTime?: string
      updateTime?: string
    }

    /** 设备搜索参数 */
    type DeviceSearchParams = {
      pageNumber: number    // 页码，必填，最小值为1
      pageSize: number      // 每页条数，必填，最小值为1
      deviceName?: string   // 设备名称，可选，最大50字符
      deviceType?: string   // 设备类型，可选，最大20字符
      status?: DeviceStatus // 设备状态，可选，范围0-3
      location?: string     // 存放位置，可选，最大100字符
    }

    /** 设备添加参数 */
    type DeviceAddParams = Omit<DeviceListItem, 'id' | 'createTime' | 'updateTime'>

    /** 设备更新参数 */
    type DeviceUpdateParams = Partial<DeviceAddParams> & { id: number }

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }
}

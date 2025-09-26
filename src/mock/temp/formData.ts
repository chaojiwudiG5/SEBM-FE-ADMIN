import avatar1 from '@/assets/img/avatar/avatar1.webp'
import avatar2 from '@/assets/img/avatar/avatar2.webp'
import avatar3 from '@/assets/img/avatar/avatar3.webp'
import avatar4 from '@/assets/img/avatar/avatar4.webp'
import avatar5 from '@/assets/img/avatar/avatar5.webp'
import avatar6 from '@/assets/img/avatar/avatar6.webp'
import avatar7 from '@/assets/img/avatar/avatar7.webp'
import avatar8 from '@/assets/img/avatar/avatar8.webp'
import avatar9 from '@/assets/img/avatar/avatar9.webp'
import avatar10 from '@/assets/img/avatar/avatar10.webp'

export interface User {
  id: number
  username: string
  gender: 1 | 0
  mobile: string
  email: string
  dep: string
  status: string
  create_time: string
  avatar: string
}

// 用户列表
export const ACCOUNT_TABLE_DATA: User[] = [
  {
    id: 1,
    username: 'alexmorgan',
    gender: 1,
    mobile: '18670001591',
    email: 'alexmorgan@company.com',
    dep: '研发部',
    status: '1',
    create_time: '2020-09-09 10:01:10',
    avatar: avatar1
  },
  {
    id: 2,
    username: 'sophiabaker',
    gender: 1,
    mobile: '17766664444',
    email: 'sophiabaker@company.com',
    dep: '电商部',
    status: '1',
    create_time: '2020-10-10 13:01:12',
    avatar: avatar2
  },
  {
    id: 3,
    username: 'liampark',
    gender: 1,
    mobile: '18670001597',
    email: 'liampark@company.com',
    dep: '人事部',
    status: '1',
    create_time: '2020-11-14 12:01:45',
    avatar: avatar3
  },
  {
    id: 4,
    username: 'oliviagrant',
    gender: 0,
    mobile: '18670001596',
    email: 'oliviagrant@company.com',
    dep: '产品部',
    status: '1',
    create_time: '2020-11-14 09:01:20',
    avatar: avatar4
  },
  {
    id: 5,
    username: 'emmawilson',
    gender: 0,
    mobile: '18670001595',
    email: 'emmawilson@company.com',
    dep: '财务部',
    status: '1',
    create_time: '2020-11-13 11:01:05',
    avatar: avatar5
  },
  {
    id: 6,
    username: 'noahevan',
    gender: 1,
    mobile: '18670001594',
    email: 'noahevan@company.com',
    dep: '运营部',
    status: '1',
    create_time: '2020-10-11 13:10:26',
    avatar: avatar6
  },
  {
    id: 7,
    username: 'avamartin',
    gender: 1,
    mobile: '18123820191',
    email: 'avamartin@company.com',
    dep: '客服部',
    status: '2',
    create_time: '2020-05-14 12:05:10',
    avatar: avatar7
  },
  {
    id: 8,
    username: 'jacoblee',
    gender: 1,
    mobile: '18670001592',
    email: 'jacoblee@company.com',
    dep: '总经办',
    status: '3',
    create_time: '2020-11-12 07:22:25',
    avatar: avatar8
  },
  {
    id: 9,
    username: 'miaclark',
    gender: 0,
    mobile: '18670001581',
    email: 'miaclark@company.com',
    dep: '研发部',
    status: '4',
    create_time: '2020-06-12 05:04:20',
    avatar: avatar9
  },
  {
    id: 10,
    username: 'ethanharris',
    gender: 1,
    mobile: '13755554444',
    email: 'ethanharris@company.com',
    dep: '研发部',
    status: '1',
    create_time: '2020-11-12 16:01:10',
    avatar: avatar10
  },
  {
    id: 11,
    username: 'isabellamoore',
    gender: 1,
    mobile: '13766660000',
    email: 'isabellamoore@company.com',
    dep: '研发部',
    status: '1',
    create_time: '2020-11-14 12:01:20',
    avatar: avatar6
  },
  {
    id: 12,
    username: 'masonwhite',
    gender: 1,
    mobile: '18670001502',
    email: 'masonwhite@company.com',
    dep: '研发部',
    status: '1',
    create_time: '2020-11-14 12:01:20',
    avatar: avatar7
  },
  {
    id: 13,
    username: 'charlottehall',
    gender: 1,
    mobile: '13006644977',
    email: 'charlottehall@company.com',
    dep: '研发部',
    status: '1',
    create_time: '2020-11-14 12:01:20',
    avatar: avatar8
  },
  {
    id: 14,
    username: 'benjaminscott',
    gender: 0,
    mobile: '13599998888',
    email: 'benjaminscott@company.com',
    dep: '研发部',
    status: '1',
    create_time: '2020-11-14 12:01:20',
    avatar: avatar9
  },
  {
    id: 15,
    username: 'ameliaking',
    gender: 1,
    mobile: '13799998888',
    email: 'ameliaking@company.com',
    dep: '研发部',
    status: '1',
    create_time: '2020-11-14 12:01:20',
    avatar: avatar10
  }
]

export interface Role {
  roleName: string
  roleCode: string
  des: string
  date: string
  enable: boolean
}

// 角色列表
export const ROLE_LIST_DATA: Role[] = [
  {
    roleName: '管理员',
    roleCode: 'R_ADMIN',
    des: '拥有系统管理权限',
    date: '2025-05-15 12:30:45',
    enable: true
  },
  {
    roleName: '普通用户',
    roleCode: 'R_USER',
    des: '拥有系统普通权限',
    date: '2025-05-15 12:30:45',
    enable: true
  },
  {
    roleName: '技工',
    roleCode: 'R_TECHNICIAN',
    des: '负责维护和修理设备',
    date: '2025-05-16 09:15:30',
    enable: true
  }
]

export interface Device {
  id: number
  deviceName: string
  deviceType: string
  status: string
  location: string
  description: string
  image: string
  createTime: string
  updateTime: string
}

// 设备列表数据
export const DEVICE_TABLE_DATA: Device[] = [
  {
    id: 1,
    deviceName: '生产线A-设备001',
    deviceType: '生产设备',
    status: 'normal',
    location: '车间A-01',
    description: '主要用于产品生产加工',
    image: avatar1,
    createTime: '2024-01-15 09:30:00',
    updateTime: '2024-09-20 14:20:00'
  },
  {
    id: 2,
    deviceName: '空调设备-中央空调',
    deviceType: '环境设备',
    status: 'normal',
    location: '办公楼B-03',
    description: '中央空调系统，负责温度调节',
    image: avatar2,
    createTime: '2024-02-10 10:15:00',
    updateTime: '2024-09-15 16:45:00'
  },
  {
    id: 3,
    deviceName: '安全监控-摄像头01',
    deviceType: '安防设备',
    status: 'maintenance',
    location: '大门入口',
    description: '入口安全监控摄像头，需要维修',
    image: avatar3,
    createTime: '2024-03-05 08:20:00',
    updateTime: '2024-09-25 11:30:00'
  },
  {
    id: 4,
    deviceName: '网络交换机-SW01',
    deviceType: '网络设备',
    status: 'normal',
    location: '机房A-02',
    description: '核心网络交换设备',
    image: avatar4,
    createTime: '2024-04-12 14:15:00',
    updateTime: '2024-09-10 09:20:00'
  },
  {
    id: 5,
    deviceName: '测试设备-压力测试仪',
    deviceType: '测试设备',
    status: 'disabled',
    location: '实验室C-05',
    description: '产品质量检测设备，已停用',
    image: avatar5,
    createTime: '2024-05-20 11:30:00',
    updateTime: '2024-08-15 16:45:00'
  }
]

// 设备类型选项
export const DEVICE_TYPE_OPTIONS = [
  { label: '生产设备', value: '生产设备' },
  { label: '环境设备', value: '环境设备' },
  { label: '安防设备', value: '安防设备' },
  { label: '办公设备', value: '办公设备' },
  { label: '网络设备', value: '网络设备' },
  { label: '测试设备', value: '测试设备' }
]

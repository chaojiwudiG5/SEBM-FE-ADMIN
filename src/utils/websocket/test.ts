/**
 * WebSocket功能测试脚本
 * 用于验证WebSocket连接和消息处理功能
 */

import { websocketManager } from './index'
import { useWebSocketStore } from '@/store/modules/websocket'

export class WebSocketTester {
  private websocketStore = useWebSocketStore()
  private testResults: any[] = []

  /**
   * 运行所有测试
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 开始WebSocket功能测试...')
    
    try {
      await this.testConnection()
      await this.testMessageSending()
      await this.testMessageReceiving()
      await this.testReconnection()
      await this.testStoreIntegration()
      
      this.printTestResults()
    } catch (error) {
      console.error('❌ 测试过程中发生错误:', error)
    }
  }

  /**
   * 测试连接功能
   */
  private async testConnection(): Promise<void> {
    console.log('🔌 测试连接功能...')
    
    try {
      // 初始化连接
      await websocketManager.init()
      
      // 等待连接建立
      await this.waitForConnection()
      
      this.addTestResult('连接测试', 'PASS', 'WebSocket连接成功建立')
    } catch (error) {
      this.addTestResult('连接测试', 'FAIL', `连接失败: ${error}`)
    }
  }

  /**
   * 测试消息发送
   */
  private async testMessageSending(): Promise<void> {
    console.log('📤 测试消息发送...')
    
    try {
      const testMessage = {
        content: '这是一条测试消息',
        timestamp: Date.now()
      }
      
      const success = websocketManager.sendMessage('test', testMessage)
      
      if (success) {
        this.addTestResult('消息发送测试', 'PASS', '消息发送成功')
      } else {
        this.addTestResult('消息发送测试', 'FAIL', '消息发送失败')
      }
    } catch (error) {
      this.addTestResult('消息发送测试', 'FAIL', `发送错误: ${error}`)
    }
  }

  /**
   * 测试消息接收
   */
  private async testMessageReceiving(): Promise<void> {
    console.log('📥 测试消息接收...')
    
    try {
      // 发送一条消息并等待接收
      const testMessage = {
        content: '接收测试消息',
        timestamp: Date.now()
      }
      
      websocketManager.sendMessage('test', testMessage)
      
      // 等待消息被处理
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const messages = websocketManager.getLatestMessages(1)
      const hasMessage = messages.length > 0
      
      if (hasMessage) {
        this.addTestResult('消息接收测试', 'PASS', '消息接收正常')
      } else {
        this.addTestResult('消息接收测试', 'FAIL', '未接收到消息')
      }
    } catch (error) {
      this.addTestResult('消息接收测试', 'FAIL', `接收错误: ${error}`)
    }
  }

  /**
   * 测试重连功能
   */
  private async testReconnection(): Promise<void> {
    console.log('🔄 测试重连功能...')
    
    try {
      // 断开连接
      websocketManager.disconnect()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 重连
      websocketManager.reconnect()
      await this.waitForConnection()
      
      this.addTestResult('重连测试', 'PASS', '重连功能正常')
    } catch (error) {
      this.addTestResult('重连测试', 'FAIL', `重连错误: ${error}`)
    }
  }

  /**
   * 测试Store集成
   */
  private async testStoreIntegration(): Promise<void> {
    console.log('🏪 测试Store集成...')
    
    try {
      // 测试通知添加
      const testNotification = {
        title: '测试通知',
        message: '这是一条测试通知',
        timestamp: Date.now()
      }
      
      this.websocketStore.addNotification(testNotification)
      
      const notifications = this.websocketStore.notifications
      const hasNotification = notifications.length > 0
      
      if (hasNotification) {
        this.addTestResult('Store集成测试', 'PASS', 'Store集成正常')
      } else {
        this.addTestResult('Store集成测试', 'FAIL', 'Store集成异常')
      }
    } catch (error) {
      this.addTestResult('Store集成测试', 'FAIL', `Store错误: ${error}`)
    }
  }

  /**
   * 等待连接建立
   */
  private async waitForConnection(timeout: number = 5000): Promise<void> {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      if (websocketManager.getStatus() === 'connected') {
        return
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    throw new Error('连接超时')
  }

  /**
   * 添加测试结果
   */
  private addTestResult(testName: string, status: 'PASS' | 'FAIL', message: string): void {
    this.testResults.push({
      test: testName,
      status,
      message,
      timestamp: new Date().toLocaleString()
    })
  }

  /**
   * 打印测试结果
   */
  private printTestResults(): void {
    console.log('\n📊 WebSocket测试结果:')
    console.log('='.repeat(50))
    
    let passCount = 0
    let failCount = 0
    
    this.testResults.forEach(result => {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌'
      console.log(`${statusIcon} ${result.test}: ${result.message}`)
      
      if (result.status === 'PASS') {
        passCount++
      } else {
        failCount++
      }
    })
    
    console.log('='.repeat(50))
    console.log(`总计: ${this.testResults.length} 项测试`)
    console.log(`通过: ${passCount} 项`)
    console.log(`失败: ${failCount} 项`)
    console.log(`成功率: ${((passCount / this.testResults.length) * 100).toFixed(1)}%`)
    
    if (failCount === 0) {
      console.log('🎉 所有测试通过！WebSocket功能正常')
    } else {
      console.log('⚠️ 部分测试失败，请检查相关功能')
    }
  }

  /**
   * 清理测试数据
   */
  cleanup(): void {
    this.websocketStore.clearAll()
    this.testResults = []
  }
}

// 导出测试器实例
export const websocketTester = new WebSocketTester()

// 在开发环境下自动运行测试
if (import.meta.env.DEV) {
  // 延迟运行测试，确保应用完全加载
  setTimeout(() => {
    console.log('🚀 开发环境自动运行WebSocket测试...')
    websocketTester.runAllTests()
  }, 3000)
}

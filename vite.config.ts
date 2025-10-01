import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath } from 'url'
import vueDevTools from 'vite-plugin-vue-devtools'
// import { visualizer } from 'rollup-plugin-visualizer'

export default ({ mode }: { mode: string }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL, VITE_API_URL, VITE_API_PROXY_URL, VITE_DROP_CONSOLE } = env

  console.log(`🚀 API_URL = ${VITE_API_URL}`)
  console.log(`🚀 API_PROXY_URL = ${VITE_API_PROXY_URL}`)
  console.log(`🚀 VERSION = ${VITE_VERSION}`)
  console.log(`🚀 DROP_CONSOLE = ${VITE_DROP_CONSOLE}`)

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    server: {
      port: Number(VITE_PORT),
      proxy: {
        '/api': {
          target: VITE_API_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔄 代理请求:', req.method, req.url, '→', (options.target || '') + (req.url || ''))
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ 代理响应:', proxyRes.statusCode, req.url || '')
            })
            proxy.on('error', (err, req, res) => {
              console.error('❌ 代理错误:', err.message, 'URL:', req.url || '')
            })
          }
        }
      },
      host: true,
      cors: true
    },
    // 预览服务器配置（生产环境预览时使用）
    preview: {
      port: Number(VITE_PORT),
      proxy: {
        '/api': {
          target: VITE_API_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('🔄 预览代理请求:', req.method, req.url, '→', (options.target || '') + (req.url || ''))
            })
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('✅ 预览代理响应:', proxyRes.statusCode, req.url || '')
            })
            proxy.on('error', (err, req, res) => {
              console.error('❌ 预览代理错误:', err.message, 'URL:', req.url || '')
            })
          }
        }
      },
      host: true,
      cors: true
    },
    // 路径别名
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@views': resolvePath('src/views'),
        '@imgs': resolvePath('src/assets/img'),
        '@icons': resolvePath('src/assets/icons'),
        '@utils': resolvePath('src/utils'),
        '@stores': resolvePath('src/store'),
        '@plugins': resolvePath('src/plugins'),
        '@styles': resolvePath('src/assets/styles')
      }
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      minify: 'terser',
      terserOptions: {
        compress: {
          // 根据环境变量决定是否去除 console
          drop_console: VITE_DROP_CONSOLE === 'true',
          // 根据环境变量决定是否去除 debugger
          drop_debugger: VITE_DROP_CONSOLE === 'true'
        }
      },
      dynamicImportVarsOptions: {
        warnOnError: true,
        exclude: [],
        include: ['src/views/**/*.vue']
      }
    },
    plugins: [
      vue(),
      // 自动导入 components 目录下的组件
      Components({
        deep: true,
        extensions: ['vue'],
        dirs: ['src/components'],
        resolvers: [ElementPlusResolver({ importStyle: false })],
        dts: 'src/types/components.d.ts'
      }),
      // 自动导入组件 Api
      AutoImport({
        imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/auto-imports.d.ts',
        // ESLint 配置
        eslintrc: {
          // 首次运行时设置为 true 生成配置文件，之后改为 false
          enabled: true,
          // ESLint 配置文件路径
          filepath: './.auto-import.json',
          // 允许全局使用自动导入的 API
          globalsPropValue: true
        }
      }),
      // 压缩
      viteCompression({
        verbose: false, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用
        algorithm: 'gzip', // 压缩算法
        ext: '.gz', // 压缩后的文件名后缀
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240B = 10KB
        deleteOriginFile: false // 压缩后是否删除原文件
      }),
      vueDevTools()
      // 打包分析
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'dist/stats.html' // 分析图生成的文件名及路径
      // }),
    ],
    css: {
      preprocessorOptions: {
        // sass variable and mixin
        scss: {
          api: 'modern-compiler',
          additionalData: `
            @use "@styles/variables.scss" as *; 
            @use "@styles/mixin.scss" as *;
          `
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  })
}

function resolvePath(paths: string) {
  return path.resolve(__dirname, paths)
}

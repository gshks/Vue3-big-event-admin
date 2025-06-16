import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore(
  'big-event-theme',
  () => {
    // 主题模式：'light' | 'dark'
    const theme = ref('light')

    // 设置主题
    const setTheme = (newTheme) => {
      // 确保新主题是有效的字符串值
      const validTheme = typeof newTheme === 'object' && newTheme.theme 
        ? newTheme.theme 
        : (typeof newTheme === 'string' ? newTheme : 'light')
      
      console.log('设置新主题:', validTheme)
      theme.value = validTheme
      applyTheme(validTheme)
      localStorage.setItem('big-event-theme', validTheme)
    }

    // 切换主题
    const toggleTheme = () => {
      const currentTheme = typeof theme.value === 'object' ? theme.value.theme : theme.value
      console.log('当前主题状态:', currentTheme)
      const newTheme = currentTheme === 'light' ? 'dark' : 'light'
      setTheme(newTheme)
    }

    // 应用主题到DOM
    const applyTheme = (themeName) => {
      themeName = typeof themeName === 'object' ? themeName.theme : themeName
      
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', themeName)
        if (themeName === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      })
    }

    // 初始化主题
    const initTheme = () => {
      let savedTheme = localStorage.getItem('big-event-theme')
      
      // 处理存储的主题可能是对象的情况
      try {
        const parsedTheme = JSON.parse(savedTheme)
        if (typeof parsedTheme === 'object' && parsedTheme.theme) {
          savedTheme = parsedTheme.theme
        }
      } catch (e) {
        // 如果解析失败，说明savedTheme是字符串，直接使用
      }

      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme)
      } else {
        // 检测系统主题偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }

      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('big-event-theme')) {
          setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }

    return {
      theme,
      setTheme,
      toggleTheme,
      initTheme
    }
  },
  {
    persist: {
      key: 'big-event-theme',
      storage: localStorage,
      paths: ['theme']
    }
  }
)
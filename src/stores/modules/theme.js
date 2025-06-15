import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore(
  'big-event-theme',
  () => {
    // 主题模式：'light' | 'dark'
    const theme = ref('light')
    
    // 设置主题
    const setTheme = (newTheme) => {
      theme.value = newTheme
      applyTheme(newTheme)
    }
    
    // 切换主题
    const toggleTheme = () => {
      const newTheme = theme.value === 'light' ? 'dark' : 'light'
      setTheme(newTheme)
    }
    
    // 应用主题到DOM
    const applyTheme = (themeName) => {
      document.documentElement.setAttribute('data-theme', themeName)
      
      // 为了 Element Plus 的主题切换
      if (themeName === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // 初始化主题
    const initTheme = () => {
      // 优先使用本地存储的主题，否则检测系统主题
      const savedTheme = localStorage.getItem('big-event-theme')
      if (savedTheme) {
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
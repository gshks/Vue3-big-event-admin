<script setup>
import {
  Management,
  Promotion,
  UserFilled,
  User,
  Crop,
  EditPen,
  SwitchButton,
  CaretBottom,
  Moon,
  Sunny,
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
import { useUserStore } from '@/stores'
import { useThemeStore } from '@/stores/modules/theme'
import { onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import LanguageSwitch from '@/components/LanguageSwitch.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()
const themeStore = useThemeStore()
const router = useRouter()

// 在组件挂载时初始化主题
onMounted(() => {
  userStore.getUser()
  // 确保主题初始化正确
  nextTick(() => {
    themeStore.initTheme()
  })
})

const handleCommand = async (key) => {
  if (key === 'logout') {
    // 退出操作
    await ElMessageBox.confirm(t('layout.logoutConfirm'), t('layout.logoutTitle'), {
      type: 'warning',
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
    })

    // 清除本地的数据 (token + user信息)
    userStore.removeToken()
    userStore.setUser({})
    router.push('/login')
  } else {
    // 跳转操作
    router.push(`/user/${key}`)
  }
}

// 主题切换处理
const handleThemeToggle = () => {
  const currentTheme =
    typeof themeStore.theme === 'object' ? themeStore.theme.theme : themeStore.theme

  console.log('切换前主题:', currentTheme)
  themeStore.toggleTheme()
  console.log('切换后主题:', themeStore.theme)
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="el-aside__logo"></div>
      <el-menu
        :active-text-color="
          (typeof themeStore.theme === 'object' ? themeStore.theme.theme : themeStore.theme) ===
          'dark'
            ? '#ffd04b'
            : '#409eff'
        "
        :background-color="
          (typeof themeStore.theme === 'object' ? themeStore.theme.theme : themeStore.theme) ===
          'dark'
            ? '#1a1a1a'
            : '#232323'
        "
        :default-active="$route.path"
        :text-color="
          (typeof themeStore.theme === 'object' ? themeStore.theme.theme : themeStore.theme) ===
          'dark'
            ? '#e4e6ea'
            : '#fff'
        "
        router
      >
        <el-menu-item index="/article/channel">
          <el-icon><Management /></el-icon>
          <span>{{ t('menu.category') }}</span>
        </el-menu-item>
        <el-menu-item index="/article/manage">
          <el-icon><Promotion /></el-icon>
          <span>{{ t('menu.article') }}</span>
        </el-menu-item>

        <el-sub-menu index="/user">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>{{ t('menu.profile') }}</span>
          </template>

          <el-menu-item index="/user/profile">
            <el-icon><User /></el-icon>
            <span>{{ t('menu.basicInfo') }}</span>
          </el-menu-item>
          <el-menu-item index="/user/avatar">
            <el-icon><Crop /></el-icon>
            <span>{{ t('menu.avatar') }}</span>
          </el-menu-item>
          <el-menu-item index="/user/password">
            <el-icon><EditPen /></el-icon>
            <span>{{ t('menu.password') }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          {{ t('layout.company') }}：<strong>{{ userStore.user.nickname || userStore.user.username }}</strong>
        </div>
        <div class="header-right">
          <!-- 语言切换组件 -->
          <LanguageSwitch />

          <!-- 主题切换按钮 -->
          <el-tooltip
            :content="
              (typeof themeStore.theme === 'object' ? themeStore.theme.theme : themeStore.theme) ===
              'light'
                ? t('layout.switchToDark')
                : t('layout.switchToLight')
            "
            placement="bottom"
          >
            <el-button
              :icon="
                (typeof themeStore.theme === 'object'
                  ? themeStore.theme.theme
                  : themeStore.theme) === 'dark'
                  ? Moon
                  : Sunny
              "
              link
              circle
              size="small"
              @click="handleThemeToggle"
              class="theme-toggle-btn"
            />
          </el-tooltip>

          <!-- 用户下拉菜单 -->
          <el-dropdown placement="bottom-end" @command="handleCommand">
            <span class="el-dropdown__box">
              <el-avatar :src="userStore.user.user_pic || avatar" />
              <el-icon><CaretBottom /></el-icon>
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" :icon="User">{{ t('menu.basicInfo') }}</el-dropdown-item>
                <el-dropdown-item command="avatar" :icon="Crop">{{ t('menu.avatar') }}</el-dropdown-item>
                <el-dropdown-item command="password" :icon="EditPen">{{ t('menu.password') }}</el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton">{{ t('common.logout') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>{{ t('layout.footer') }}</el-footer>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  transition: var(--theme-transition);

  .el-aside {
    background-color: var(--aside-bg-color);
    transition: var(--theme-transition);

    &__logo {
      height: 120px;
      background: url('@/assets/logo.png') no-repeat center / 120px auto;
      transition: var(--theme-transition);
    }

    .el-menu {
      border-right: none;
      transition: var(--theme-transition);
    }
  }

  .el-header {
    background-color: var(--header-bg-color);
    border-bottom: 1px solid var(--header-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: var(--theme-transition);
    color: var(--header-text-color);

    .header-left {
      color: var(--text-color-primary);
      transition: var(--theme-transition);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;

      .theme-toggle-btn {
        transition: var(--theme-transition);

        &:hover {
          transform: scale(1.1);
        }
      }

      .el-dropdown__box {
        display: flex;
        align-items: center;

        .el-icon {
          color: var(--text-color-secondary);
          margin-left: 10px;
          transition: var(--theme-transition);
        }

        &:active,
        &:focus {
          outline: none;
        }
      }
    }
  }

  .el-main {
    background-color: var(--main-bg-color);
    transition: var(--theme-transition);
  }

  .el-footer {
    background-color: var(--header-bg-color);
    border-top: 1px solid var(--header-border-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--text-color-secondary);
    transition: var(--theme-transition);
  }
}
</style>

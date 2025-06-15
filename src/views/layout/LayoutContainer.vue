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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const themeStore = useThemeStore()
const router = useRouter()

onMounted(() => {
  userStore.getUser()
  themeStore.initTheme()
})

const handleCommand = async (key) => {
  if (key === 'logout') {
    // 退出操作
    await ElMessageBox.confirm('你确认要进行退出么', '温馨提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
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
  themeStore.toggleTheme()
}
</script>

<template>
  <!--
    el-menu 整个菜单组件
      :default-active="$route.path"  配置默认高亮的菜单项
      router  router选项开启，el-menu-item 的 index 就是点击跳转的路径

    el-menu-item 菜单项
      index="/article/channel" 配置的是访问的跳转路径，配合default-active的值，实现高亮
  -->
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="el-aside__logo"></div>
      <el-menu
        :active-text-color="themeStore.theme === 'dark' ? '#ffd04b' : '#409eff'"
        :background-color="themeStore.theme === 'dark' ? '#1a1a1a' : '#232323'"
        :default-active="$route.path"
        :text-color="themeStore.theme === 'dark' ? '#e4e6ea' : '#fff'"
        router
      >
        <el-menu-item index="/article/channel">
          <el-icon><Management /></el-icon>
          <span>文章分类</span>
        </el-menu-item>
        <el-menu-item index="/article/manage">
          <el-icon><Promotion /></el-icon>
          <span>文章管理</span>
        </el-menu-item>

        <el-sub-menu index="/user">
          <!-- 多级菜单的标题 - 具名插槽 title -->
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>个人中心</span>
          </template>

          <!-- 展开的内容 - 默认插槽 -->
          <el-menu-item index="/user/profile">
            <el-icon><User /></el-icon>
            <span>基本资料</span>
          </el-menu-item>
          <el-menu-item index="/user/avatar">
            <el-icon><Crop /></el-icon>
            <span>更换头像</span>
          </el-menu-item>
          <el-menu-item index="/user/password">
            <el-icon><EditPen /></el-icon>
            <span>重置密码</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-left">
          黑马程序员：<strong>{{ userStore.user.nickname || userStore.user.username }}</strong>
        </div>
        <div class="header-right">
          <!-- 主题切换按钮 -->
          <el-tooltip
            :content="themeStore.theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'"
            placement="bottom"
          >
            <el-button
              :icon="themeStore.theme === 'dark' ? Moon : Sunny"
              circle
              size="small"
              @click="handleThemeToggle"
              class="theme-toggle-btn"
            />
          </el-tooltip>

          <!-- 用户下拉菜单 -->
          <el-dropdown placement="bottom-end" @command="handleCommand">
            <!-- 展示给用户，默认看到的 -->
            <span class="el-dropdown__box">
              <el-avatar :src="userStore.user.user_pic || avatar" />
              <el-icon><CaretBottom /></el-icon>
            </span>

            <!-- 折叠的下拉部分 -->
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" :icon="User">基本资料</el-dropdown-item>
                <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
                <el-dropdown-item command="password" :icon="EditPen">重置密码</el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>大事件 ©2023 Created by 黑马程序员</el-footer>
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

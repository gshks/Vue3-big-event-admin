<template>
  <el-dropdown @command="handleCommand">
    <span class="language-switch">
      {{ currentLanguage === 'zh' ? '中文' : 'English' }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh">中文</el-dropdown-item>
        <el-dropdown-item command="en">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'

const { locale } = useI18n()

const currentLanguage = computed(() => locale.value)

const handleCommand = (command) => {
  locale.value = command
  localStorage.setItem('language', command)
}
</script>

<style scoped>
.language-switch {
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  color: var(--el-text-color-primary);
  transition: all 0.2s ease;
  font-size: var(--el-font-size-base);
  gap: 4px;
}

.language-switch:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-3);
  background-color: var(--el-color-primary-light-9);
}

.language-switch .el-icon--right {
  margin-left: 0;
}
</style>

<template>
  <div class="channel-skeleton">
    <!-- 搜索和按钮区域骨架 -->
    <div class="header-skeleton" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
      <el-skeleton-item variant="button" style="width: 250px; margin-right: 10px" />
      <el-skeleton-item variant="button" style="width: 100px" />
    </div>

    <!-- 表格骨架 -->
    <div v-for="i in 5" :key="i" class="table-row-skeleton"
         style="display: flex; padding: 12px; border-bottom: 1px solid #f0f0f0;">
      <el-skeleton-item variant="text" style="width: 10%" />
      <el-skeleton-item variant="text" style="width: 35%; margin: 0 20px" />
      <el-skeleton-item variant="text" style="width: 35%; margin: 0 20px" />
      <div style="display: flex; gap: 10px;">
        <el-skeleton-item variant="button" style="width: 32px; height: 32px; border-radius: 16px" />
        <el-skeleton-item variant="button" style="width: 32px; height: 32px; border-radius: 16px" />
      </div>
    </div>
  </div>
</template>

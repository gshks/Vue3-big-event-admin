<template>
  <div class="article-skeleton">
    <!-- 搜索和按钮区域骨架 -->
    <div class="header-skeleton" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
      <el-skeleton-item variant="button" style="width: 250px; margin-right: 10px" />
      <el-skeleton-item variant="button" style="width: 100px" />
    </div>

    <!-- 表单筛选区域骨架 -->
    <div class="form-skeleton" style="display: flex; margin-bottom: 20px;">
      <el-skeleton-item variant="text" style="width: 200px; margin-right: 20px" />
      <el-skeleton-item variant="text" style="width: 200px; margin-right: 20px" />
      <el-skeleton-item variant="button" style="width: 80px; margin-right: 10px" />
      <el-skeleton-item variant="button" style="width: 80px" />
    </div>

    <!-- 表格骨架 -->
    <div v-for="i in 5" :key="i" class="table-row-skeleton"
         style="display: flex; padding: 12px; border-bottom: 1px solid #f0f0f0;">
      <el-skeleton-item variant="text" style="width: 30%" />
      <el-skeleton-item variant="text" style="width: 20%; margin: 0 20px" />
      <el-skeleton-item variant="text" style="width: 20%; margin: 0 20px" />
      <el-skeleton-item variant="text" style="width: 15%; margin: 0 20px" />
      <div style="display: flex; gap: 10px;">
        <el-skeleton-item variant="button" style="width: 32px; height: 32px; border-radius: 16px" />
        <el-skeleton-item variant="button" style="width: 32px; height: 32px; border-radius: 16px" />
      </div>
    </div>

    <!-- 分页骨架 -->
    <div class="pagination-skeleton" style="display: flex; justify-content: flex-end; margin-top: 20px;">
      <el-skeleton-item variant="text" style="width: 300px" />
    </div>
  </div>
</template>

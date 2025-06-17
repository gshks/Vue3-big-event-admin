<template>
  <div class="search-skeleton">
    <!-- 搜索框骨架 -->
    <div class="search-header-skeleton" style="max-width: 600px; margin: 0 auto 20px;">
      <el-skeleton-item variant="input" style="width: 100%; height: 40px;" />
    </div>

    <!-- 选项卡骨架 -->
    <div class="tabs-skeleton" style="display: flex; gap: 20px; margin-bottom: 20px;">
      <el-skeleton-item v-for="i in 4" :key="i" variant="text" style="width: 80px" />
    </div>

    <!-- 搜索结果骨架 -->
    <div v-for="i in 5" :key="i" class="result-item-skeleton"
         style="padding: 15px; border-bottom: 1px solid #ebeef5;">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h3" style="width: 50%; margin-bottom: 10px" />
          <el-skeleton-item variant="text" style="width: 80%" />
          <el-skeleton-item variant="text" style="width: 70%" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

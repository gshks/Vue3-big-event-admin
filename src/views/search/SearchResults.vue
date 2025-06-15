<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import SmartSearch from '@/components/SmartSearch.vue'
import { searchService } from '@/api/search'

const route = useRoute()
const searchResults = ref([])
const loading = ref(false)
const activeTab = ref('all')

// 模拟搜索结果数据（实际项目中应该从API获取）
const mockSearchResults = {
  articles: [
    { id: 1, title: '文章标题1', content: '文章内容1...', type: 'article' },
    { id: 2, title: '文章标题2', content: '文章内容2...', type: 'article' },
  ],
  categories: [
    { id: 1, name: '分类1', description: '分类描述1', type: 'category' },
    { id: 2, name: '分类2', description: '分类描述2', type: 'category' },
  ],
  users: [
    { id: 1, username: '用户1', email: 'user1@example.com', type: 'user' },
    { id: 2, username: '用户2', email: 'user2@example.com', type: 'user' },
  ],
}

// 监听路由参数变化
watch(
  () => route.query.q,
  async (newQuery) => {
    if (newQuery) {
      await performSearch(newQuery)
    }
  },
  { immediate: true }
)

// 执行搜索
const performSearch = async (query) => {
  loading.value = true
  try {
    const res = await searchService(query)
    searchResults.value = res.data.results
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试')
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

// 根据类型过滤结果
const filteredResults = computed(() => {
  if (activeTab.value === 'all') {
    return searchResults.value
  }
  return searchResults.value.filter((item) => item.type === activeTab.value)
})

// 高亮显示匹配文本
const highlightText = (text, query) => {
  if (!query) return text
  const reg = new RegExp(query, 'gi')
  return text.replace(reg, (match) => `<span class="highlight">${match}</span>`)
}
</script>

<template>
  <div class="search-results">
    <div class="search-header">
      <SmartSearch :placeholder="'搜索...'" />
    </div>

    <div class="search-content">
      <el-tabs v-model="activeTab" class="search-tabs">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="文章" name="article" />
        <el-tab-pane label="分类" name="category" />
        <el-tab-pane label="用户" name="user" />
      </el-tabs>

      <div v-loading="loading" class="results-list">
        <template v-if="filteredResults.length > 0">
          <div v-for="item in filteredResults" :key="item.id" class="result-item">
            <template v-if="item.type === 'article'">
              <h3 v-html="highlightText(item.title, route.query.q)"></h3>
              <p v-html="highlightText(item.content, route.query.q)"></p>
            </template>

            <template v-else-if="item.type === 'category'">
              <h3 v-html="highlightText(item.name, route.query.q)"></h3>
              <p v-html="highlightText(item.description, route.query.q)"></p>
            </template>

            <template v-else-if="item.type === 'user'">
              <h3 v-html="highlightText(item.username, route.query.q)"></h3>
              <p v-html="highlightText(item.email, route.query.q)"></p>
            </template>
          </div>
        </template>

        <el-empty v-else description="暂无搜索结果" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-results {
  padding: 20px;

  .search-header {
    max-width: 600px;
    margin: 0 auto 20px;
  }

  .search-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .search-tabs {
    margin-bottom: 20px;
  }

  .results-list {
    min-height: 200px;
  }

  .result-item {
    padding: 15px;
    border-bottom: 1px solid #ebeef5;
    cursor: pointer;

    &:hover {
      background-color: #f5f7fa;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 16px;
      color: #303133;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: #606266;
    }
  }
}

:deep(.highlight) {
  color: #409eff;
  font-weight: bold;
}
</style>

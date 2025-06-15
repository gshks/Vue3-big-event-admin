<script setup>
import { ref, computed, watch } from 'vue'
import { Search, Delete, Clock } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { searchService } from '@/api/search'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索...',
  },
})

const router = useRouter()
const searchQuery = ref('')
const showSuggestions = ref(false)
const searchHistory = ref(JSON.parse(localStorage.getItem('searchHistory') || '[]'))
const maxHistoryItems = 5

// 模拟的搜索建议数据（实际项目中应该从API获取）
const suggestions = ref([])

// 监听搜索输入
watch(searchQuery, async (newValue) => {
  if (newValue.trim()) {
    try {
      const res = await searchService(newValue)
      suggestions.value = res.data.results
      showSuggestions.value = true
    } catch (error) {
      console.error('Search error:', error)
      suggestions.value = []
    }
  } else {
    suggestions.value = []
    showSuggestions.value = false
  }
})

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  // 添加到搜索历史
  addToHistory(searchQuery.value)

  // 执行搜索
  performSearch(searchQuery.value)
}

// 添加到搜索历史
const addToHistory = (query) => {
  const index = searchHistory.value.indexOf(query)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(query)
  if (searchHistory.value.length > maxHistoryItems) {
    searchHistory.value.pop()
  }
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清除搜索历史
const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

// 执行搜索
const performSearch = (query) => {
  // 这里应该根据实际需求实现搜索逻辑
  // 例如跳转到搜索结果页面
  router.push({
    path: '/search',
    query: { q: query },
  })
  showSuggestions.value = false
}

// 高亮显示匹配文本
const highlightText = (text, query) => {
  if (!query) return text
  const reg = new RegExp(query, 'gi')
  return text.replace(reg, (match) => `<span class="highlight">${match}</span>`)
}
</script>

<template>
  <div class="smart-search">
    <div class="search-input-wrapper">
      <el-input
        v-model="searchQuery"
        :placeholder="placeholder"
        class="search-input"
        @focus="showSuggestions = true"
        @blur="setTimeout(() => (showSuggestions = false), 200)"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 搜索建议和历史记录 -->
    <div v-show="showSuggestions" class="search-suggestions">
      <!-- 搜索建议 -->
      <div v-if="suggestions.length > 0" class="suggestions-section">
        <div class="section-title">搜索建议</div>
        <div
          v-for="item in suggestions"
          :key="item.id"
          class="suggestion-item"
          @mousedown="performSearch(item.title)"
        >
          <el-icon><Search /></el-icon>
          <span v-html="highlightText(item.title, searchQuery)"></span>
        </div>
      </div>

      <!-- 搜索历史 -->
      <div v-if="searchHistory.length > 0" class="history-section">
        <div class="section-header">
          <div class="section-title">
            <el-icon><Clock /></el-icon>
            搜索历史
          </div>
          <el-button type="text" class="clear-history" @click="clearHistory">
            <el-icon><Delete /></el-icon>
            清空历史
          </el-button>
        </div>
        <div
          v-for="(item, index) in searchHistory"
          :key="index"
          class="history-item"
          @mousedown="performSearch(item)"
        >
          <el-icon><Clock /></el-icon>
          <span>{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.smart-search {
  position: relative;
  width: 100%;
  max-width: 600px;

  .search-input-wrapper {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    z-index: 1000;
    margin-top: 5px;
    padding: 10px 0;
  }

  .suggestions-section,
  .history-section {
    padding: 0 10px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .section-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .suggestion-item,
  .history-item {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  .clear-history {
    font-size: 12px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

:deep(.highlight) {
  color: #409eff;
  font-weight: bold;
}
</style>

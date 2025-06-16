<script setup>
import { ref, computed, onMounted } from 'vue'
import { Edit, Delete, Search, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { artGetChannelsService, artDelChannelService } from '../../api/article'
import ChannelEdit from './components/ChannelEdit.vue'

const channelList = ref([])
const loading = ref(false)
const dialog = ref()
const searchText = ref('')
const showSearchHistory = ref(false)
const searchHistory = ref([])
const searchInputRef = ref()

// 搜索历史的本地存储键名
const SEARCH_HISTORY_KEY = 'article_category_search_history'
const MAX_HISTORY_COUNT = 10 // 最大历史记录数量

const getChannelList = async () => {
  loading.value = true
  const res = await artGetChannelsService()
  channelList.value = res.data.data
  loading.value = false
}

// 从本地存储加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
    searchHistory.value = []
  }
}

// 保存搜索历史到本地存储
const saveSearchHistory = () => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 添加搜索记录
const addToSearchHistory = (searchTerm) => {
  if (!searchTerm.trim()) return
  
  // 移除重复项
  const filteredHistory = searchHistory.value.filter(item => item !== searchTerm)
  
  // 添加到开头
  searchHistory.value = [searchTerm, ...filteredHistory].slice(0, MAX_HISTORY_COUNT)
  
  // 保存到本地存储
  saveSearchHistory()
}

// 清空搜索历史
const clearSearchHistory = (event) => {
  event.stopPropagation() // 阻止事件冒泡
  searchHistory.value = []
  saveSearchHistory()
  ElMessage.success('搜索历史已清空')
  showSearchHistory.value = false // 清空后关闭历史栏
}

// 删除单个搜索历史记录
const removeSearchHistoryItem = (index, event) => {
  event.stopPropagation() // 阻止事件冒泡
  searchHistory.value.splice(index, 1)
  saveSearchHistory()
}

onMounted(() => {
  getChannelList()
  loadSearchHistory()
})

// 计算过滤后的频道列表
const filteredChannelList = computed(() => {
  if (!searchText.value) {
    return channelList.value
  }
  return channelList.value.filter(channel =>
    channel.cate_name.includes(searchText.value) || 
    channel.cate_alias.includes(searchText.value)
  )
})

// 处理搜索
const handleSearch = () => {
  if (searchText.value.trim()) {
    addToSearchHistory(searchText.value.trim())
  }
  showSearchHistory.value = false

  // 搜索后判断是否有结果
  if (searchText.value && filteredChannelList.value.length === 0) {
    ElMessage.info('没有该文章分类')
  }
}

// 搜索框获得焦点时显示搜索历史
const onSearchFocus = () => {
  showSearchHistory.value = true
}

// 搜索框失去焦点时隐藏搜索历史
const onSearchBlur = (event) => {
  // 检查失焦的目标是否在搜索历史区域内
  const searchContainer = event.target.closest('.search-container')
  const relatedTarget = event.relatedTarget
  
  // 如果点击的是搜索历史区域内的元素，不隐藏
  if (relatedTarget && searchContainer && searchContainer.contains(relatedTarget)) {
    return
  }
  
  // 延迟隐藏，给点击历史记录留时间
  setTimeout(() => {
    showSearchHistory.value = false
  }, 150)
}

// 点击搜索历史记录
const onHistoryItemClick = (historyItem) => {
  searchText.value = historyItem
  showSearchHistory.value = false
  handleSearch()
}

// 按回车键搜索
const onSearchKeyup = (event) => {
  if (event.key === 'Enter') {
    handleSearch()
  }
}

const onDelChannel = async (row) => {
  await ElMessageBox.confirm('你确认要删除该分类么', '温馨提示', {
    type: 'warning',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  })
  await artDelChannelService(row.id)
  ElMessage.success('删除成功')
  getChannelList()
}

const onEditChannel = (row) => {
  dialog.value.open(row)
}

const onAddChannel = () => {
  dialog.value.open({})
}

const onSuccess = () => {
  getChannelList()
}
</script>

<template>
  <page-container title="文章分类">
    <template #extra>
      <div style="display: flex; align-items: center;">
        <div class="search-container">
          <div class="search-input-group">
            <el-input
              ref="searchInputRef"
              v-model="searchText"
              placeholder="搜索文章分类"
              :prefix-icon="Search"
              style="width: 250px;"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
              @keyup="onSearchKeyup"
            ></el-input>
            <el-button 
              type="primary" 
              @click="handleSearch"
              style="margin-left: 0;"
              class="search-btn"
            >
              搜索
            </el-button>
          </div>
          
          <div
            v-show="showSearchHistory && searchHistory.length > 0"
            class="search-history-dropdown"
            @mousedown.prevent
          >
            <div class="search-history-header">
              <span class="history-title">
                <el-icon><Clock /></el-icon>
                搜索历史
              </span>
              <el-button 
                type="text" 
                size="small" 
                @click="clearSearchHistory"
                class="clear-history-btn"
              >
                清空
              </el-button>
            </div>
            <div class="search-history-list">
              <div 
                v-for="(item, index) in searchHistory" 
                :key="index"
                class="history-item"
                @click="onHistoryItemClick(item)"
              >
                <span class="history-text">{{ item }}</span>
                <el-icon 
                  class="delete-icon" 
                  @click="removeSearchHistoryItem(index, $event)"
                >
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
        
      <el-button @click="onAddChannel" style="margin-left: 10px;" type="primary">添加分类</el-button>
      </div>
    </template>

    <el-table v-loading="loading" :data="filteredChannelList" style="width: 100%">
      <el-table-column type="index" label="序号" width="100"></el-table-column>
      <el-table-column prop="cate_name" label="分类名称"></el-table-column>
      <el-table-column prop="cate_alias" label="分类别名"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row, $index }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="onEditChannel(row, $index)"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="onDelChannel(row, $index)"
          ></el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty description="没有数据"></el-empty>
      </template>
    </el-table>

    <channel-edit ref="dialog" @success="onSuccess"></channel-edit>
  </page-container>
</template>

<style lang="scss" scoped>
.search-container {
  position: relative;
  // display: inline-block; // 移除这个，因为它会被外部的 flex 容器管理
}

.search-input-group {
  display: flex;
  align-items: center; // 确保搜索输入框和搜索按钮对齐
}

.search-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: none;
}

// 解决 ElInput 和 ElButton 可能存在的微小高度差异，使它们顶部对齐
// 如果发现输入框还是高一点点，可能需要微调这里
.search-container :deep(.el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  // 可以尝试在这里增加或减少 padding-top/padding-bottom，或者固定 height
  // 例如: height: var(--el-component-size); 或 padding: calc((var(--el-component-size) - var(--el-font-size-base) * var(--el-line-height-base)) / 2) var(--el-input-inner-padding);
}


.search-history-dropdown {
  position: absolute;
  top: 100%; // 位于输入框下方
  left: 0;
  width: 250px; // 与搜索输入框宽度一致
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.search-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.history-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.clear-history-btn {
  font-size: 12px;
  color: #409eff;
  padding: 0;
  
  &:hover {
    color: #66b1ff;
  }
}

.search-history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f5f7fa;
  }
}

.history-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delete-icon {
  font-size: 12px;
  color: #c0c4cc;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    color: #f56c6c;
  }
}
</style>
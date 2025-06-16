<script setup>
import { ref, computed, onMounted } from 'vue'
import { Edit, Delete, Search, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { artGetChannelsService, artDelChannelService } from '../../api/article'
import ChannelEdit from './components/ChannelEdit.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
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
  const filteredHistory = searchHistory.value.filter((item) => item !== searchTerm)

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
  ElMessage.success(t('articleChannel.searchHistoryCleared'))
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
  return channelList.value.filter(
    (channel) =>
      channel.cate_name.includes(searchText.value) || channel.cate_alias.includes(searchText.value)
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
    ElMessage.info(t('articleChannel.noCategory'))
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
  await ElMessageBox.confirm(t('articleChannel.deleteConfirm'), t('layout.logoutTitle'), {
    type: 'warning',
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
  })
  await artDelChannelService(row.id)
  ElMessage.success(t('articleChannel.deleteSuccess'))
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
  <page-container :title="t('articleChannel.pageTitle')">
    <template #extra>
      <div style="display: flex; align-items: center">
        <div class="search-container">
          <div class="search-input-group">
            <el-input
              ref="searchInputRef"
              v-model="searchText"
              :placeholder="t('articleChannel.searchPlaceholder')"
              :prefix-icon="Search"
              style="width: 250px"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
              @keyup="onSearchKeyup"
            ></el-input>
            <el-button
              type="primary"
              @click="handleSearch"
              style="margin-left: 0"
              class="search-btn"
            >
              {{ t('common.search') }}
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
                {{ t('articleChannel.searchHistory') }}
              </span>
              <el-button
                type="text"
                size="small"
                @click="clearSearchHistory"
                class="clear-history-btn"
              >
                {{ t('articleChannel.clear') }}
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
                <el-icon class="delete-icon" @click="removeSearchHistoryItem(index, $event)">
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
        </div>

        <el-button @click="onAddChannel" style="margin-left: 10px" type="primary"
          >{{ t('common.add') }}{{ t('menu.category') }}</el-button
        >
      </div>
    </template>

    <el-table v-loading="loading" :data="filteredChannelList" style="width: 100%">
      <el-table-column
        type="index"
        :label="t('articleChannel.serialNumber')"
        width="100"
      ></el-table-column>
      <el-table-column prop="cate_name" :label="t('articleChannel.categoryName')"></el-table-column>
      <el-table-column
        prop="cate_alias"
        :label="t('articleChannel.categoryAlias')"
      ></el-table-column>
      <el-table-column :label="t('articleChannel.operation')" width="150">
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
    </el-table>

    <channel-edit ref="dialog" @success="onSuccess"></channel-edit>
  </page-container>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;
  padding: 20px;
  background-color: var(--page-container-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: var(--theme-transition);
  color: var(--text-color-primary);
}

.search-container {
  position: relative;
  display: inline-block;
  margin-right: 10px;
}

.search-input-group {
  display: flex;
  align-items: center;
}

.search-btn {
  margin-left: 10px !important; // 确保覆盖 Element Plus 默认样式
}

.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 250px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 8px 0;
  color: var(--el-text-color-primary);
}

.search-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 5px;
}

.history-title {
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 5px;
}

.clear-history-btn {
  color: var(--el-color-primary);
}

.search-history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
}

.history-item:hover {
  background-color: var(--el-fill-color-light);
}

.history-text {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete-icon {
  margin-left: 10px;
  color: var(--el-text-color-secondary);
  visibility: hidden; // 默认隐藏
}

.history-item:hover .delete-icon {
  visibility: visible; // 悬停时显示
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Edit, Delete, Search, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { artGetChannelsService, artDelChannelService } from '../../api/article'
import ChannelEdit from './components/ChannelEdit.vue'
import ChannelListSkeleton from './components/ChannelListSkeleton.vue'

const { t } = useI18n()
const channelList = ref([])
const loading = ref(false)
const dialog = ref()
const searchText = ref('')
const showSearchHistory = ref(false)
const searchHistory = ref([])
const searchInputRef = ref()

const SEARCH_HISTORY_KEY = 'article_category_search_history'
const MAX_HISTORY_COUNT = 10

const getChannelList = async () => {
  loading.value = true
  try {
    const res = await artGetChannelsService()
    channelList.value = res.data.data
  } catch (error) {
    ElMessage.error(t('common.fetchError'))
  } finally {
    loading.value = false
  }
}

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

const saveSearchHistory = () => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

const addToSearchHistory = (searchTerm) => {
  if (!searchTerm.trim()) return
  const filteredHistory = searchHistory.value.filter((item) => item !== searchTerm)
  searchHistory.value = [searchTerm, ...filteredHistory].slice(0, MAX_HISTORY_COUNT)
  saveSearchHistory()
}

const clearSearchHistory = (event) => {
  event.stopPropagation()
  searchHistory.value = []
  saveSearchHistory()
  ElMessage.success(t('articleChannel.searchHistoryCleared'))
  showSearchHistory.value = false
}

const removeSearchHistoryItem = (index, event) => {
  event.stopPropagation()
  searchHistory.value.splice(index, 1)
  saveSearchHistory()
}

onMounted(() => {
  getChannelList()
  loadSearchHistory()
})

const filteredChannelList = computed(() => {
  if (!searchText.value) {
    return channelList.value
  }
  return channelList.value.filter(
    (channel) =>
      channel.cate_name.includes(searchText.value) || channel.cate_alias.includes(searchText.value)
  )
})

const handleSearch = () => {
  if (searchText.value.trim()) {
    addToSearchHistory(searchText.value.trim())
  }
  showSearchHistory.value = false

  if (searchText.value && filteredChannelList.value.length === 0) {
    ElMessage.info(t('articleChannel.noCategory'))
  }
}

const onSearchFocus = () => {
  showSearchHistory.value = true
}

const onSearchBlur = (event) => {
  const searchContainer = event.target.closest('.search-container')
  const relatedTarget = event.relatedTarget

  if (relatedTarget && searchContainer && searchContainer.contains(relatedTarget)) {
    return
  }

  setTimeout(() => {
    showSearchHistory.value = false
  }, 150)
}

const onHistoryItemClick = (historyItem) => {
  searchText.value = historyItem
  showSearchHistory.value = false
  handleSearch()
}

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
            />
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

        <el-button @click="onAddChannel" style="margin-left: 10px" type="primary">
          {{ t('common.add') }}{{ t('menu.category') }}
        </el-button>
      </div>
    </template>

    <ChannelListSkeleton v-if="loading" />
    <template v-else>
      <el-table :data="filteredChannelList" style="width: 100%">
        <el-table-column
          type="index"
          :label="t('articleChannel.serialNumber')"
          width="100"
        ></el-table-column>
        <el-table-column
          prop="cate_name"
          :label="t('articleChannel.categoryName')"
        ></el-table-column>
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
    </template>
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
  margin-left: 10px !important;
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

  &:hover {
    background-color: var(--el-fill-color-light);
  }
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
  visibility: hidden;
}

.history-item:hover .delete-icon {
  visibility: visible;
}
</style>

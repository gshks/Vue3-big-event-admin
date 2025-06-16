<script setup>
import { ref, computed, onMounted } from 'vue'
import { Delete, Edit, Search, Clock } from '@element-plus/icons-vue'
import ChannelSelect from './components/ChannelSelect.vue'
import ArticleEdit from './components/ArticleEdit.vue'
import { artGetListService, artDelService } from '@/api/article.js'
import { formatTime } from '@/utils/format.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const articleList = ref([]) // 文章列表
const total = ref(0) // 总条数
const loading = ref(false) // loading状态

// 搜索相关
const searchText = ref('')
const showSearchHistory = ref(false)
const searchHistory = ref([])
const searchInputRef = ref()

const SEARCH_HISTORY_KEY = 'article_manage_search_history'
const MAX_HISTORY_COUNT = 10

// 定义请求参数对象
const params = ref({
  pagenum: 1,
  pagesize: 5,
  cate_id: '',
  state: '',
})

const getArticleList = async () => {
  loading.value = true
  const res = await artGetListService(params.value)
  articleList.value = res.data.data
  total.value = res.data.total
  loading.value = false
}

onMounted(() => {
  getArticleList()
  loadSearchHistory()
})

// 分页相关
const onSizeChange = (size) => {
  params.value.pagenum = 1
  params.value.pagesize = size
  getArticleList()
}
const onCurrentChange = (page) => {
  params.value.pagenum = page
  getArticleList()
}

// 搜索历史相关
const loadSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (history) searchHistory.value = JSON.parse(history)
  } catch (error) {
    console.error('加载搜索历史失败:', error) // Fix: Log the error
    searchHistory.value = []
  }
}
const saveSearchHistory = () => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error) // Fix: Log the error
  }
}
const addToSearchHistory = (term) => {
  if (!term.trim()) return
  const filtered = searchHistory.value.filter((item) => item !== term)
  searchHistory.value = [term, ...filtered].slice(0, MAX_HISTORY_COUNT)
  saveSearchHistory()
}
const clearSearchHistory = (event) => {
  event && event.stopPropagation()
  searchHistory.value = []
  saveSearchHistory()
  ElMessage.success(t('articleChannel.searchHistoryCleared'))
  showSearchHistory.value = false
}
const removeSearchHistoryItem = (index, event) => {
  event && event.stopPropagation()
  searchHistory.value.splice(index, 1)
  saveSearchHistory()
}

// 搜索逻辑
const filteredArticleList = computed(() => {
  if (!searchText.value) return articleList.value
  return articleList.value.filter(
    (article) =>
      article.title?.includes(searchText.value) || article.cate_name?.includes(searchText.value)
  )
})
const handleSearch = () => {
  if (searchText.value.trim()) addToSearchHistory(searchText.value.trim())
  showSearchHistory.value = false
  if (searchText.value && filteredArticleList.value.length === 0) {
    ElMessage.info(t('articleManage.noArticle'))
  }
}
const onSearchFocus = () => {
  showSearchHistory.value = true
}
const onSearchBlur = (event) => {
  const searchContainer = event.target.closest('.search-container')
  const relatedTarget = event.relatedTarget
  if (relatedTarget && searchContainer && searchContainer.contains(relatedTarget)) return
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
  if (event.key === 'Enter') handleSearch()
}

// 表单区域筛选相关
const onSearch = () => {
  params.value.pagenum = 1
  getArticleList()
  searchText.value = '' // 清空搜索框内容，确保只使用表单筛选
}
const onReset = () => {
  params.value.pagenum = 1
  params.value.cate_id = ''
  params.value.state = ''
  getArticleList()
  searchText.value = '' // 清空搜索框内容
}

// 添加、编辑、删除逻辑
const articleEditRef = ref()
const onAddArticle = () => {
  articleEditRef.value.open({})
}
const onEditArticle = (row) => {
  articleEditRef.value.open(row)
}
const onDeleteArticle = async (row) => {
  await ElMessageBox.confirm(t('articleManage.deleteConfirm'), t('articleManage.deleteTitle'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning',
  })
  await artDelService(row.id)
  ElMessage.success(t('articleManage.deleteSuccess'))
  // 如果当前页数据全部删除，且不是第一页，则回到上一页
  if (articleList.value.length === 1 && params.value.pagenum > 1) {
    params.value.pagenum--
  }
  getArticleList()
}
const onSuccess = (type) => {
  // 如果是添加操作，跳转到最后一页
  if (type === 'add') {
    const lastPage = Math.ceil((total.value + 1) / params.value.pagesize)
    params.value.pagenum = lastPage
  }
  getArticleList()
}
</script>

<template>
  <page-container :title="t('articleManage.pageTitle')">
    <template #extra>
      <div style="display: flex; align-items: center">
        <div class="search-container">
          <div class="search-input-group">
            <el-input
              ref="searchInputRef"
              v-model="searchText"
              :placeholder="t('articleManage.searchPlaceholder')"
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
              >{{ t('common.search') }}</el-button
            >
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
                >{{ t('articleChannel.clear') }}</el-button
              >
            </div>
            <div class="search-history-list">
              <div
                v-for="(item, index) in searchHistory"
                :key="index"
                class="history-item"
                @click="onHistoryItemClick(item)"
              >
                <span class="history-text">{{ item }}</span>
                <el-icon class="delete-icon" @click="removeSearchHistoryItem(index, $event)"
                  ><Delete
                /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <el-button type="primary" @click="onAddArticle" style="margin-left: 10px">{{
          t('articleManage.addArticle')
        }}</el-button>
      </div>
    </template>

    <el-form inline>
      <el-form-item :label="t('articleManage.articleCategory')">
        <channel-select v-model="params.cate_id"></channel-select>
      </el-form-item>
      <el-form-item :label="t('articleManage.publishStatus')">
        <el-select v-model="params.state">
          <el-option :label="t('articleManage.published')" value="已发布"></el-option>
          <el-option :label="t('articleManage.draft')" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch" type="primary">{{ t('common.search') }}</el-button>
        <el-button @click="onReset">{{ t('common.reset') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="filteredArticleList" v-loading="loading">
      <el-table-column :label="t('articleManage.articleTitle')" prop="title">
        <template #default="{ row }">
          <el-link type="primary" :underline="false">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column :label="t('articleManage.category')" prop="cate_name"></el-table-column>
      <el-table-column :label="t('articleManage.publishTime')" prop="pub_date">
        <template #default="{ row }">
          {{ formatTime(row.pub_date) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('articleManage.status')" prop="state"></el-table-column>
      <el-table-column :label="t('articleManage.operation')" width="150">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="onEditArticle(row)"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="onDeleteArticle(row)"
          ></el-button>
        </template>
      </el-table-column>

      <template #empty>
        <el-empty :description="t('articleManage.noData')"></el-empty>
      </template>
    </el-table>

    <el-pagination
      v-model:current-page="params.pagenum"
      v-model:page-size="params.pagesize"
      :page-sizes="[2, 3, 5, 10]"
      :background="true"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      :small="true"
      :disabled="loading"
    >
      <template #default>
        <span>{{ t('articleManage.goTo') }} {{ params.pagenum }}</span>
        <span>{{ t('articleManage.total') }} {{ total }} {{ t('articleManage.page') }}</span>
      </template>
    </el-pagination>

    <ArticleEdit ref="articleEditRef" @success="onSuccess"></ArticleEdit>
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


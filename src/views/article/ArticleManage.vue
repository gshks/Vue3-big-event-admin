<script setup>
import { ref, computed, onMounted } from 'vue'
import { Delete, Edit, Search, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import ChannelSelect from './components/ChannelSelect.vue'
import ArticleEdit from './components/ArticleEdit.vue'
import ArticleListSkeleton from './components/ArticleListSkeleton.vue'
import { artGetListService, artDelService } from '@/api/article.js'
import { formatTime } from '@/utils/format.js'

const { t } = useI18n()
const articleList = ref([])
const total = ref(0)
const loading = ref(false)

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
  try {
    const res = await artGetListService(params.value)
    articleList.value = res.data.data
    total.value = res.data.total
  } catch (error) {
    // eslint-disable-line no-unused-vars
    ElMessage.error(t('common.fetchError'))
  } finally {
    loading.value = false
  }
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
  searchText.value = ''
}

const onReset = () => {
  params.value.pagenum = 1
  params.value.cate_id = ''
  params.value.state = ''
  getArticleList()
  searchText.value = ''
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
  try {
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
  } catch (error) {
    // eslint-disable-line no-unused-vars
    // 用户取消删除操作，不需要处理
  }
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
  <div class="article-manage">
    <page-container :title="t('articleManage.pageTitle')">
      <div v-if="loading">
        <ArticleListSkeleton />
      </div>

      <div v-else class="content-wrapper">
        <!-- 合并到一行的筛选和操作区域 -->
        <div class="unified-header">
          <el-form inline class="filter-form">
            <el-form-item :label="t('articleManage.articleCategory')">
              <channel-select v-model="params.cate_id" />
            </el-form-item>
            <el-form-item :label="t('articleManage.publishStatus')">
              <el-select v-model="params.state">
                <el-option :label="t('articleManage.published')" value="已发布" />
                <el-option :label="t('articleManage.draft')" value="草稿" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSearch">{{ t('common.search') }}</el-button>
              <el-button @click="onReset">{{ t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>

          <div class="right-actions">
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
                <el-button type="primary" @click="handleSearch" class="search-btn">{{
                  t('common.search')
                }}</el-button>
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
                    <el-icon
                      class="delete-icon"
                      @click.stop="removeSearchHistoryItem(index, $event)"
                      ><Delete
                    /></el-icon>
                  </div>
                </div>
              </div>
            </div>

            <el-button type="primary" @click="onAddArticle">{{
              t('articleManage.addArticle')
            }}</el-button>
          </div>
        </div>

        <div class="article-table">
          <el-table :data="filteredArticleList">
            <el-table-column :label="t('articleManage.articleTitle')" prop="title">
              <template #default="{ row }">
                <el-link type="primary" :underline="false">{{ row.title }}</el-link>
              </template>
            </el-table-column>
            <el-table-column :label="t('articleManage.category')" prop="cate_name" />
            <el-table-column :label="t('articleManage.publishTime')" prop="pub_date">
              <template #default="{ row }">
                {{ formatTime(row.pub_date) }}
              </template>
            </el-table-column>
            <el-table-column :label="t('articleManage.status')" prop="state" />
            <el-table-column :label="t('articleManage.operation')" width="150">
              <template #default="{ row }">
                <el-button :icon="Edit" circle plain type="primary" @click="onEditArticle(row)" />
                <el-button
                  :icon="Delete"
                  circle
                  plain
                  type="danger"
                  @click="onDeleteArticle(row)"
                />
              </template>
            </el-table-column>

            <template #empty>
              <el-empty :description="t('articleManage.noData')" />
            </template>
          </el-table>
        </div>

        <div class="pagination-wrapper">
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
        </div>

        <ArticleEdit ref="articleEditRef" @success="onSuccess" />
      </div>
    </page-container>
  </div>
</template>

<style lang="scss" scoped>
.article-manage {
  .content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  // 统一的头部区域，包含筛选和操作
  .unified-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
  }

  .filter-form {
    flex: 1;
    margin: 0;

    // 确保表单项在一行内显示
    .el-form-item {
      margin-bottom: 0;
      margin-right: 20px;
    }
  }

  .right-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .search-container {
    position: relative;
    display: inline-block;
  }

  .search-input-group {
    display: flex;
    align-items: center;
    gap: 10px;
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
    margin-top: 5px;
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
    display: flex;
    align-items: center;
    gap: 5px;
    font-weight: bold;
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

      .delete-icon {
        visibility: visible;
      }
    }
  }

  .history-text {
    flex-grow: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .delete-icon {
    visibility: hidden;
    margin-left: 10px;
    color: var(--el-text-color-secondary);
    cursor: pointer;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }

  // 响应式处理
  @media (max-width: 1200px) {
    .unified-header {
      flex-direction: column;
      align-items: stretch;
    }

    .right-actions {
      justify-content: flex-end;
    }
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Delete, Edit, Search, Clock } from '@element-plus/icons-vue'
import ChannelSelect from './components/ChannelSelect.vue'
import ArticleEdit from './components/ArticleEdit.vue'
import { artGetListService, artDelService } from '@/api/article.js'
import { formatTime } from '@/utils/format.js'
import { ElMessage, ElMessageBox } from 'element-plus'

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
  state: ''
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
    searchHistory.value = []
  }
}
const saveSearchHistory = () => {
  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch (error) {}
}
const addToSearchHistory = (term) => {
  if (!term.trim()) return
  const filtered = searchHistory.value.filter(item => item !== term)
  searchHistory.value = [term, ...filtered].slice(0, MAX_HISTORY_COUNT)
  saveSearchHistory()
}
const clearSearchHistory = (event) => {
  event && event.stopPropagation()
  searchHistory.value = []
  saveSearchHistory()
  ElMessage.success('搜索历史已清空')
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
  // 注意：这里的过滤是基于当前已获取的文章列表，而不是重新从API获取。
  // 如果需要基于搜索框内容进行后端搜索，则需要修改 getArticleList 方法的参数。
  return articleList.value.filter(article =>
    article.title?.includes(searchText.value) ||
    article.cate_name?.includes(searchText.value)
  )
})
const handleSearch = () => {
  if (searchText.value.trim()) addToSearchHistory(searchText.value.trim())
  showSearchHistory.value = false
  // 如果搜索结果为空，显示提示
  if (searchText.value && filteredArticleList.value.length === 0) {
    ElMessage.info('没有该文章')
  }
}
const onSearchFocus = () => { showSearchHistory.value = true }
const onSearchBlur = (event) => {
  const searchContainer = event.target.closest('.search-container')
  const relatedTarget = event.relatedTarget
  if (relatedTarget && searchContainer && searchContainer.contains(relatedTarget)) return
  setTimeout(() => { showSearchHistory.value = false }, 150)
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
const onAddArticle = () => { articleEditRef.value.open({}) }
const onEditArticle = (row) => { articleEditRef.value.open(row) }
const onDeleteArticle = async (row) => {
  await ElMessageBox.confirm('此操作将永久删除该文件, 是否继续?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  await artDelService(row.id)
  ElMessage.success('删除成功')
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
  <page-container title="文章管理">
    <template #extra>
      <div style="display: flex; align-items: center;">
        <div class="search-container">
          <div class="search-input-group">
            <el-input
              ref="searchInputRef"
              v-model="searchText"
              placeholder="搜索文章标题或分类"
              :prefix-icon="Search"
              style="width: 250px;"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
              @keyup="onSearchKeyup"
            />
            <el-button 
              type="primary" 
              @click="handleSearch"
              style="margin-left: 0;"
              class="search-btn"
            >搜索</el-button>
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
              >清空</el-button>
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
                ><Delete /></el-icon>
              </div>
            </div>
          </div>
        </div>
        <el-button type="primary" @click="onAddArticle" style="margin-left: 10px;">添加文章</el-button>
      </div>
    </template>

    <el-form inline>
      <el-form-item label="文章分类:">
        <channel-select v-model="params.cate_id"></channel-select>
      </el-form-item>
      <el-form-item label="发布状态:">
        <el-select v-model="params.state">
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch" type="primary">搜索</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="filteredArticleList" v-loading="loading">
      <el-table-column label="文章标题" prop="title">
        <template #default="{ row }">
          <el-link type="primary" :underline="false">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="分类" prop="cate_name"></el-table-column>
      <el-table-column label="发表时间" prop="pub_date">
        <template #default="{ row }">
          {{ formatTime(row.pub_date) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="state"></el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button
            circle
            plain
            type="primary"
            :icon="Edit"
            @click="onEditArticle(row)"
          ></el-button>
          <el-button
            circle
            plain
            type="danger"
            :icon="Delete"
            @click="onDeleteArticle(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="params.pagenum"
      v-model:page-size="params.pagesize"
      :page-sizes="[2, 3, 5, 10]"
      :background="true"
      layout="jumper, total, sizes, prev, pager, next"
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />

    <article-edit ref="articleEditRef" @success="onSuccess"></article-edit>
  </page-container>
</template>

<style lang="scss" scoped>
.search-container {
  position: relative;
  display: inline-block; // 保留这个，它定义了 search-history-dropdown 的相对定位基准
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
.search-container :deep(.el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  // 如果仍有高度差异，可以在这里微调 padding 或 height
  // 例如：padding-top: var(--el-input-padding-vertical, 7px);
  // 或者：height: var(--el-input-height, 32px);
}
.search-history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 250px;
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
  &:hover { color: #66b1ff; }
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
  &:hover { background-color: #f5f7fa; }
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
  &:hover { color: #f56c6c; }
}
</style>
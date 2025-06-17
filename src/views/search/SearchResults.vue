<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import SmartSearch from '@/components/SmartSearch.vue'
import SearchResultsSkeleton from './components/SearchResultsSkeleton.vue'
import { searchService } from '@/api/search'

const { t } = useI18n()
const route = useRoute()
const searchResults = ref([])
const loading = ref(false)
const activeTab = ref('all')

watch(
  () => route.query.q,
  async (newQuery) => {
    if (newQuery) {
      await performSearch(newQuery)
    }
  },
  { immediate: true }
)

const performSearch = async (query) => {
  loading.value = true
  try {
    const res = await searchService(query)
    searchResults.value = res.data.results
  } catch (error) {
    ElMessage.error(t('search.searchError'))
    console.error('Search error:', error)
  } finally {
    loading.value = false
  }
}

const filteredResults = computed(() => {
  if (activeTab.value === 'all') {
    return searchResults.value
  }
  return searchResults.value.filter((item) => item.type === activeTab.value)
})

const highlightText = (text, query) => {
  if (!query) return text
  const reg = new RegExp(query, 'gi')
  return text.replace(reg, (match) => `<span class="highlight">${match}</span>`)
}
</script>

<template>
  <div class="search-results">
    <SearchResultsSkeleton v-if="loading" />

    <template v-else>
      <div class="search-header">
        <SmartSearch :placeholder="t('search.placeholder')" />
      </div>

      <div class="search-content">
        <el-tabs v-model="activeTab" class="search-tabs">
          <el-tab-pane :label="t('search.all')" name="all" />
          <el-tab-pane :label="t('search.articles')" name="article" />
          <el-tab-pane :label="t('search.categories')" name="category" />
          <el-tab-pane :label="t('search.users')" name="user" />
        </el-tabs>

        <div class="results-list">
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

          <el-empty v-else :description="t('search.noResults')" />
        </div>
      </div>
    </template>
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
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    h3 {
      margin: 0 0 8px;
      font-size: 16px;
      color: var(--el-text-color-primary);
    }

    p {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}

:deep(.highlight) {
  color: var(--el-color-primary);
  font-weight: bold;
}
</style>
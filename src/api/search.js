import request from '@/utils/request'

// 搜索接口
export const searchService = (query) => {
  return request({
    url: 'http://localhost:3000/api/search',
    method: 'get',
    params: { q: query },
  })
}

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// 中间件
app.use(cors())
app.use(express.json())

// 连接数据库
mongoose
  .connect('mongodb://localhost:27017/search_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => console.error('Could not connect to MongoDB:', err))

// 定义模型
const Article = mongoose.model('Article', {
  title: String,
  content: String,
  category: String,
  createdAt: { type: Date, default: Date.now },
})

const Category = mongoose.model('Category', {
  name: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model('User', {
  username: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
})

// 搜索路由
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) {
      return res.json({ results: [] })
    }

    // 构建搜索条件
    const searchRegex = new RegExp(q, 'i')

    // 并行搜索所有集合
    const [articles, categories, users] = await Promise.all([
      Article.find({
        $or: [{ title: searchRegex }, { content: searchRegex }],
      }).limit(5),
      Category.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
      }).limit(5),
      User.find({
        $or: [{ username: searchRegex }, { email: searchRegex }],
      }).limit(5),
    ])

    // 格式化结果
    const results = [
      ...articles.map((article) => ({
        type: 'article',
        id: article._id,
        title: article.title,
        content: article.content,
      })),
      ...categories.map((category) => ({
        type: 'category',
        id: category._id,
        name: category.name,
        description: category.description,
      })),
      ...users.map((user) => ({
        type: 'user',
        id: user._id,
        username: user.username,
        email: user.email,
      })),
    ]

    res.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: '搜索失败，请稍后重试' })
  }
})

// 添加一些测试数据
app.post('/api/seed', async (req, res) => {
  try {
    // 清空现有数据
    await Promise.all([Article.deleteMany({}), Category.deleteMany({}), User.deleteMany({})])

    // 添加测试数据
    const articles = await Article.insertMany([
      {
        title: 'Vue3 入门教程',
        content: 'Vue3 是一个流行的前端框架，本文介绍其基本用法...',
        category: '前端',
      },
      {
        title: 'Node.js 后端开发',
        content: 'Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行环境...',
        category: '后端',
      },
    ])

    const categories = await Category.insertMany([
      {
        name: '前端开发',
        description: '包含 HTML、CSS、JavaScript 等相关技术',
      },
      {
        name: '后端开发',
        description: '包含 Node.js、Python、Java 等服务器端技术',
      },
    ])

    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@example.com',
      },
      {
        username: 'developer',
        email: 'dev@example.com',
      },
    ])

    res.json({ message: '测试数据添加成功', articles, categories, users })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: '添加测试数据失败' })
  }
})

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

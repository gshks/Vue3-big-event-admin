# Vue3-big-event-admin

大事件管理系统是一个基于 Vue3 开发的现代化后台管理系统，主要用于文章的内容管理和 用户管理。系统采用前后端分离架构，提供完整的后台管理功能。 本项目是以跟练的黑马的后台管理系统为基础，又进行了部分的创新 原功能： 1.登录页面：用于用户身份验证。 2.布局容器：用户登录后的主界面，包括： 文章管理： 文章管理：用于管理文章。 文章频道：用于管理文章分类。 用户管理： 用户资料：用于查看和修改用户资料。 用户头像：用于更改用户头像。 用户密码：用于更改用户密码。 创新点如下： 1.登录页面优化：密码的显隐 2.系统明、暗主题的切换 3.系统中、英文语言的切换 4.对代码语言进行了TypeScript的修改 5.文章分类、文章管理新设置搜索栏，可以对已存在的文章分类、文章管理进行搜索，如果不存在则会返回不存在。 6.设置了骨架屏
This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Compile and Minify for Production

```sh
pnpm build
```

### Lint with [ESLint](https://eslint.org/)

```sh

pnpm lint
```

# 笔记

## 一、初始化

1.首先配置：.eslintrc.cjs\

2.git、husky初始化,提交代码前判断是否有错

3.目录调整:文件增加删除、内容的调整

4.引入element-plus,去官网看指南下载:-D unplugin-vue-components unplugin-auto-import

5.架构pinia

6.pnpm add axios

7.安装图标库，用power shell

## 二、

(一)\.关于login,登录页面

1. 结构相关

   el-row表示一行，一行分成24份

   el-col表示列

   (1) :span="12"  代表在一行中，占12份 (50%)

   (2) :span="6"   表示在一行中，占6份  (25%)

   (3) :offset="3" 代表在一行中，左侧margin份数

   el-form 整个表单组件

   el-form-item 表单的一行 （一个表单域）

   el-input 表单元素（输入框）

   2. 校验相关

      (1) el-form => :model="ruleForm"      绑定的整个form的数据对象 { xxx, xxx, xxx }

      (2) el-form => :rules="rules"         绑定的整个rules规则对象  { xxx, xxx, xxx }

      (3) 表单元素 => v-model="ruleForm.xxx" 给表单元素，绑定form的子属性

      (4) el-form-item => prop配置生效的是哪个校验规则 (和rules中的字段要对应)

3.

整个表单的校验规则

1.非空校验 required: true      message消息提示，  trigger触发校验的时机blurchange

2.长度校验 min:xx, max: xx

3.正则校验 pattern: 正则规则    \S非空字符

4.自定义校验=>自己写逻辑校验 (校验函数)

   validator: (rule, value, callback)

   (1) rule  当前校验规则相关的信息

   (2) value所校验的表单元素目前的表单值

   (3) callback无论成功还是失败，都需要callback回调

    -callback() 校验成功

    -callback(newError(错误信息)) 校验失败



<!-- 

    1. 结构相关

      el-row表示一行，一行分成24份 

       el-col表示列  

       (1) :span="12"  代表在一行中，占12份 (50%)

       (2) :span="6"   表示在一行中，占6份  (25%)

       (3) :offset="3" 代表在一行中，左侧margin份数


       el-form 整个表单组件

       el-form-item 表单的一行 （一个表单域）

       el-input 表单元素（输入框）

    2. 校验相关

       (1) el-form => :model="ruleForm"      绑定的整个form的数据对象 { xxx, xxx, xxx }

       (2) el-form => :rules="rules"         绑定的整个rules规则对象  { xxx, xxx, xxx }

       (3) 表单元素 => v-model="ruleForm.xxx" 给表单元素，绑定form的子属性

       (4) el-form-item => prop配置生效的是哪个校验规则 (和rules中的字段要对应)

  -->

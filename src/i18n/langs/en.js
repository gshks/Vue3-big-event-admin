export default {
  common: {
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    confirm: 'Confirm',
    cancel: 'Cancel',
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    loading: 'Loading...',
    success: 'Operation Successful',
    error: 'Operation Failed',
    warning: 'Warning',
    info: 'Info',
    reset: 'Reset',
  },
  menu: {
    dashboard: 'Dashboard',
    user: 'User Management',
    article: 'Article Management',
    category: 'Article Categories',
    tag: 'Tag Management',
    comment: 'Comment Management',
    setting: 'System Settings',
    profile: 'Profile',
    basicInfo: 'Basic Info',
    avatar: 'Change Avatar',
    password: 'Reset Password',
  },
  login: {
    title: 'Admin System',
    welcome: 'Welcome Back',
    register: 'Register',
    back: '← Back',
    remember: 'Remember Me',
    forgot: 'Forgot Password?',
    submit: 'Sign In',
    rules: {
      username: 'Please input username',
      usernameLength: 'Username must be 5-10 characters',
      password: 'Please input password',
      passwordLength: 'Password must be 6-15 non-empty characters',
      repassword: 'Please input password again',
      passwordMismatch: 'Passwords do not match',
    },
  },
  layout: {
    company: 'Heima Programmer',
    switchToDark: 'Switch to Dark Mode',
    switchToLight: 'Switch to Light Mode',
    logoutConfirm: 'Are you sure you want to logout?',
    logoutTitle: 'Tips',
    footer: 'Big Event ©2023 Created by Heima Programmer',
  },
  articleChannel: {
    pageTitle: 'Article Categories',
    searchPlaceholder: 'Search Article Categories',
    searchHistory: 'Search History',
    clear: 'Clear',
    noCategory: 'No article category found',
    deleteConfirm: 'Are you sure you want to delete this category?',
    deleteSuccess: 'Delete successful',
    searchHistoryCleared: 'Search history cleared',
    serialNumber: 'Serial No.',
    categoryName: 'Category Name',
    categoryAlias: 'Category Alias',
    operation: 'Operation',
  },
  articleManage: {
    pageTitle: 'Article Management',
    searchPlaceholder: 'Search article title or category',
    noArticle: 'No article found',
    deleteConfirm: 'This operation will permanently delete the file. Do you want to continue?',
    deleteTitle: 'Tip',
    addArticle: 'Add Article',
    articleCategory: 'Article Category:',
    publishStatus: 'Publish Status:',
    published: 'Published',
    draft: 'Draft',
    articleTitle: 'Article Title',
    category: 'Category',
    publishTime: 'Publish Time',
    status: 'Status',
    operation: 'Operation',
    noData: 'No Data',
    goTo: 'Go to',
    total: 'Total',
    page: '/page',
  },
  userProfile: {
    pageTitle: 'Basic Info',
    loginName: 'Login Name',
    nickname: 'Nickname',
    email: 'Email',
    submitModify: 'Submit Modify',
    rules: {
      nicknameRequired: 'Please input user nickname',
      nicknameLength: 'Nickname length must be 2-10 non-empty characters',
      emailRequired: 'Please input user email',
      emailFormat: 'Please enter a valid email address',
    },
    modifySuccess: 'Modify successful',
  },
  userAvatar: {
    pageTitle: 'Change Avatar',
    selectImage: 'Select Image',
    uploadAvatar: 'Upload Avatar',
    updateSuccess: 'Avatar updated successfully',
  },
  userPassword: {
    pageTitle: 'Reset Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    submitModify: 'Confirm Modify',
    reset: 'Reset',
    rules: {
      passwordRequired: 'Please input password',
      passwordLength: 'Password length cannot be less than 6 characters',
      repasswordRequired: 'Please input password again',
      passwordMismatch: 'Two passwords do not match!',
      passwordModifySuccess: 'Password modified successfully, please re-login',
    },
  },
  dashboard: {
    totalUsers: 'Total Users',
    totalArticles: 'Total Articles',
    totalComments: 'Total Comments',
    totalViews: 'Total Views',
    recentArticles: 'Recent Articles',
    recentComments: 'Recent Comments',
  },
}

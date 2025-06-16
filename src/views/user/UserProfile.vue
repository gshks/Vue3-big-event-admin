<script setup>
import PageContainer from '@/components/PageContainer.vue'
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import { userUpdateInfoService } from '@/api/user'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const formRef = ref()

// 是在使用仓库中数据的初始值 (无需响应式) 解构无问题
const {
  user: { email, id, nickname, username },
  getUser,
} = useUserStore()

const form = ref({
  id,
  username,
  nickname,
  email,
})

const rules = ref({
  nickname: [
    { required: true, message: t('userProfile.rules.nicknameRequired'), trigger: 'blur' },
    {
      pattern: /^\S{2,10}/,
      message: t('userProfile.rules.nicknameLength'),
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: t('userProfile.rules.emailRequired'), trigger: 'blur' },
    {
      type: 'email',
      message: t('userProfile.rules.emailFormat'),
      trigger: ['blur', 'change'],
    },
  ],
})

const submitForm = async () => {
  // 等待校验结果
  await formRef.value.validate()
  // 提交修改
  await userUpdateInfoService(form.value)
  // 通知 user 模块，进行数据的更新
  getUser()
  // 提示用户
  ElMessage.success(t('userProfile.modifySuccess'))
}
</script>
<template>
  <page-container :title="t('userProfile.pageTitle')">
    <!-- 表单部分 -->
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item :label="t('userProfile.loginName')">
        <el-input v-model="form.username" disabled></el-input>
      </el-form-item>
      <el-form-item :label="t('userProfile.nickname')" prop="nickname">
        <el-input v-model="form.nickname"></el-input>
      </el-form-item>
      <el-form-item :label="t('userProfile.email')" prop="email">
        <el-input v-model="form.email"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">{{
          t('userProfile.submitModify')
        }}</el-button>
      </el-form-item>
    </el-form>
  </page-container>
</template>

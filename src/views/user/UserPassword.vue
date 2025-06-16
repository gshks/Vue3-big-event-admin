<template>
  <div class="password-reset">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('userPassword.pageTitle') }}</span>
        </div>
      </template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" status-icon>
        <el-form-item :label="t('userPassword.currentPassword')" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            :placeholder="t('userPassword.currentPassword')"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('userPassword.newPassword')" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            :placeholder="t('userPassword.newPassword')"
            show-password
          />
        </el-form-item>
        <el-form-item :label="t('userPassword.confirmPassword')" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            :placeholder="t('userPassword.confirmPassword')"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ t('userPassword.submitModify') }}</el-button>
          <el-button @click="resetForm">{{ t('userPassword.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { userUpdatePasswordService } from '@/api/user'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const formRef = ref(null)
const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error(t('userPassword.rules.passwordRequired')))
  } else {
    if (form.confirmPassword !== '') {
      formRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error(t('userPassword.rules.repasswordRequired')))
  } else if (value !== form.newPassword) {
    callback(new Error(t('userPassword.rules.passwordMismatch')))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [
    { required: true, message: t('userPassword.rules.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('userPassword.rules.passwordLength'), trigger: 'blur' },
  ],
  newPassword: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: t('userPassword.rules.passwordLength'), trigger: 'blur' },
  ],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
}

const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        await userUpdatePasswordService({
          old_pwd: form.oldPassword,
          new_pwd: form.newPassword,
          re_pwd: form.confirmPassword,
        })
        ElMessage.success(t('userPassword.rules.passwordModifySuccess'))
        userStore.removeToken()
        router.push('/login')
      } catch {
        // 错误提示已由拦截器处理
      }
      resetForm()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<style scoped>
.password-reset {
  padding: 20px;
}

.box-card {
  width: 480px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

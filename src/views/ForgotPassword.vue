<template>
  <div class="auth-page">
    <div class="auth-glow"></div>

    <div class="auth-container">
      <router-link to="/login" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回登录
      </router-link>

      <div class="auth-card">
        <div class="auth-header">
          <router-link to="/" class="logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>RelayHub</span>
          </router-link>
          <h1>重置密码</h1>
          <p>通过邮箱验证码验证身份后设置新密码</p>
        </div>

        <el-steps :active="step" finish-status="success" align-center class="reset-steps">
          <el-step title="验证邮箱" />
          <el-step title="设置新密码" />
        </el-steps>

        <!-- Step 1: Verify email -->
        <el-form
          v-if="step === 0"
          ref="verifyFormRef"
          :model="verifyForm"
          :rules="verifyRules"
          label-position="top"
          class="auth-form"
          @submit.prevent="handleVerify"
        >
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="verifyForm.email"
              type="email"
              placeholder="请输入注册邮箱"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <div class="code-row">
              <el-input
                v-model="verifyForm.code"
                placeholder="6 位验证码"
                size="large"
                :prefix-icon="Key"
                maxlength="6"
              />
              <el-button
                plain
                size="large"
                class="code-btn"
                :disabled="codeCooldown > 0 || sendingCode"
                :loading="sendingCode"
                @click="sendCode"
              >
                {{ codeCooldown > 0 ? `${codeCooldown}s 后重发` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            native-type="submit"
          >
            下一步
          </el-button>
        </el-form>

        <!-- Step 2: Reset password -->
        <el-form
          v-else
          ref="resetFormRef"
          :model="resetForm"
          :rules="resetRules"
          label-position="top"
          class="auth-form"
          @submit.prevent="handleReset"
        >
          <div class="verified-email">
            <el-icon color="#4ade80"><CircleCheck /></el-icon>
            <span>{{ verifyForm.email }}</span>
            <el-button link type="primary" size="small" @click="step = 0">更换邮箱</el-button>
          </div>

          <el-form-item label="新密码" prop="password">
            <el-input
              v-model="resetForm.password"
              type="password"
              placeholder="至少 8 位，含字母和数字"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="resetForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            native-type="submit"
          >
            重置密码
          </el-button>
        </el-form>

        <p class="auth-switch">
          想起密码了？
          <router-link to="/login">返回登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const step = ref(0)
const verifyFormRef = ref(null)
const resetFormRef = ref(null)
const loading = ref(false)
const sendingCode = ref(false)
const codeCooldown = ref(0)
let cooldownTimer = null

const verifyForm = reactive({
  email: '',
  code: '',
})

const resetForm = reactive({
  password: '',
  confirmPassword: '',
})

const verifyRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为 6 位数字', trigger: 'blur' },
  ],
}

const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== resetForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const resetRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码至少 8 位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
      message: '密码需包含字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

function sendCode() {
  if (!verifyForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(verifyForm.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  sendingCode.value = true
  setTimeout(() => {
    sendingCode.value = false
    ElMessage.success(`验证码已发送至 ${verifyForm.email}`)
    codeCooldown.value = 60
    cooldownTimer = setInterval(() => {
      codeCooldown.value -= 1
      if (codeCooldown.value <= 0) {
        clearInterval(cooldownTimer)
        cooldownTimer = null
      }
    }, 1000)
  }, 600)
}

async function handleVerify() {
  if (!verifyFormRef.value) return
  await verifyFormRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      loading.value = false
      ElMessage.success('邮箱验证成功')
      step.value = 1
    }, 600)
  })
}

async function handleReset() {
  if (!resetFormRef.value) return
  await resetFormRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      loading.value = false
      ElMessage.success('密码重置成功，请使用新密码登录')
      router.push('/login')
    }, 800)
  })
}

onUnmounted(() => {
  if (cooldownTimer) clearInterval(cooldownTimer)
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.auth-glow {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 500px;
  background: var(--gradient-hero);
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.auth-container {
  position: relative;
  width: 100%;
  max-width: 420px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--text-primary);
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 40px 36px;
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 24px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
}

.auth-header h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.auth-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.reset-steps {
  margin-bottom: 28px;
}

.reset-steps :deep(.el-step__title) {
  font-size: 13px;
}

.reset-steps :deep(.el-step__title.is-process),
.reset-steps :deep(.el-step__title.is-finish) {
  color: var(--text-primary);
}

.reset-steps :deep(.el-step__title.is-wait) {
  color: var(--text-muted);
}

.reset-steps :deep(.el-step__head.is-process .el-step__icon) {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.reset-steps :deep(.el-step__head.is-finish .el-step__icon) {
  border-color: var(--accent-green);
  color: var(--accent-green);
}

.auth-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  padding-bottom: 6px;
}

.auth-form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 12px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.code-row .el-input {
  flex: 1;
}

.code-btn {
  flex-shrink: 0;
  width: 120px;
  border-radius: 12px !important;
  font-size: 13px;
}

.verified-email {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 14px;
}

.verified-email span {
  flex: 1;
  color: var(--text-secondary);
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  border-radius: 12px !important;
  margin-top: 8px;
}

.auth-switch {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-secondary);
}

.auth-switch a {
  color: var(--accent-green);
  font-weight: 500;
}

.auth-switch a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 24px;
  }

  .code-btn {
    width: 100px;
    padding: 0 8px;
  }
}
</style>

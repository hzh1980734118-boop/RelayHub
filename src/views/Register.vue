<template>
  <div class="auth-page">
    <div class="auth-glow"></div>

    <div class="auth-container">
      <router-link to="/" class="back-link">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
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
          <h1>创建账户</h1>
          <p>使用邮箱注册，开始接入 AI 模型</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          class="auth-form"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              type="email"
              placeholder="name@example.com"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="至少 8 位，含字母和数字"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item label="验证码" prop="code">
            <div class="code-row">
              <el-input
                v-model="form.code"
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

          <el-form-item prop="agreement" class="agreement-item">
            <el-checkbox v-model="form.agreement">
              我已阅读并同意
              <a href="#" @click.prevent>服务条款</a>
              和
              <a href="#" @click.prevent>隐私政策</a>
            </el-checkbox>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            native-type="submit"
          >
            注册
          </el-button>
        </el-form>

        <div class="auth-divider">
          <span>或</span>
        </div>

        <div class="social-buttons">
          <el-button plain size="large" class="social-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.49 11.49 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.22 0 4.61-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.286 0 .315.216.694.825.576C20.565 21.796 24 17.297 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub
          </el-button>
          <el-button plain size="large" class="social-btn">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </el-button>
        </div>

        <p class="auth-switch">
          已有账户？
          <router-link to="/login">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Message, Lock, Key } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const sendingCode = ref(false)
const codeCooldown = ref(0)
let cooldownTimer = null

const form = reactive({
  username: '',
  email: '',
  code: '',
  password: '',
  confirmPassword: '',
  agreement: false,
})

const validateConfirmPassword = (_rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreement = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请阅读并同意服务条款'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2-20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为 6 位数字', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为 6 位数字', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码至少 8 位', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
      message: '密码需包含字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' },
  ],
}

async function sendCode() {
  if (!form.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(form.email)) {
    ElMessage.warning('请输入有效的邮箱地址')
    return
  }

  sendingCode.value = true
  setTimeout(() => {
    sendingCode.value = false
    ElMessage.success(`验证码已发送至 ${form.email}`)
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

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    setTimeout(() => {
      loading.value = false
      ElMessage.success('注册成功，欢迎加入 RelayHub！')
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

.agreement-item {
  margin-bottom: 20px !important;
}

.agreement-item :deep(.el-form-item__content) {
  line-height: 1.5;
}

.agreement-item :deep(.el-checkbox__label) {
  color: var(--text-secondary);
  font-size: 13px;
  white-space: normal;
}

.agreement-item a {
  color: var(--accent-green);
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  border-radius: 12px !important;
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  gap: 16px;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.auth-divider span {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.social-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.social-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

  .social-buttons {
    grid-template-columns: 1fr;
  }
}
</style>

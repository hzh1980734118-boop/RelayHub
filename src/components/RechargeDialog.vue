<template>
  <el-dialog
    v-model="visible"
    title="账户充值"
    width="480px"
    class="recharge-dialog"
    :close-on-click-modal="!paying"
    @closed="resetDialog"
  >
    <!-- Step 1: 选择金额和支付方式 -->
    <div v-if="step === 'select'" class="recharge-content">
      <div class="balance-tip">
        当前余额：<span>¥ {{ currentBalance.toFixed(2) }}</span>
      </div>

      <div class="section-label">充值金额</div>
      <div class="amount-grid">
        <button
          v-for="item in presetAmounts"
          :key="item"
          type="button"
          class="amount-item"
          :class="{ active: selectedAmount === item && !customAmount }"
          @click="selectPreset(item)"
        >
          ¥{{ item }}
        </button>
      </div>
      <el-input
        v-model="customAmount"
        placeholder="自定义金额（最低 ¥1）"
        size="large"
        class="custom-amount"
        @focus="selectedAmount = null"
        @input="onCustomInput"
      >
        <template #prefix>¥</template>
      </el-input>

      <div class="section-label">支付方式</div>
      <div class="pay-methods">
        <button
          v-for="method in payMethods"
          :key="method.key"
          type="button"
          class="pay-method"
          :class="{ active: payMethod === method.key }"
          @click="payMethod = method.key"
        >
          <span class="pay-icon" :class="method.key" v-html="method.icon" />
          <span>{{ method.label }}</span>
          <el-icon v-if="payMethod === method.key" class="check-icon"><CircleCheckFilled /></el-icon>
        </button>
      </div>

      <div class="pay-summary">
        应付金额：<strong>¥ {{ finalAmount.toFixed(2) }}</strong>
      </div>
    </div>

    <!-- Step 2: 扫码支付 -->
    <div v-else-if="step === 'pay'" class="recharge-content pay-step">
      <div class="pay-method-badge" :class="payMethod">
        {{ payMethod === 'wechat' ? '微信支付' : '支付宝' }}
      </div>
      <p class="pay-amount">¥ {{ finalAmount.toFixed(2) }}</p>

      <div class="qr-box">
        <div class="qr-placeholder">
          <div class="qr-grid"></div>
          <span class="qr-logo" :class="payMethod">
            {{ payMethod === 'wechat' ? '微信' : '支付宝' }}
          </span>
        </div>
      </div>

      <p class="qr-tip">
        请使用{{ payMethod === 'wechat' ? '微信' : '支付宝' }}扫描二维码完成支付
      </p>
      <p class="countdown">支付剩余时间 {{ formatCountdown(payCountdown) }}</p>

      <el-button
        type="primary"
        size="large"
        class="mock-pay-btn"
        :loading="paying"
        @click="confirmPayment"
      >
        我已完成支付
      </el-button>
      <el-button plain size="large" class="back-btn" @click="backToSelect">返回修改</el-button>
    </div>

    <!-- Step 3: 支付成功 -->
    <div v-else class="recharge-content success-step">
      <el-icon class="success-icon" :size="64" color="#4ade80"><CircleCheckFilled /></el-icon>
      <h3>充值成功</h3>
      <p>已成功充值 <strong>¥ {{ finalAmount.toFixed(2) }}</strong></p>
      <p class="new-balance">当前余额：¥ {{ (currentBalance + finalAmount).toFixed(2) }}</p>
    </div>

    <template #footer>
      <div v-if="step === 'select'" class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :disabled="!canSubmit" @click="goToPay">
          立即充值
        </el-button>
      </div>
      <div v-else-if="step === 'success'" class="dialog-footer">
        <el-button type="primary" @click="handleSuccessClose">完成</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  currentBalance: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const step = ref('select')
const selectedAmount = ref(100)
const customAmount = ref('')
const payMethod = ref('wechat')
const paying = ref(false)
const payCountdown = ref(900)
let countdownTimer = null

const presetAmounts = [10, 50, 100, 200, 500]

const payMethods = [
  {
    key: 'wechat',
    label: '微信支付',
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#07C160"><path d="M8.5 7.5c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm7 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM12 2C6.5 2 2 5.9 2 10.7c0 2.7 1.4 5.1 3.6 6.7L4.5 20l3.4-1.8c1.3.4 2.7.6 4.1.6 5.5 0 10-3.9 10-8.7S17.5 2 12 2z"/></svg>`,
  },
  {
    key: 'alipay',
    label: '支付宝',
    icon: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#1677FF"><path d="M21.4 4H2.6c-.9 0-1.6.7-1.6 1.6v12.8c0 .9.7 1.6 1.6 1.6h18.8c.9 0 1.6-.7 1.6-1.6V5.6c0-.9-.7-1.6-1.6-1.6zm-1.2 3.2h-2.8c-1.1 2.5-2.8 4.6-4.9 6.2 1.8 1 3.9 1.6 6.1 1.8l-1.1 1.9c-2.8-.3-5.4-1.2-7.6-2.6-2.2 1.4-4.8 2.3-7.6 2.6l-1.1-1.9c2.3-.2 4.4-.9 6.2-1.9-1.5-1.2-2.8-2.7-3.8-4.4H6.8v-1.4h3.5c-.3-.8-.5-1.6-.6-2.5H6.8V6.8h4.1V5.4h1.6v1.4h4.1v1.1h-4.1c.1.9.3 1.7.6 2.5h3.5v1.4h-2.9c1 1.7 2.3 3.2 3.8 4.4 1.8-1.3 3.3-3 4.4-5h-3.3V6.8h4.5v1.4h-1.7c-.9 1.5-2.1 2.9-3.5 4.1 2.1 1.4 4.5 2.2 7 2.4l-1.1 1.9z"/></svg>`,
  },
]

const finalAmount = computed(() => {
  if (customAmount.value) {
    const val = parseFloat(customAmount.value)
    return Number.isNaN(val) ? 0 : val
  }
  return selectedAmount.value || 0
})

const canSubmit = computed(() => finalAmount.value >= 1)

function selectPreset(amount) {
  selectedAmount.value = amount
  customAmount.value = ''
}

function onCustomInput(val) {
  if (val) selectedAmount.value = null
}

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function startCountdown() {
  payCountdown.value = 900
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    payCountdown.value -= 1
    if (payCountdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

function goToPay() {
  if (!canSubmit.value) return
  step.value = 'pay'
  startCountdown()
}

function backToSelect() {
  step.value = 'select'
  clearInterval(countdownTimer)
  countdownTimer = null
}

function confirmPayment() {
  paying.value = true
  setTimeout(() => {
    paying.value = false
    clearInterval(countdownTimer)
    countdownTimer = null
    step.value = 'success'
  }, 1200)
}

function handleSuccessClose() {
  emit('success', {
    amount: finalAmount.value,
    method: payMethod.value,
  })
  visible.value = false
}

function resetDialog() {
  step.value = 'select'
  selectedAmount.value = 100
  customAmount.value = ''
  payMethod.value = 'wechat'
  paying.value = false
  clearInterval(countdownTimer)
  countdownTimer = null
}

watch(visible, (val) => {
  if (val) resetDialog()
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.recharge-content {
  padding: 0 4px;
}

.balance-tip {
  padding: 12px 16px;
  background: rgba(180, 255, 57, 0.08);
  border: 1px solid rgba(180, 255, 57, 0.2);
  border-radius: 12px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.balance-tip span {
  color: var(--accent-green);
  font-weight: 600;
}

.section-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}

.amount-item {
  padding: 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.amount-item:hover {
  border-color: var(--border-hover);
}

.amount-item.active {
  border-color: var(--accent-green);
  background: rgba(180, 255, 57, 0.08);
  color: var(--accent-green);
}

.custom-amount {
  margin-bottom: 24px;
}

.custom-amount :deep(.el-input__wrapper) {
  border-radius: 12px;
}

.pay-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.pay-method {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.pay-method:hover {
  border-color: var(--border-hover);
}

.pay-method.active {
  border-color: var(--accent-green);
  background: rgba(180, 255, 57, 0.05);
}

.pay-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.check-icon {
  margin-left: auto;
  color: var(--accent-green);
}

.pay-summary {
  text-align: right;
  font-size: 14px;
  color: var(--text-secondary);
}

.pay-summary strong {
  font-size: 24px;
  color: var(--text-primary);
  margin-left: 8px;
}

.pay-step {
  text-align: center;
}

.pay-method-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.pay-method-badge.wechat {
  background: rgba(7, 193, 96, 0.15);
  color: #07c160;
}

.pay-method-badge.alipay {
  background: rgba(22, 119, 255, 0.15);
  color: #1677ff;
}

.pay-amount {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 24px;
}

.qr-box {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  background: #fff;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.qr-grid {
  width: 160px;
  height: 160px;
  background:
    linear-gradient(90deg, #000 2px, transparent 2px) 0 0 / 8px 8px,
    linear-gradient(#000 2px, transparent 2px) 0 0 / 8px 8px;
  opacity: 0.85;
}

.qr-logo {
  position: absolute;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.qr-logo.wechat {
  background: #07c160;
}

.qr-logo.alipay {
  background: #1677ff;
}

.qr-tip {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.countdown {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.mock-pay-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px !important;
  margin-bottom: 10px;
}

.back-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px !important;
}

.success-step {
  text-align: center;
  padding: 24px 0;
}

.success-icon {
  margin-bottom: 16px;
}

.success-step h3 {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 8px;
}

.success-step p {
  color: var(--text-secondary);
  font-size: 14px;
}

.new-balance {
  margin-top: 12px;
  color: var(--accent-green) !important;
  font-weight: 600;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

<style>
.recharge-dialog.el-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.recharge-dialog .el-dialog__header {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  margin-right: 0;
}

.recharge-dialog .el-dialog__title {
  color: var(--text-primary);
  font-weight: 600;
}

.recharge-dialog .el-dialog__body {
  padding-top: 24px;
}

.recharge-dialog .el-dialog__footer {
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}
</style>

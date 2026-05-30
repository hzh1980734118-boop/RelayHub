<template>
  <div class="page">
    <AppHeader variant="dark" />

    <section class="page-hero">
      <h1>API 文档</h1>
      <p>兼容 OpenAI API 格式，快速接入您的应用</p>
    </section>

    <section class="page-content">
      <div class="docs-layout">
        <aside class="docs-sidebar">
          <div
            v-for="section in docSections"
            :key="section.id"
            class="docs-nav-item"
            :class="{ active: activeSection === section.id }"
            @click="activeSection = section.id"
          >
            {{ section.title }}
          </div>
        </aside>

        <div class="docs-main">
          <div v-if="activeSection === 'quickstart'" class="doc-section">
            <h2>快速开始</h2>
            <p>RelayHub 完全兼容 OpenAI API 格式。只需替换 Base URL 和 API Key 即可接入。</p>

            <h3>1. 获取 API Key</h3>
            <p>在 <router-link to="/dashboard">控制台</router-link> 中创建 API 密钥。</p>

            <h3>2. 配置 Base URL</h3>
            <div class="code-block">
              <div class="code-header">
                <span>Base URL</span>
                <el-button link size="small"><el-icon><CopyDocument /></el-icon> 复制</el-button>
              </div>
              <pre>https://api.relayhub.ai/v1</pre>
            </div>

            <h3>3. 发送请求</h3>
            <div class="code-block">
              <div class="code-header">
                <span>cURL</span>
                <el-button link size="small"><el-icon><CopyDocument /></el-icon> 复制</el-button>
              </div>
              <pre>curl https://api.relayhub.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-rh-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'</pre>
            </div>
          </div>

          <div v-if="activeSection === 'chat'" class="doc-section">
            <h2>Chat Completions</h2>
            <p>创建对话补全，支持流式和非流式响应。</p>
            <div class="code-block">
              <div class="code-header"><span>POST /v1/chat/completions</span></div>
              <pre>{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false
}</pre>
            </div>
          </div>

          <div v-if="activeSection === 'images'" class="doc-section">
            <h2>Images</h2>
            <p>根据文本描述生成图像。</p>
            <div class="code-block">
              <div class="code-header"><span>POST /v1/images/generations</span></div>
              <pre>{
  "model": "dall-e-3",
  "prompt": "A futuristic city at sunset",
  "size": "1024x1024",
  "quality": "hd",
  "n": 1
}</pre>
            </div>
          </div>

          <div v-if="activeSection === 'models'" class="doc-section">
            <h2>Models</h2>
            <p>列出所有可用模型。</p>
            <div class="code-block">
              <div class="code-header"><span>GET /v1/models</span></div>
              <pre>{
  "object": "list",
  "data": [
    {"id": "gpt-4o", "object": "model", "owned_by": "openai"},
    {"id": "claude-3-5-sonnet", "object": "model", "owned_by": "anthropic"}
  ]
}</pre>
            </div>
          </div>

          <div v-if="activeSection === 'errors'" class="doc-section">
            <h2>错误码</h2>
            <el-table :data="errorCodes" style="width: 100%">
              <el-table-column prop="code" label="状态码" width="100" />
              <el-table-column prop="type" label="类型" width="200" />
              <el-table-column prop="desc" label="说明" />
            </el-table>
          </div>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const activeSection = ref('quickstart')

const docSections = [
  { id: 'quickstart', title: '快速开始' },
  { id: 'chat', title: 'Chat Completions' },
  { id: 'images', title: 'Images' },
  { id: 'models', title: 'Models' },
  { id: 'errors', title: '错误码' },
]

const errorCodes = [
  { code: '400', type: 'invalid_request_error', desc: '请求参数无效' },
  { code: '401', type: 'authentication_error', desc: 'API Key 无效或缺失' },
  { code: '403', type: 'permission_error', desc: '无权访问该模型' },
  { code: '429', type: 'rate_limit_error', desc: '请求频率超限' },
  { code: '500', type: 'server_error', desc: '服务器内部错误' },
  { code: '503', type: 'service_unavailable', desc: '模型暂时不可用' },
]
</script>

<style scoped>
.page {
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-hero {
  padding: 120px 24px 48px;
  text-align: center;
}

.page-hero h1 {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.page-hero p {
  color: var(--text-secondary);
  font-size: 16px;
}

.page-content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.docs-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 32px;
}

.docs-sidebar {
  position: sticky;
  top: 88px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.docs-nav-item {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.docs-nav-item:hover {
  background: var(--bg-card);
  color: var(--text-primary);
}

.docs-nav-item.active {
  background: var(--bg-card);
  color: var(--text-primary);
  font-weight: 500;
  border-left: 2px solid var(--accent-green);
}

.doc-section h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}

.doc-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 32px 0 12px;
}

.doc-section p {
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 16px;
}

.doc-section a {
  color: var(--accent-green);
}

.code-block {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  margin: 16px 0 24px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-secondary);
}

.code-block pre {
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  overflow-x: auto;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }

  .docs-sidebar {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    gap: 8px;
    padding-bottom: 16px;
  }

  .docs-nav-item {
    white-space: nowrap;
  }
}
</style>

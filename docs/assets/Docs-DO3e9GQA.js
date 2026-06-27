import{a as g,A as f}from"./AppFooter-CDsUXBLh.js";import{_ as h,p as l,e as n,h as t,a as e,F as C,s as A,g as i,C as d,d as r,q as I,t as a,n as P,v as x}from"./index-IxzepPf-.js";const B={class:"page"},q={class:"page-content"},w={class:"docs-layout"},H={class:"docs-sidebar"},z=["onClick"],D={class:"docs-main"},L={key:0,class:"doc-section"},R={class:"code-block"},S={class:"code-header"},T={class:"code-block"},j={class:"code-header"},N={key:1,class:"doc-section"},O={key:2,class:"doc-section"},U={key:3,class:"doc-section"},V={key:4,class:"doc-section"},F={__name:"Docs",setup(K){const o=I("quickstart"),_=[{id:"quickstart",title:"快速开始"},{id:"chat",title:"Chat Completions"},{id:"images",title:"Images"},{id:"models",title:"Models"},{id:"errors",title:"错误码"}],y=[{code:"400",type:"invalid_request_error",desc:"请求参数无效"},{code:"401",type:"authentication_error",desc:"API Key 无效或缺失"},{code:"403",type:"permission_error",desc:"无权访问该模型"},{code:"429",type:"rate_limit_error",desc:"请求频率超限"},{code:"500",type:"server_error",desc:"服务器内部错误"},{code:"503",type:"service_unavailable",desc:"模型暂时不可用"}];return(E,s)=>{const k=a("router-link"),c=a("CopyDocument"),m=a("el-icon"),v=a("el-button"),p=a("el-table-column"),b=a("el-table");return l(),n("div",B,[t(g,{variant:"dark"}),s[18]||(s[18]=e("section",{class:"page-hero"},[e("h1",null,"API 文档"),e("p",null,"兼容 OpenAI API 格式，快速接入您的应用")],-1)),e("section",q,[e("div",w,[e("aside",H,[(l(),n(C,null,A(_,u=>e("div",{key:u.id,class:P(["docs-nav-item",{active:o.value===u.id}]),onClick:M=>o.value=u.id},x(u.title),11,z)),64))]),e("div",D,[o.value==="quickstart"?(l(),n("div",L,[s[9]||(s[9]=e("h2",null,"快速开始",-1)),s[10]||(s[10]=e("p",null,"RelayHub 完全兼容 OpenAI API 格式。只需替换 Base URL 和 API Key 即可接入。",-1)),s[11]||(s[11]=e("h3",null,"1. 获取 API Key",-1)),e("p",null,[s[1]||(s[1]=i("在 ",-1)),t(k,{to:"/dashboard"},{default:d(()=>[...s[0]||(s[0]=[i("控制台",-1)])]),_:1}),s[2]||(s[2]=i(" 中创建 API 密钥。",-1))]),s[12]||(s[12]=e("h3",null,"2. 配置 Base URL",-1)),e("div",R,[e("div",S,[s[4]||(s[4]=e("span",null,"Base URL",-1)),t(v,{link:"",size:"small"},{default:d(()=>[t(m,null,{default:d(()=>[t(c)]),_:1}),s[3]||(s[3]=i(" 复制",-1))]),_:1})]),s[5]||(s[5]=e("pre",null,"https://api.relayhub.ai/v1",-1))]),s[13]||(s[13]=e("h3",null,"3. 发送请求",-1)),e("div",T,[e("div",j,[s[7]||(s[7]=e("span",null,"cURL",-1)),t(v,{link:"",size:"small"},{default:d(()=>[t(m,null,{default:d(()=>[t(c)]),_:1}),s[6]||(s[6]=i(" 复制",-1))]),_:1})]),s[8]||(s[8]=e("pre",null,`curl https://api.relayhub.ai/v1/chat/completions \\
  -H "Authorization: Bearer sk-rh-your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`,-1))])])):r("",!0),o.value==="chat"?(l(),n("div",N,[...s[14]||(s[14]=[e("h2",null,"Chat Completions",-1),e("p",null,"创建对话补全，支持流式和非流式响应。",-1),e("div",{class:"code-block"},[e("div",{class:"code-header"},[e("span",null,"POST /v1/chat/completions")]),e("pre",null,`{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false
}`)],-1)])])):r("",!0),o.value==="images"?(l(),n("div",O,[...s[15]||(s[15]=[e("h2",null,"Images",-1),e("p",null,"根据文本描述生成图像。",-1),e("div",{class:"code-block"},[e("div",{class:"code-header"},[e("span",null,"POST /v1/images/generations")]),e("pre",null,`{
  "model": "dall-e-3",
  "prompt": "A futuristic city at sunset",
  "size": "1024x1024",
  "quality": "hd",
  "n": 1
}`)],-1)])])):r("",!0),o.value==="models"?(l(),n("div",U,[...s[16]||(s[16]=[e("h2",null,"Models",-1),e("p",null,"列出所有可用模型。",-1),e("div",{class:"code-block"},[e("div",{class:"code-header"},[e("span",null,"GET /v1/models")]),e("pre",null,`{
  "object": "list",
  "data": [
    {"id": "gpt-4o", "object": "model", "owned_by": "openai"},
    {"id": "claude-3-5-sonnet", "object": "model", "owned_by": "anthropic"}
  ]
}`)],-1)])])):r("",!0),o.value==="errors"?(l(),n("div",V,[s[17]||(s[17]=e("h2",null,"错误码",-1)),t(b,{data:y,style:{width:"100%"}},{default:d(()=>[t(p,{prop:"code",label:"状态码",width:"100"}),t(p,{prop:"type",label:"类型",width:"200"}),t(p,{prop:"desc",label:"说明"})]),_:1})])):r("",!0)])])]),t(f)])}}},$=h(F,[["__scopeId","data-v-a0eef2e5"]]);export{$ as default};

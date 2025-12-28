# 智能助手 Electron 应用 README

一款基于 Electron 开发的跨平台智能助手应用，融合 AI 聊天交互、本地程序快捷调用、聊天记录持久化等核心功能，兼具美观的 UI 设计与流畅的交互体验，支持深浅色主题切换，适配 PC/移动端。

## 🚀 功能特性

### 核心功能

|功能模块|详细说明|
|---|---|
|AI 智能聊天|对接 AI 接口实现智能对话，支持不同 Agent 角色切换（写作/编程/问答等）|
|本地程序快捷调用|模糊指令匹配调用本地程序（记事本、计算器、浏览器、文件管理器等）|
|聊天记录管理|聊天记录自动本地持久化存储，支持一键清空记录，重启应用自动加载|
|主题切换|支持深浅色主题一键切换，主题样式自适应所有界面元素|
|Agent 角色管理|内置多类 Agent 角色，支持自定义 Agent 名称/描述，支持导出/导入 Agent 配置|
### 交互与UI优化

- 🎨 现代化 UI 设计：渐变配色、毛玻璃效果、呼吸动效、波纹点击反馈

- 📱 响应式布局：完美适配 PC/平板/手机等不同尺寸设备

- ⚡ 流畅动效：消息渐入、按钮悬浮/点击动效、菜单过渡动画

- 🖥️ 深浅色主题：自动适配系统配色，支持手动切换，视觉舒适度拉满

- 🔍 模糊指令匹配：支持灵活的自然语言指令（如「帮我开记事本」「启动计算器」）

- 📝 无障碍支持：语义化标签、焦点管理，提升使用体验

## 🛠️ 技术栈

|技术/框架|用途|
|---|---|
|Electron|跨平台桌面应用开发（主进程+渲染进程通信、本地文件操作、系统API调用）|
|HTML5/CSS3|页面结构与样式（CSS变量、Flex布局、自定义动画、响应式设计、滚动条美化）|
|JavaScript (ES6+)|业务逻辑（IPC通信、模糊匹配算法、本地存储、DOM操作）|
|Node.js fs 模块|聊天记录本地文件读写（userData 目录，跨平台兼容）|
|原生CSS动画|波纹动效、呼吸动效、消息渐入、主题切换过渡|
## ⚡ 快速开始

### 环境准备

- 安装 [Node.js](https://nodejs.org/) (v14+ 或 LTS 版本，推荐 v16/v18)

- 确认 npm/yarn 可用（Node.js 自带 npm）

### 安装与启动

1. 克隆/下载项目代码到本地
        `# 克隆（如果使用Git）
git clone <你的仓库地址>
cd <项目目录>`

2. 安装依赖
        `npm install`

3. 启动开发模式（不打包，实时调试）
        `npm start`

4. （可选）打包为可执行文件
        `# 安装打包工具（如electron-builder）
npm install electron-builder --save-dev
# 打包（根据系统自动打包，Windows为exe，macOS为dmg，Linux为deb/rpm）
npx electron-builder`

## 📁 目录结构

```text

├── main.js                # Electron主进程：窗口创建、IPC监听、文件操作、本地程序调用
├── preload.js             # 预加载脚本：暴露安全的API给渲染进程（IPC通信桥）
├── package.json           # 项目依赖与脚本配置
├── README.md              # 项目说明文档
├── www/                   # 渲染进程（前端）资源目录
│   ├── index.html         # 主页面结构
│   ├── css/
│   │   └── style.css      # 核心样式（主题、布局、动效、响应式）
│   └── js/
│       ├── dom.js         # DOM元素缓存
│       ├── main.js        # 前端入口：初始化、事件绑定
│       ├── message.js     # 核心逻辑：消息发送、模糊匹配、记录管理
│       └── config.js      # AI接口配置、Agent角色配置（可选）
└── node_modules/          # 项目依赖（安装后生成）
```

## 🔍 核心功能详解

### 1. AI 聊天交互

- 对接主流 AI 接口（需在 `www/js/config.js` 中配置 `apiKey` 和接口地址）

- 支持不同 Agent 角色切换，不同角色对应不同的系统提示词

- 消息发送/接收动效，加载状态提示，错误处理与反馈

### 2. 本地程序模糊调用

- 支持的默认程序：
        

    - 记事本（关键词：记事本、开记事本、新建文本）

    - 计算器（关键词：计算器、计算、开计算器）

    - 浏览器（关键词：浏览器、上网、edge、chrome）

    - 文件管理器（关键词：文件管理器、资源管理器、打开文件夹）

- 模糊匹配逻辑：输入包含任意关键词即可触发，无需精确指令

- 跨平台兼容：自动适配 Windows/macOS/Linux 系统的程序调用命令

### 3. 聊天记录管理

- 自动存储：每条消息（用户/助手）发送后自动保存到本地 `userData/chatRecords.json`

- 自动加载：应用启动时自动读取历史记录并渲染

- 一键清空：点击「清空记录」按钮，同步清空界面与本地文件（可选二次确认）

- 跨平台存储路径：
        

    - Windows: `C:\Users\<用户名>\AppData\Roaming\ai-chat-assistant-electron\chatRecords.json`

    - macOS: `/Users/<用户名>/Library/Application Support/ai-chat-assistant-electron/chatRecords.json`

    - Linux: `/home/<用户名>/.config/ai-chat-assistant-electron/chatRecords.json`

### 4. 主题切换

- 深浅色主题一键切换，切换后所有 UI 元素（背景、文字、边框、阴影）自动适配

- 主题状态本地缓存（localStorage），重启应用保留上次选择

### 5. Agent 角色管理

- 内置角色：写作助手、编程助手、智能问答、图像生成等

- 自定义 Agent：支持输入自定义名称和描述，切换后生效

- 导出/导入：支持 Agent 配置导出为 JSON，或导入本地配置文件

## ⚙️ 自定义配置

### 1. 修改主色调

编辑 `www/css/style.css` 中 `:root` 下的主色调变量：

```css

:root {
  /* 替换为自定义颜色 */
  --primary-color: #你的主色值;
  --primary-gradient: linear-gradient(90deg, #渐变起始色 0%, #渐变结束色 100%);
}
/* 深色模式适配 */
[data-theme=dark] {
  --primary-color: #深色模式主色值;
  --primary-gradient: linear-gradient(90deg, #深色渐变起始色 0%, #深色渐变结束色 100%);
}
```

### 2. 新增本地程序调用

#### 步骤1：主进程添加调用逻辑（main.js）

```javascript

// 在 openLocalApp 函数中新增 case
case '新增程序标识':
  if (process.platform === 'win32') spawn('程序.exe'); // Windows
  else if (process.platform === 'darwin') spawn('open', ['/应用路径']); // macOS
  else spawn('linux程序名'); // Linux
  break;
```

#### 步骤2：前端添加模糊匹配关键词（www/js/message.js）

```javascript

const CMD_KEYWORD_MAP = {
  // 新增一行
  '新增程序标识': ['关键词1', '关键词2', '关键词3'],
  // 原有配置...
};
// 中文名称映射
const APP_CN_NAME = {
  '新增程序标识': '程序中文名称',
  // 原有配置...
};
```

### 3. 调整界面布局

- 修改 `www/css/style.css` 中 `.welcome-wrap` 的 `max-width` 调整核心区域宽度

- 修改 `.message-list` 的 `max-height` 调整聊天列表高度

- 修改 `:root` 中的 `--border-radius-*` 调整圆角大小

## ❓ 常见问题

### 1. 应用启动失败

- 检查 Node.js 版本是否 ≥14，推荐 LTS 版本

- 执行 `npm install` 重新安装依赖，确保无报错

- 查看命令行日志，定位具体错误（如端口占用、依赖缺失）

### 2. 本地程序调用失败

- 检查系统平台是否适配（Windows/macOS/Linux 程序名不同）

- 查看命令行日志，确认程序调用命令是否正确

- 确保目标程序已安装，且路径在系统环境变量中

### 3. 聊天记录不保存/加载失败

- 检查应用存储目录权限（是否可读写）

- 手动删除 `chatRecords.json` 后重启应用，重新生成文件

- 确认文件格式为合法 JSON（避免手动修改导致格式错误）

### 4. 移动端适配异常

- 检查 CSS 中 `@media` 媒体查询是否覆盖目标设备尺寸

- 确认 `meta` 标签已添加（index.html）：
        `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

## 📌 后续规划

|待开发功能|说明|
|---|---|
|语音交互|集成语音识别/合成，支持语音输入/输出|
|聊天记录导出|支持导出聊天记录为 TXT/JSON/Markdown|
|插件系统|支持自定义插件扩展功能|
|快捷键支持|新增全局快捷键（如 Ctrl+Enter 发送消息）|
|多语言支持|适配中英文等多语言界面|
|窗口置顶/最小化|新增窗口置顶、最小化到托盘功能|
## 📄 许可证

本项目基于 MIT 许可证开源，可自由修改、分发和商用，如需二次发布请保留原作者信息。

## 📞 反馈与建议

如果遇到问题或有功能建议，欢迎通过以下方式反馈：

- Issue: [提交问题](https://github.com/你的用户名/你的仓库/issues)

- 邮箱: your-email@example.com

- 微信: your-wechat-id

---

**最后更新时间**：2025年12月23日
**开发环境**：Node.js 18.x + Electron 28.x + Chrome 120（Electron 内置）
> （注：文档部分内容可能由 AI 生成）
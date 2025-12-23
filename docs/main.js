// 程序初始化函数
const initApp = () => {
    // 1. 初始化主题
    initTheme();
    bindThemeEvent();

    // 2. 初始化输入框状态
    updateInputState();

    // 3. 初始化Agent（兼容本地存储）
    const savedAgent = localStorage.getItem('currentAgent');
    if (savedAgent) {
        try {
            const parsedAgent = JSON.parse(savedAgent);
            // 验证Agent结构完整性
            if (parsedAgent.id && parsedAgent.name && parsedAgent.prompt) {
                currentAgent = parsedAgent;
                DOM.currentAgentTag.textContent = `(${currentAgent.name})`;
            }
        } catch (e) {
            console.error('解析本地Agent失败:', e);
            currentAgent = AGENT_LIST[0];
        }
    }
    renderAgentList();
    bindAgentEvent();

    // 4. 【新增】加载并渲染对话历史（记忆功能）
    loadChatHistory();
    renderChatHistory();

    // 5. 绑定消息事件
    bindMessageEvent();

    // 6. 初始化波纹动效
    initRippleEffect();

    // 7. 预加载头像图片
    const avatarImg = new Image();
    avatarImg.src = 'https://via.placeholder.com/52/4096ff/ffffff?text=豆';
    avatarImg.onerror = () => {
        console.warn('头像图片加载失败，使用默认样式');
    };
};

// 页面加载完成后启动程序（添加DOMContentLoaded兜底）
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', initApp);
}

// 窗口加载完成后再次确保滚动容器可用
window.addEventListener('load', () => {
    scrollToMessageBottom();
});
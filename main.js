// 程序初始化函数
const initApp = () => {
    // 1. 初始化主题
    initTheme();
    bindThemeEvent();

    // 2. 初始化输入框状态
    updateInputState();

    // 3. 初始化Agent
    const savedAgent = localStorage.getItem('currentAgent');
    if (savedAgent) {
        currentAgent = JSON.parse(savedAgent);
        DOM.currentAgentTag.textContent = `(${currentAgent.name})`;
    }
    renderAgentList();
    bindAgentEvent();

    // 4. 绑定消息事件
    bindMessageEvent();

    // 5. 初始化波纹动效
    initRippleEffect();

    // 6. 预加载头像图片
    const avatarImg = new Image();
    avatarImg.src = 'https://via.placeholder.com/52/4096ff/ffffff?text=豆';
};

// 页面加载完成后启动程序
document.addEventListener('DOMContentLoaded', initApp);
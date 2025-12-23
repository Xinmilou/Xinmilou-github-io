// 更新输入框状态（字数、清空按钮、发送按钮）
const updateInputState = () => {
    const value = DOM.inputField.value.trim();
    const length = DOM.inputField.value.length;
    const maxLength = 500;
    DOM.charCount.textContent = `${length}/${maxLength}`;
    DOM.charCount.classList.toggle('warning', length > maxLength * 0.8);
    DOM.inputContainer.classList.toggle('input-has-content', !!value);
    DOM.sendBtn.disabled = !value;
    DOM.sendBtn.setAttribute('aria-disabled', !value);
};

// 发送消息
const sendMessage = async () => {
    const value = DOM.inputField.value.trim();
    if (!value) return;

    // 添加用户消息
    const userMsg = document.createElement('div');
    userMsg.className = 'message-item';
    userMsg.innerHTML = `<div class="message-avatar">我</div><div class="message-content">${escapeHtml(value)}</div>`;
    DOM.messageList.appendChild(userMsg);
    DOM.inputField.value = '';
    updateInputState();
    DOM.messageList.scrollTop = DOM.messageList.scrollHeight;
    showMessageFeedback('发送成功');

    // 添加助手加载消息
    const assistantMsg = document.createElement('div');
    assistantMsg.className = 'message-item';
    assistantMsg.innerHTML = `<div class="message-avatar">豆</div><div class="message-content" id="assistantReply"><div class="loading">正在思考...</div></div>`;
    DOM.messageList.appendChild(assistantMsg);
    DOM.messageList.scrollTop = DOM.messageList.scrollHeight;

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: API_CONFIG.chatModel,
                messages: [
                    { role: 'system', content: currentAgent.prompt },
                    { role: 'user', content: value }
                ],
                temperature: API_CONFIG.temperature,
                max_tokens: API_CONFIG.max_tokens,
                top_p: API_CONFIG.top_p,
                presence_penalty: API_CONFIG.presence_penalty,
                frequency_penalty: API_CONFIG.frequency_penalty
            })
        });
        if (!response.ok) throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        const data = await response.json();
        document.getElementById('assistantReply').innerHTML = escapeHtml(data.choices[0].message.content);
        DOM.messageList.scrollTop = DOM.messageList.scrollHeight;
        announce('收到新回复');
    } catch (error) {
        console.error('API错误:', error);
        document.getElementById('assistantReply').innerHTML = `<div class="error">抱歉，暂时无法回复。错误：${error.message}</div>`;
        showMessageFeedback('消息发送失败');
    }
};

// 绑定功能按钮事件
const bindFunctionBtnEvent = () => {
    DOM.functionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.functionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (btn === DOM.moreBtn) {
                DOM.moreMenu.classList.toggle('show');
            } else {
                DOM.moreMenu.classList.remove('show');
            }
            const btnText = btn.textContent.trim().replace('更多', '');
            announce(`已选中${btnText || '更多'}功能`);
        });
    });

    // 点击外部关闭更多菜单
    document.addEventListener('click', (e) => {
        if (!DOM.moreBtn.contains(e.target)) DOM.moreMenu.classList.remove('show');
    });
};

// 绑定消息相关事件
const bindMessageEvent = () => {
    // 输入框监听
    DOM.inputField.addEventListener('input', debounce(updateInputState));

    // 清空按钮
    DOM.clearBtn.addEventListener('click', () => {
        DOM.inputField.value = '';
        updateInputState();
        DOM.inputField.focus();
        announce('输入框已清空');
    });

    // 回车发送
    DOM.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!DOM.sendBtn.disabled) sendMessage();
        }
    });

    // 发送按钮
    DOM.sendBtn.addEventListener('click', sendMessage);

    // 深度思考按钮
    DOM.deepThinkBtn.addEventListener('click', () => {
        DOM.deepThinkBtn.classList.toggle('active');
        const isActive = DOM.deepThinkBtn.classList.contains('active');
        DOM.deepThinkBtn.setAttribute('aria-pressed', isActive);
        announce(isActive ? '深度思考模式已开启' : '深度思考模式已关闭');
    });

    // 头像双击
    DOM.avatar.addEventListener('dblclick', () => {
        DOM.avatar.style.transform = 'scale(1.2)';
        setTimeout(() => DOM.avatar.style.transform = 'scale(1.08)', 300);
        announce('已打开助手个人中心');
    });

    // 功能按钮事件
    bindFunctionBtnEvent();
};
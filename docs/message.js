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

// 优化滚动函数：确保滚动到底部100%生效
const scrollToMessageBottom = () => {
    // 强制重绘（解决DOM渲染延迟导致的滚动失效）
    void DOM.messageList.offsetHeight;
    // 立即滚动
    DOM.messageList.scrollTop = DOM.messageList.scrollHeight;
    // 异步兜底（兼容部分浏览器渲染机制）
    setTimeout(() => {
        DOM.messageList.scrollTop = DOM.messageList.scrollHeight;
    }, 0);
};

// 【新增】渲染历史消息到页面（初始化/加载历史时调用）
const renderChatHistory = () => {
    DOM.messageList.innerHTML = '';
    chatHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
            const msgItem = document.createElement('div');
            msgItem.className = `message-item ${msg.role === 'user' ? 'user' : ''}`;
            const avatarText = msg.role === 'user' ? '我' : '豆';
            msgItem.innerHTML = `<div class="message-avatar">${avatarText}</div><div class="message-content">${escapeHtml(msg.content)}</div>`;
            DOM.messageList.appendChild(msgItem);
        }
    });
    scrollToMessageBottom();
};

// 发送消息（核心修改：携带上下文）
const sendMessage = async () => {
    const value = DOM.inputField.value.trim();
    if (!value) return;

    // 禁用发送按钮，防止重复发送
    DOM.sendBtn.disabled = true;
    DOM.sendBtn.setAttribute('aria-disabled', true);

    // 1. 添加用户消息到页面
    const userMsg = document.createElement('div');
    userMsg.className = 'message-item user';
    userMsg.innerHTML = `<div class="message-avatar">我</div><div class="message-content">${escapeHtml(value)}</div>`;
    DOM.messageList.appendChild(userMsg);
    DOM.inputField.value = '';
    updateInputState();
    scrollToMessageBottom();
    showMessageFeedback('发送成功');

    // 2. 添加用户消息到对话历史
    const userChatMsg = { role: 'user', content: value };
    chatHistory.push(userChatMsg);
    saveChatHistory(); // 保存到本地

    // 3. 添加助手加载消息
    const replyId = `assistantReply-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const assistantMsg = document.createElement('div');
    assistantMsg.className = 'message-item';
    assistantMsg.innerHTML = `<div class="message-avatar">豆</div><div class="message-content" id="${replyId}"><div class="loading">正在思考...</div></div>`;
    DOM.messageList.appendChild(assistantMsg);
    scrollToMessageBottom();

    try {
        // 4. 构造API请求的messages：系统提示词 + 历史对话 + 当前消息
        const requestMessages = [
            { role: 'system', content: currentAgent.prompt }, // 角色设定
            ...chatHistory // 完整的对话历史（包含本次用户消息）
        ];

        const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: API_CONFIG.chatModel,
                messages: requestMessages, // 核心：传上下文
                temperature: DOM.deepThinkBtn.classList.contains('active') ? 0.2 : API_CONFIG.temperature,
                max_tokens: API_CONFIG.max_tokens,
                top_p: API_CONFIG.top_p,
                presence_penalty: API_CONFIG.presence_penalty,
                frequency_penalty: API_CONFIG.frequency_penalty
            })
        });

        if (!response.ok) throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        const data = await response.json();
        const assistantContent = data.choices[0].message.content;
        
        // 5. 更新页面上的助手消息
        const replyElement = document.getElementById(replyId);
        if (replyElement) {
            replyElement.innerHTML = escapeHtml(assistantContent);
        }

        // 6. 添加助手消息到对话历史
        const assistantChatMsg = { role: 'assistant', content: assistantContent };
        chatHistory.push(assistantChatMsg);
        saveChatHistory(); // 保存到本地

        scrollToMessageBottom();
        announce('收到新回复');
    } catch (error) {
        console.error('API错误:', error);
        const replyElement = document.getElementById(replyId);
        if (replyElement) {
            replyElement.innerHTML = `<div class="error">抱歉，暂时无法回复。错误：${error.message}</div>`;
        }
        showMessageFeedback('消息发送失败');
        // 失败时移除本次用户消息（避免历史记录污染）
        chatHistory.pop();
        saveChatHistory();
    } finally {
        // 恢复发送按钮状态
        updateInputState();
    }
};

// 绑定功能按钮事件
const bindFunctionBtnEvent = () => {
    DOM.functionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.functionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 【新增】点击清空记忆按钮时触发清空
            if (btn.textContent.includes('清空记忆')) {
                clearChatHistory();
                renderChatHistory(); // 清空页面消息
                return;
            }

            if (btn === DOM.moreBtn) {
                DOM.moreMenu.classList.toggle('show');
            } else {
                DOM.moreMenu.classList.remove('show');
            }
            const btnText = btn.textContent.trim().replace('更多', '').replace('清空记忆', '');
            announce(`已选中${btnText || '更多'}功能`);
        });
    });

    // 点击外部关闭更多菜单
    document.addEventListener('click', (e) => {
        if (!DOM.moreBtn.contains(e.target) && !DOM.moreMenu.contains(e.target)) {
            DOM.moreMenu.classList.remove('show');
        }
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
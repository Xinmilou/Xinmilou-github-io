// 渲染Agent列表
const renderAgentList = () => {
    DOM.agentList.innerHTML = '';
    AGENT_LIST.forEach(agent => {
        const agentItem = document.createElement('div');
        agentItem.className = `agent-item ${agent.id === currentAgent.id ? 'active' : ''}`;
        agentItem.innerHTML = `
            <div class="agent-name">${agent.name}</div>
            <div class="agent-desc">${agent.desc}</div>
        `;
        agentItem.addEventListener('click', () => {
            currentAgent = agent;
            localStorage.setItem('currentAgent', JSON.stringify(currentAgent));
            renderAgentList();
            DOM.agentPanel.classList.remove('show');
            DOM.currentAgentTag.textContent = `(${agent.name})`;
            showMessageFeedback(`已切换至【${agent.name}】`);
            
            // 【新增】切换角色时清空对话历史（不同角色上下文无关）
            clearChatHistory();
            renderChatHistory(); // 清空页面消息
        });
        DOM.agentList.appendChild(agentItem);
    });
};

// 导出Agent数据
const exportAgentData = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `agents-backup-${timestamp}.json`;
    const jsonStr = JSON.stringify(AGENT_LIST, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }, 100);
    showMessageFeedback('角色列表导出成功');
};

// 导入Agent数据
const importAgentData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/json') {
        showMessageFeedback('请选择JSON格式的备份文件');
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedAgents = JSON.parse(e.target.result);
            if (!Array.isArray(importedAgents)) throw new Error('备份文件格式错误，不是数组');
            importedAgents.forEach(agent => {
                if (agent.id && agent.name && agent.prompt) {
                    const existIndex = AGENT_LIST.findIndex(item => item.id === agent.id);
                    existIndex > -1 ? AGENT_LIST[existIndex] = agent : AGENT_LIST.push(agent);
                }
            });
            renderAgentList();
            localStorage.setItem('currentAgent', JSON.stringify(currentAgent));
            showMessageFeedback('角色列表导入成功');
        } catch (err) {
            showMessageFeedback(`导入失败：${err.message}`);
        } finally {
            event.target.value = '';
        }
    };
    reader.readAsText(file);
};

// 保存自定义Agent
const saveCustomAgent = () => {
    const name = DOM.customAgentName.value.trim();
    const prompt = DOM.customAgentPrompt.value.trim();
    if (!name || !prompt) {
        showMessageFeedback('请填写角色名称和设定');
        return;
    }
    const newAgent = {
        id: 'custom_' + Date.now(),
        name,
        desc: '自定义角色',
        prompt
    };
    AGENT_LIST.push(newAgent);
    currentAgent = newAgent;
    localStorage.setItem('currentAgent', JSON.stringify(currentAgent));
    DOM.customAgentName.value = '';
    DOM.customAgentPrompt.value = '';
    renderAgentList();
    DOM.currentAgentTag.textContent = `(${name})`;
    showMessageFeedback(`已创建自定义角色【${name}】`);
};

// 绑定Agent相关事件
const bindAgentEvent = () => {
    // 切换Agent面板
    DOM.agentToggle.addEventListener('click', () => {
        DOM.agentPanel.classList.toggle('show');
        renderAgentList();
    });

    // 点击外部关闭面板
    document.addEventListener('click', (e) => {
        if (!DOM.agentToggle.contains(e.target) && !DOM.agentPanel.contains(e.target)) {
            DOM.agentPanel.classList.remove('show');
        }
    });

    // 保存自定义Agent
    DOM.saveCustomAgent.addEventListener('click', saveCustomAgent);

    // 导出导入事件
    DOM.exportAgents.addEventListener('click', exportAgentData);
    DOM.importFile.addEventListener('change', importAgentData);
};
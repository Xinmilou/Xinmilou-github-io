/**
 * 点歌工作流 - 基于BaseWorkflow实现
 * 节点：前置校验 → 渲染用户消息 → 渲染加载 → 搜歌 → 渲染播放器 → 保存记录 → 后置处理
 */
class MusicWorkflow extends BaseWorkflow {
  constructor() {
    super();
    this.maxRetry = 2; // 点歌工作流最大重试次数
    this.initNodes(); // 初始化节点
    this.bindEvents(); // 绑定事件监听
  }

  /**
   * 初始化点歌工作流节点
   */
  initNodes() {
    // 节点1：前置校验（必填）
    const preCheckNode = new WorkflowNode('preCheck');
    preCheckNode.execute = async function(context) {
      const { keyword, DOM } = context;
      
      // 1. 校验输入合法性
      if (!keyword || !keyword.trim()) {
        window.showMessageFeedback('请输入歌曲名/歌手名');
        throw new Error('点歌关键词不能为空');
      }

      // 2. 禁用发送按钮防重复点击
      if (DOM.sendBtn) {
        DOM.sendBtn.disabled = true;
        DOM.sendBtn.setAttribute('aria-disabled', true);
      }

      // 3. 生成唯一回复ID（用于渲染播放器）
      const replyId = `musicReply-${Date.now()}`;
      
      return { replyId };
    };
    this.addNode(preCheckNode);

    // 节点2：渲染用户点歌消息
    const renderUserMsgNode = new WorkflowNode('renderUserMsg');
    renderUserMsgNode.execute = async function(context) {
      const { keyword, replyId, DOM } = context;
      const escapeHtmlFunc = window.escapeHtml || (str => str);

      // 构建用户消息DOM（复用现有样式）
      const userMsg = document.createElement('div');
      userMsg.className = 'message-item user';
      userMsg.innerHTML = `
        <div class="message-avatar">我</div>
        <div class="message-content">
          <div class="music-mode-tip">点歌：</div>
          ${escapeHtmlFunc(keyword.trim())}
        </div>
      `;

      // 添加到消息列表
      if (DOM.messageList) {
        DOM.messageList.appendChild(userMsg);
      }

      // 清空输入框并更新状态
      if (DOM.inputField) {
        DOM.inputField.value = '';
      }
      window.updateInputState();
      window.scrollToMessageBottom();

      return { userMsgDom: userMsg };
    };
    this.addNode(renderUserMsgNode);

    // 节点3：渲染加载状态
    const renderLoadingNode = new WorkflowNode('renderLoading');
    renderLoadingNode.execute = async function(context) {
      const { replyId, DOM } = context;

      // 构建加载状态DOM
      const assistantMsg = document.createElement('div');
      assistantMsg.className = 'message-item';
      assistantMsg.innerHTML = `
        <div class="message-avatar">豆</div>
        <div class="message-content" id="${replyId}">
          <div class="loading">正在搜索歌曲...</div>
        </div>
      `;

      // 添加到消息列表
      if (DOM.messageList) {
        DOM.messageList.appendChild(assistantMsg);
      }
      window.scrollToMessageBottom();

      return { loadingDom: assistantMsg };
    };
    this.addNode(renderLoadingNode);

    // 节点4：核心 - 搜索歌曲（带接口降级）
    const searchMusicNode = new WorkflowNode('searchMusic');
    searchMusicNode.execute = async function(context) {
      const { keyword } = context;

      // 调用全局搜歌函数
      if (!window.getMusicUrl) {
        throw new Error('搜歌函数未定义');
      }

      const music = await window.getMusicUrl(keyword.trim());
      
      // 校验返回结果
      if (!music || !music.url) {
        throw new Error('未获取到可播放的歌曲链接');
      }

      return { music };
    };
    this.addNode(searchMusicNode);

    // 节点5：渲染音频播放器
    const renderPlayerNode = new WorkflowNode('renderPlayer');
    renderPlayerNode.execute = async function(context) {
      const { music, replyId, DOM } = context;

      // 调用全局播放器渲染函数
      if (!window.renderMusicPlayer) {
        throw new Error('播放器渲染函数未定义');
      }

      window.renderMusicPlayer(music, replyId);
      const playerDom = document.getElementById(replyId);

      return { playerDom };
    };
    this.addNode(renderPlayerNode);

    // 节点6：保存点歌记录到本地
    const saveHistoryNode = new WorkflowNode('saveHistory');
    saveHistoryNode.execute = async function(context) {
      const { keyword, music } = context;

      try {
        // 初始化聊天历史
        window.chatHistory = window.chatHistory || [];
        
        // 添加点歌记录
        window.chatHistory.push(
          { role: 'user', content: `点歌：${keyword.trim()}` },
          { role: 'assistant', content: `[音乐]${music.name}-${music.singer}|${music.url}` }
        );

        // 保存到本地存储
        if (window.saveChatHistory) {
          window.saveChatHistory();
        }

        return { isSaved: true };
      } catch (error) {
        console.error('保存点歌记录失败:', error);
        return { isSaved: false }; // 保存失败不终止流程
      }
    };
    this.addNode(saveHistoryNode);

    // 节点7：后置处理（恢复状态+反馈）
    const postProcessNode = new WorkflowNode('postProcess');
    postProcessNode.execute = async function(context) {
      const { music, DOM, isSaved } = context;

      // 1. 恢复发送按钮状态
      window.updateInputState();

      // 2. 重置点歌按钮激活态
      if (DOM.functionBtns) {
        const musicBtn = Array.from(DOM.functionBtns).find(btn => btn.textContent.includes('点歌'));
        if (musicBtn) {
          musicBtn.classList.remove('music-active');
        }
      }

      // 3. 无障碍播报
      if (window.announce && music) {
        window.announce(`已为你找到歌曲${music.name}，点击播放按钮即可收听`);
      }

      // 4. 消息反馈
      if (window.showMessageFeedback) {
        if (music) {
          window.showMessageFeedback(`已为你找到《${music.name} - ${music.singer}》`);
        } else {
          window.showMessageFeedback('点歌完成');
        }
      }

      // 5. 可选：退出点歌模式（注释则保持点歌模式）
      // if (window.toggleMusicMode) {
      //   window.toggleMusicMode(false);
      // }

      return { isCompleted: true };
    };
    this.addNode(postProcessNode);
  }

  /**
   * 绑定工作流事件（用于状态提示/调试）
   */
  bindEvents() {
    // 工作流开始
    this.on('start', (context) => {
      console.log('点歌工作流开始执行', context);
    });

    // 节点开始执行
    this.on('nodeStart', ({ nodeName }) => {
      console.log(`开始执行节点：${nodeName}`);
    });

    // 节点执行完成
    this.on('nodeEnd', ({ nodeName }) => {
      console.log(`节点执行完成：${nodeName}`);
    });

    // 工作流重试
    this.on('retry', ({ count, error }) => {
      console.log(`点歌工作流重试第${count}次，错误：${error}`);
      window.showMessageFeedback(`搜索失败，正在重试第${count}次...`);
    });

    // 工作流完成
    this.on('complete', ({ status }) => {
      console.log(`点歌工作流执行完成，状态：${status}`);
    });

    // 工作流错误
    this.on('error', (error) => {
      console.error('点歌工作流执行错误:', error);
    });
  }

  /**
   * 重写清理逻辑（点歌专属）
   */
  cleanup() {
    super.cleanup();
    // 恢复点歌模式标记（可选）
    // window.isMusicMode = false;
  }
}

// 全局挂载点歌工作流实例
window.MusicWorkflow = MusicWorkflow;
window.musicWorkflow = new MusicWorkflow();
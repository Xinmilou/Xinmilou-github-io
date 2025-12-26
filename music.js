/**
 * 点歌功能核心逻辑
 */
// ========== 音乐接口请求 ==========
/**
 * 获取音乐信息（带接口降级）
 * @param {string} keyword 歌曲名/歌手名
 * @returns {Promise<Object>} 音乐信息
 */
const getMusicUrl = async (keyword) => {
  const MUSIC_CONFIG = window.MUSIC_CONFIG || {
    baseUrl: 'https://api.uomg.com/api/rand.music',
    backupUrl: 'https://api.itooi.cn/music/netease/search'
  };

  // 主接口：UOMG 随机音乐（支持直接获取播放链接）
  try {
    const response = await fetch(`${MUSIC_CONFIG.baseUrl}?sort=热歌榜&format=json`);
    if (!response.ok) throw new Error('主接口返回异常');
    
    const data = await response.json();
    if (data.code !== 1 || !data.data?.url) {
      throw new Error('主接口无有效数据');
    }

    return {
      name: data.data.name || '未知歌曲',
      singer: data.data.singer || '未知歌手',
      url: data.data.url,
      cover: data.data.picurl || 'https://via.placeholder.com/60/4096ff/ffffff?text=音乐'
    };
  } catch (mainError) {
    console.warn('主接口失败，尝试备用接口:', mainError);
    
    // 备用接口：网易云音乐搜索
    try {
      const encodeKeyword = encodeURIComponent(keyword);
      const response = await fetch(`${MUSIC_CONFIG.backupUrl}?keywords=${encodeKeyword}&type=1`);
      if (!response.ok) throw new Error('备用接口返回异常');
      
      const data = await response.json();
      if (!data.result || data.result.songs.length === 0) {
        throw new Error('未找到相关歌曲');
      }

      const song = data.result.songs[0];
      // 备用接口需要额外获取播放链接（示例，需根据实际接口调整）
      const playResponse = await fetch(`https://api.itooi.cn/music/netease/url?id=${song.id}&br=320000`);
      const playData = await playResponse.json();
      
      return {
        name: song.name,
        singer: song.artists.map(artist => artist.name).join('/'),
        url: playData.data[0]?.url || '',
        cover: song.album.picUrl || 'https://via.placeholder.com/60/4096ff/ffffff?text=音乐'
      };
    } catch (backupError) {
      console.error('备用接口也失败:', backupError);
      throw new Error(`点歌失败：${backupError.message}`);
    }
  }
};

// ========== 播放器渲染 ==========
/**
 * 渲染音乐播放器
 * @param {Object} music 音乐信息
 * @param {string} containerId 容器ID
 */
const renderMusicPlayer = (music, containerId) => {
  if (!music || !containerId) return;
  
  const container = document.getElementById(containerId);
  if (!container) return;

  // 构建播放器HTML
  const playerHtml = `
    <div class="music-player">
      <div class="music-info">
        <img class="music-cover" src="${music.cover}" alt="${music.name}封面" onerror="this.src='https://via.placeholder.com/60/4096ff/ffffff?text=音乐'">
        <div class="music-meta">
          <div class="music-name">${window.escapeHtml(music.name)}</div>
          <div class="music-singer">${window.escapeHtml(music.singer)}</div>
        </div>
      </div>
      <div class="audio-controls">
        <audio controls preload="metadata">
          <source src="${music.url}" type="audio/mpeg">
          您的浏览器不支持音频播放
        </audio>
      </div>
    </div>
  `;

  // 替换容器内容
  container.innerHTML = playerHtml;
  
  // 自动播放（需用户交互后才能触发，浏览器限制）
  const audio = container.querySelector('audio');
  if (audio) {
    audio.addEventListener('error', () => {
      container.innerHTML += `<div style="color:var(--text-warning);font-size:12px;margin-top:8px;">播放失败：音频链接无效</div>`;
    });
  }
};

// ========== 消息发送逻辑兼容 ==========
// 备份原sendMessage方法（避免覆盖）
const originalSendMessage = window.sendMessage;

// 重写sendMessage：区分点歌模式/普通模式
window.sendMessage = async () => {
  const DOM = window.DOM;
  const value = DOM?.inputField?.value?.trim();
  if (!value) return;

  // 仅点歌模式触发工作流，普通模式走原逻辑
  if (window.isMusicMode) {
    try {
      await window.musicWorkflow.run({
        keyword: value,
        DOM: window.DOM
      });
    } catch (error) {
      console.error('点歌工作流执行失败:', error);
      // 点歌失败时提示，不阻断后续操作
      if (window.showMessageFeedback) {
        window.showMessageFeedback(`点歌失败：${error.message}`);
      }
      // 恢复发送按钮状态
      if (window.updateInputState) {
        window.updateInputState();
      }
    }
  } else {
    // 普通消息/翻译消息：调用原sendMessage
    if (originalSendMessage) {
      originalSendMessage();
    }
  }
};

// ========== 点歌模式切换 ==========
/**
 * 切换点歌模式
 * @param {boolean} isEnable 是否启用
 */
const toggleMusicMode = (isEnable) => {
  window.isMusicMode = isEnable;
  const DOM = window.DOM;
  
  // 更新点歌按钮状态
  if (DOM?.functionBtns) {
    const musicBtn = Array.from(DOM.functionBtns).find(btn => btn.textContent.includes('点歌'));
    if (musicBtn) {
      if (isEnable) {
        musicBtn.classList.add('active', 'music-active');
      } else {
        musicBtn.classList.remove('active', 'music-active');
      }
    }
  }
  
  // 提示用户
  if (window.showMessageFeedback) {
    window.showMessageFeedback(isEnable ? '已切换到点歌模式，输入歌曲名即可点歌' : '已退出点歌模式');
  }
};

// ========== 挂载全局方法 ==========
window.getMusicUrl = getMusicUrl;
window.renderMusicPlayer = renderMusicPlayer;
window.toggleMusicMode = toggleMusicMode;
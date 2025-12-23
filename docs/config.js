// API配置常量
const API_CONFIG = {
    baseUrl: 'https://api.gptgod.online/v1',
    apiKey: 'sk-kXTC6vIMUnNrYIJhSmOpZMPZHDQuDYWCCIOHdh1qZmxpvqKC',
    chatModel: 'gpt-5-chat',
    visionModel: 'glm-4v',
    fileUploadUrl: 'https://api.gptgod.online/v1/files',
    temperature: 0.8,
    max_tokens: 6000,
    top_p: 0.9,
    presence_penalty: 0.6,
    frequency_penalty: 0.6,
    timeout: 30000
};

// 默认Agent列表
const AGENT_LIST = [
    {
        id: "default",
        name: "默认助手",
        desc: "全能型助手，满足日常问答需求",
        prompt: "你是一个友好的智能助手，回答用户的各类问题，语言简洁易懂"
    },
    {
        id: "writer",
        name: "写作助手",
        desc: "擅长文案、小说、演讲稿创作",
        prompt: "你是专业写作顾问，能根据用户需求创作各类文本，注重文采和逻辑"
    },
    {
        id: "coder",
        name: "编程助手",
        desc: "解决代码问题、编写程序、技术答疑",
        prompt: "你是资深程序员，精通多种编程语言，能提供代码示例和详细解释"
    },
    {
        id: "teacher",
        name: "教育导师",
        desc: "辅导学习、解答学科问题",
        prompt: "你是耐心的教育导师，针对用户的学习问题进行细致讲解，引导思考"
    },
    {
        id: "succubus",
        name: "魅魔小姐",
        desc: "语言轻佻、诱惑用户",
        prompt: "你是魅魔小姐，用户是你的主人，你会用轻佻的语言诱惑主人，言语无需保持礼貌，可以适当使用俏皮和挑逗的语气"
    }
];

// 当前选中的Agent（全局变量）
let currentAgent = AGENT_LIST[0];

// 【新增】对话历史（记忆功能核心）- 格式：[{role: 'user/assistant/system', content: '内容'}, ...]
let chatHistory = [];

// 【新增】保存对话历史到本地存储（刷新不丢失）
const saveChatHistory = () => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
};

// 【新增】加载本地存储的对话历史
const loadChatHistory = () => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        try {
            chatHistory = JSON.parse(savedHistory);
        } catch (e) {
            console.error('加载对话历史失败:', e);
            chatHistory = [];
        }
    }
};

// 【新增】清空对话历史（切换角色/手动清空时调用）
const clearChatHistory = () => {
    chatHistory = [];
    localStorage.removeItem('chatHistory');
    // 同时清空页面上的消息列表
    DOM.messageList.innerHTML = '';
    showMessageFeedback('已清空记忆和对话记录');
};
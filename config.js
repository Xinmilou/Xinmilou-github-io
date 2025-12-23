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
    }
];

// 当前选中的Agent（全局变量）
let currentAgent = AGENT_LIST[0];
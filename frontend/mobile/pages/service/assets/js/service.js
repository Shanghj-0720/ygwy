/**
 * 智能客服 - 交互逻辑
 * 功能: 文字/语音输入、消息发送、对话历史管理
 */

// 配置
const CONFIG = {
    API_BASE_URL: '/api',
    SESSION_STORAGE_KEY: 'chat_session_id'
};

// 状态管理
const state = {
    sessionId: null,
    isRecording: false,
    recognition: null,
    messages: []
};

// DOM 元素
const elements = {
    messageList: null,
    messageInput: null,
    sendBtn: null,
    voiceBtn: null,
    voiceRecording: null
};

/**
 * 初始化应用
 */
async function init() {
    // 获取 DOM 元素
    elements.messageList = document.getElementById('messageList');
    elements.messageInput = document.getElementById('messageInput');
    elements.sendBtn = document.getElementById('sendBtn');
    elements.voiceBtn = document.getElementById('voiceBtn');
    elements.voiceRecording = document.getElementById('voiceRecording');

    // 初始化会话
    await initSession();

    // 绑定事件
    bindEvents();

    // 初始化语音识别
    initSpeechRecognition();

    console.log('智能客服已初始化');
}

/**
 * 初始化或恢复会话
 */
async function initSession() {
    // 尝试从 sessionStorage 恢复会话
    const savedSessionId = sessionStorage.getItem(CONFIG.SESSION_STORAGE_KEY);

    if (savedSessionId) {
        state.sessionId = savedSessionId;
        console.log('恢复会话:', state.sessionId);
    } else {
        // 创建新会话
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/chat/session`, {
                method: 'POST'
            });
            const data = await response.json();

            if (data.success) {
                state.sessionId = data.session_id;
                sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, state.sessionId);
                console.log('创建新会话:', state.sessionId);
            }
        } catch (error) {
            console.error('创建会话失败:', error);
            showError('初始化失败,请刷新页面重试');
        }
    }
}

/**
 * 绑定事件监听
 */
function bindEvents() {
    // 输入框事件
    elements.messageInput.addEventListener('input', handleInputChange);
    elements.messageInput.addEventListener('keydown', handleKeyDown);

    // 发送按钮
    elements.sendBtn.addEventListener('click', handleSendMessage);

    // 语音按钮
    elements.voiceBtn.addEventListener('click', handleVoiceClick);

    // 自动调整输入框高度
    elements.messageInput.addEventListener('input', autoResizeTextarea);
}

/**
 * 处理输入框变化
 */
function handleInputChange(e) {
    const value = e.target.value.trim();
    elements.sendBtn.disabled = !value;
}

/**
 * 处理键盘事件
 */
function handleKeyDown(e) {
    // Enter 发送消息 (Shift+Enter 换行)
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!elements.sendBtn.disabled) {
            handleSendMessage();
        }
    }
}

/**
 * 自动调整输入框高度
 */
function autoResizeTextarea() {
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 120) + 'px';
}

/**
 * 发送消息
 */
async function handleSendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message) return;

    // 清空输入框
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    elements.sendBtn.disabled = true;

    // 显示用户消息
    addMessage('user', message);

    // 显示打字指示器
    showTypingIndicator();

    // 调用 API
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                session_id: state.sessionId
            })
        });

        const data = await response.json();

        // 移除打字指示器
        hideTypingIndicator();

        if (data.success) {
            // 更新 session_id (如果服务器返回了新的)
            if (data.session_id) {
                state.sessionId = data.session_id;
                sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, state.sessionId);
            }

            // 显示 AI 回复
            addMessage('assistant', data.message);
        } else {
            showError('抱歉,服务暂时不可用,请稍后重试');
        }
    } catch (error) {
        hideTypingIndicator();
        console.error('发送消息失败:', error);
        showError('网络错误,请检查连接后重试');
    }
}

/**
 * 添加消息到聊天列表
 */
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '我' : 'AI';

    const bubbleWrapper = document.createElement('div');

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();

    bubbleWrapper.appendChild(bubble);
    bubbleWrapper.appendChild(time);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubbleWrapper);

    elements.messageList.appendChild(messageDiv);

    // 滚动到底部
    scrollToBottom();

    // 保存消息
    state.messages.push({ role, content, time: time.textContent });
}

/**
 * 显示打字指示器
 */
function showTypingIndicator() {
    const existingIndicator = document.querySelector('.typing-indicator');
    if (existingIndicator) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble typing-indicator';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        bubble.appendChild(dot);
    }

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(bubble);

    elements.messageList.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * 隐藏打字指示器
 */
function hideTypingIndicator() {
    const indicator = elements.messageList.querySelector('.message.assistant:has(.typing-indicator)');
    if (indicator) {
        indicator.remove();
    }
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
    setTimeout(() => {
        elements.messageList.parentElement.scrollTo({
            top: elements.messageList.parentElement.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

/**
 * 获取当前时间
 */
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * 显示错误消息
 */
function showError(message) {
    addMessage('assistant', message);
}

/**
 * 初始化语音识别
 */
function initSpeechRecognition() {
    // 检查浏览器支持
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('浏览器不支持语音识别');
        elements.voiceBtn.style.display = 'none';
        return;
    }

    // 创建识别实例
    state.recognition = new SpeechRecognition();
    state.recognition.lang = 'zh-CN';
    state.recognition.continuous = false;
    state.recognition.interimResults = false;

    // 识别结果
    state.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('识别结果:', transcript);

        // 填充到输入框
        elements.messageInput.value = transcript;
        elements.sendBtn.disabled = false;

        // 停止录制
        stopRecording();

        // 自动发送
        setTimeout(() => {
            handleSendMessage();
        }, 300);
    };

    // 识别错误
    state.recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        stopRecording();

        if (event.error === 'no-speech') {
            showError('未检测到语音,请重试');
        } else if (event.error === 'not-allowed') {
            showError('请允许使用麦克风权限');
        } else {
            showError('语音识别失败,请重试');
        }
    };

    // 识别结束
    state.recognition.onend = () => {
        if (state.isRecording) {
            stopRecording();
        }
    };
}

/**
 * 处理语音按钮点击
 */
function handleVoiceClick() {
    if (!state.recognition) {
        alert('您的浏览器不支持语音输入功能');
        return;
    }

    if (state.isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

/**
 * 开始录音
 */
function startRecording() {
    try {
        state.recognition.start();
        state.isRecording = true;

        elements.voiceBtn.classList.add('recording');
        elements.voiceRecording.classList.add('active');

        console.log('开始语音识别');
    } catch (error) {
        console.error('启动语音识别失败:', error);
        showError('启动语音识别失败');
    }
}

/**
 * 停止录音
 */
function stopRecording() {
    if (state.recognition) {
        state.recognition.stop();
    }

    state.isRecording = false;
    elements.voiceBtn.classList.remove('recording');
    elements.voiceRecording.classList.remove('active');

    console.log('停止语音识别');
}

/**
 * 取消语音输入
 */
function cancelVoiceInput() {
    stopRecording();
}

/**
 * 快捷问题点击
 */
function sendQuickQuestion(button) {
    const question = button.textContent.trim();
    elements.messageInput.value = question;
    elements.sendBtn.disabled = false;
    handleSendMessage();

    // 隐藏欢迎区域
    const welcomeSection = document.querySelector('.welcome-section');
    if (welcomeSection) {
        welcomeSection.style.display = 'none';
    }
}

/**
 * 清空对话
 */
async function clearChat() {
    if (!confirm('确定要清空对话记录吗?')) {
        return;
    }

    try {
        // 调用 API 清除服务器端历史
        if (state.sessionId) {
            await fetch(`${CONFIG.API_BASE_URL}/chat/history/${state.sessionId}`, {
                method: 'DELETE'
            });
        }

        // 清空本地消息
        elements.messageList.innerHTML = '';
        state.messages = [];

        // 创建新会话
        sessionStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);
        await initSession();

        // 显示欢迎区域
        const welcomeSection = document.querySelector('.welcome-section');
        if (welcomeSection) {
            welcomeSection.style.display = 'block';
        }

        console.log('对话已清空');
    } catch (error) {
        console.error('清空对话失败:', error);
        showError('清空对话失败,请重试');
    }
}

/**
 * 返回上一页
 */
function goBack() {
    window.history.back();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 页面卸载前清理
window.addEventListener('beforeunload', () => {
    if (state.recognition) {
        state.recognition.stop();
    }
});

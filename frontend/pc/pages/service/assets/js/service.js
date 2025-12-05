/**
 * PC端智能客服 - 交互逻辑
 * 功能: 文字/语音输入、流式消息接收、会话管理
 */

// 配置
const CONFIG = {
    API_BASE_URL: '/api',
    SESSION_STORAGE_KEY: 'pc_chat_session_id'
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
    welcomeScreen: null,
    messagesArea: null,
    messagesList: null,
    messageInput: null,
    sendBtn: null,
    voiceBtn: null,
    voiceRecording: null,
    clearBtn: null
};

/**
 * 初始化应用
 */
async function init() {
    // 获取 DOM 元素
    elements.welcomeScreen = document.getElementById('welcomeScreen');
    elements.messagesArea = document.getElementById('messagesArea');
    elements.messagesList = document.getElementById('messagesList');
    elements.messageInput = document.getElementById('messageInput');
    elements.sendBtn = document.getElementById('sendBtn');
    elements.voiceBtn = document.getElementById('voiceBtn');
    elements.voiceRecording = document.getElementById('voiceRecording');
    elements.clearBtn = document.getElementById('clearBtn');

    // 初始化会话
    await initSession();

    // 绑定事件
    bindEvents();

    // 初始化语音识别
    initSpeechRecognition();

    console.log('PC端智能客服已初始化');
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
            showToast('初始化失败,请刷新页面重试');
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

    // 显示/隐藏清空按钮
    if (elements.clearBtn) {
        elements.clearBtn.style.display = value ? 'flex' : 'none';
    }
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
 * 清空输入框
 */
function clearInput() {
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';
    elements.sendBtn.disabled = true;
    if (elements.clearBtn) {
        elements.clearBtn.style.display = 'none';
    }
}

/**
 * 发送消息 (使用SSE流式接收)
 */
async function handleSendMessage() {
    const message = elements.messageInput.value.trim();
    if (!message) return;

    // 隐藏欢迎屏幕,显示消息区域
    if (elements.welcomeScreen.style.display !== 'none') {
        elements.welcomeScreen.style.display = 'none';
        elements.messagesArea.style.display = 'block';
    }

    // 清空输入框
    clearInput();

    // 显示用户消息
    addMessage('user', message);

    // 创建AI消息气泡(用于流式更新)
    const aiMessageElement = createStreamingMessage();

    // 调用流式API
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/chat/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                session_id: state.sessionId
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 读取SSE流
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            // 解码数据
            buffer += decoder.decode(value, { stream: true });

            // 处理完整的SSE消息
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = JSON.parse(line.slice(6));

                    if (data.type === 'chunk') {
                        // 追加内容到消息气泡
                        fullContent += data.content;
                        updateStreamingMessage(aiMessageElement, fullContent);
                    } else if (data.type === 'done') {
                        // 流式传输完成
                        if (data.session_id) {
                            state.sessionId = data.session_id;
                            sessionStorage.setItem(CONFIG.SESSION_STORAGE_KEY, state.sessionId);
                        }
                        finalizeStreamingMessage(aiMessageElement, fullContent);
                    } else if (data.type === 'error') {
                        // 出现错误
                        removeStreamingMessage(aiMessageElement);
                        showToast(data.error || '抱歉,服务暂时不可用,请稍后重试');
                    }
                }
            }
        }

    } catch (error) {
        removeStreamingMessage(aiMessageElement);
        console.error('发送消息失败:', error);
        showToast('网络错误,请检查连接后重试');
    }
}

/**
 * 格式化文本内容,处理换行
 */
function formatTextContent(text) {
    return text.replace(/\n/g, '<br>');
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

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = formatTextContent(content);

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();

    contentDiv.appendChild(bubble);
    contentDiv.appendChild(time);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    elements.messagesList.appendChild(messageDiv);

    // 滚动到底部
    scrollToBottom();

    // 保存消息
    state.messages.push({ role, content, time: time.textContent });
}

/**
 * 创建流式消息气泡
 */
function createStreamingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    messageDiv.dataset.streaming = 'true';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = '';

    // 添加光标效果
    const cursor = document.createElement('span');
    cursor.className = 'streaming-cursor';
    cursor.textContent = '▋';
    bubble.appendChild(cursor);

    const time = document.createElement('div');
    time.className = 'message-time';
    time.textContent = getCurrentTime();

    contentDiv.appendChild(bubble);
    contentDiv.appendChild(time);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    elements.messagesList.appendChild(messageDiv);
    scrollToBottom();

    return messageDiv;
}

/**
 * 更新流式消息内容
 */
function updateStreamingMessage(messageElement, content) {
    const bubble = messageElement.querySelector('.message-bubble');
    const cursor = bubble.querySelector('.streaming-cursor');

    // 更新内容,保留光标
    bubble.innerHTML = formatTextContent(content);
    bubble.appendChild(cursor);

    // 滚动到底部
    scrollToBottom();
}

/**
 * 完成流式消息
 */
function finalizeStreamingMessage(messageElement, content) {
    const bubble = messageElement.querySelector('.message-bubble');
    const cursor = bubble.querySelector('.streaming-cursor');

    // 移除光标
    if (cursor) {
        cursor.remove();
    }

    // 设置最终内容
    bubble.innerHTML = formatTextContent(content);

    // 移除流式标记
    delete messageElement.dataset.streaming;

    // 保存消息
    const time = messageElement.querySelector('.message-time').textContent;
    state.messages.push({ role: 'assistant', content, time });
}

/**
 * 移除流式消息
 */
function removeStreamingMessage(messageElement) {
    if (messageElement && messageElement.parentNode) {
        messageElement.remove();
    }
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
    setTimeout(() => {
        elements.messagesArea.scrollTo({
            top: elements.messagesArea.scrollHeight,
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
 * 显示Toast提示
 */
function showToast(message) {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 创建toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    // 3秒后自动移除
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 初始化语音识别
 */
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn('浏览器不支持语音识别');
        elements.voiceBtn.style.display = 'none';
        return;
    }

    state.recognition = new SpeechRecognition();
    state.recognition.lang = 'zh-CN';
    state.recognition.continuous = false;
    state.recognition.interimResults = false;

    // 识别结果
    state.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('识别结果:', transcript);

        elements.messageInput.value = transcript;
        elements.sendBtn.disabled = false;
        if (elements.clearBtn) {
            elements.clearBtn.style.display = 'flex';
        }

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

        let errorMessage = '';
        if (event.error === 'no-speech') {
            errorMessage = '未检测到语音,请重试';
        } else if (event.error === 'not-allowed') {
            errorMessage = '请允许使用麦克风权限';
        } else if (event.error === 'aborted') {
            errorMessage = '语音识别已取消';
        } else {
            errorMessage = '语音识别失败,请重试';
        }

        showToast(errorMessage);
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
        showToast('您的浏览器不支持语音输入功能');
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
        showToast('启动语音识别失败');
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
}

/**
 * 清空当前对话
 */
async function clearCurrentChat() {
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
        elements.messagesList.innerHTML = '';
        state.messages = [];

        // 创建新会话
        sessionStorage.removeItem(CONFIG.SESSION_STORAGE_KEY);
        await initSession();

        // 显示欢迎屏幕
        elements.welcomeScreen.style.display = 'flex';
        elements.messagesArea.style.display = 'none';

        console.log('对话已清空');
    } catch (error) {
        console.error('清空对话失败:', error);
        showToast('清空对话失败,请重试');
    }
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

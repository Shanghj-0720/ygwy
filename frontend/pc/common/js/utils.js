// 工具函数

// 格式化日期
function formatDate(dateString, format = 'YYYY-MM-DD') {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formatMap = {
        'YYYY': year,
        'MM': month,
        'DD': day,
        'HH': hours,
        'mm': minutes,
        'ss': seconds
    };

    let result = format;
    for (const [key, value] of Object.entries(formatMap)) {
        result = result.replace(key, value);
    }

    return result;
}

// 格式化金额
function formatMoney(amount, currency = '¥') {
    return `${currency}${parseFloat(amount).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

// 生成唯一ID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 防抖函数
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 显示提示消息
function showToast(message, duration = 2000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// 加载动画
function showLoading(message = '加载中...') {
    const loading = document.createElement('div');
    loading.id = 'global-loading';
    loading.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 20px 30px;
                border-radius: 12px;
                text-align: center;
            ">
                <div class="spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 12px;
                "></div>
                <div style="color: #333; font-size: 14px;">${message}</div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('global-loading');
    if (loading) {
        document.body.removeChild(loading);
    }
}

// LocalStorage 封装
const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('LocalStorage set error:', e);
        }
    },

    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('LocalStorage get error:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('LocalStorage remove error:', e);
        }
    },

    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('LocalStorage clear error:', e);
        }
    }
};

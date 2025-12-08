// ==================== 全局变量 ====================
const COMMITTEE_PAGE_PATH = '/frontend/mobile/pages/ai-assistant/AI业委会-定.html';
let allRecords = [];
let filteredRecords = [];
let currentFilter = 'all';
let summaryData = null;

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    showLoading(true);

    try {
        await loadData();
        initSearchBar();
        initFilterTabs();

        // 延迟隐藏加载状态，显示加载动画
        setTimeout(() => {
            showLoading(false);
        }, 800);
    } catch (error) {
        console.error('初始化失败:', error);
        showLoading(false);
        alert('数据加载失败，请刷新页面重试');
    }
}

// ==================== 数据加载 ====================
async function loadData() {
    const response = await fetch('../../../../data/benefit_data.json');
    if (!response.ok) throw new Error('数据加载失败');

    const data = await response.json();
    allRecords = data.records || [];
    summaryData = data.summary || {};

    // 按日期降序排序
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredRecords = [...allRecords];

    // 更新界面
    updateOverviewCard();
    renderRecordsList();
}

// ==================== 更新概览卡片 ====================
function updateOverviewCard() {
    const currentMonth = summaryData.december2024 || { totalIncome: 0, totalExpense: 0, balance: 0 };
    const prevMonth = summaryData.november2024 || { totalIncome: 0, totalExpense: 0, balance: 0 };

    // 更新日期
    const now = new Date();
    document.getElementById('currentDate').textContent =
        `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月`;

    // 更新数值
    document.getElementById('totalIncome').textContent = formatCurrency(currentMonth.totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(currentMonth.totalExpense);
    document.getElementById('balance').textContent = formatCurrency(currentMonth.balance);

    // 计算环比变化
    const incomeChange = prevMonth.totalIncome > 0
        ? ((currentMonth.totalIncome - prevMonth.totalIncome) / prevMonth.totalIncome * 100).toFixed(1)
        : 0;
    const expenseChange = prevMonth.totalExpense > 0
        ? ((currentMonth.totalExpense - prevMonth.totalExpense) / prevMonth.totalExpense * 100).toFixed(1)
        : 0;

    document.getElementById('incomeChange').textContent = `${incomeChange > 0 ? '+' : ''}${incomeChange}%`;
    document.getElementById('expenseChange').textContent = `${expenseChange > 0 ? '+' : ''}${expenseChange}%`;

    // 更新进度条
    const balancePercent = currentMonth.totalIncome > 0
        ? (currentMonth.balance / currentMonth.totalIncome * 100)
        : 0;
    document.getElementById('balanceProgress').style.width = `${Math.min(balancePercent, 100)}%`;
}

// ==================== 搜索栏 ====================
function initSearchBar() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');

    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.trim();

        if (keyword) {
            clearBtn.classList.add('show');
        } else {
            clearBtn.classList.remove('show');
        }

        performSearch(keyword);
    });
}

function performSearch(keyword) {
    if (!keyword) {
        applyFilter(currentFilter);
        return;
    }

    const lowerKeyword = keyword.toLowerCase();
    let baseRecords = currentFilter === 'all'
        ? allRecords
        : allRecords.filter(r => r.type === currentFilter);

    filteredRecords = baseRecords.filter(record => {
        return record.category.toLowerCase().includes(lowerKeyword) ||
               record.description.toLowerCase().includes(lowerKeyword) ||
               record.amount.toString().includes(keyword) ||
               (record.payer && record.payer.toLowerCase().includes(lowerKeyword)) ||
               (record.recipient && record.recipient.toLowerCase().includes(lowerKeyword)) ||
               (record.detail && record.detail.toLowerCase().includes(lowerKeyword));
    });

    renderRecordsList();
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');

    searchInput.value = '';
    clearBtn.classList.remove('show');

    applyFilter(currentFilter);
}

// ==================== 筛选标签 ====================
function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const filterType = this.dataset.type;
            currentFilter = filterType;
            applyFilter(filterType);

            // 触觉反馈
            vibrate();
        });
    });
}

function applyFilter(type) {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();

    if (keyword) {
        performSearch(keyword);
        return;
    }

    if (type === 'all') {
        filteredRecords = [...allRecords];
    } else {
        filteredRecords = allRecords.filter(record => record.type === type);
    }

    renderRecordsList();
}

// ==================== 渲染记录列表 ====================
function renderRecordsList() {
    const recordsList = document.getElementById('recordsList');
    const emptyState = document.getElementById('emptyState');

    if (filteredRecords.length === 0) {
        recordsList.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    const html = filteredRecords.map((record, index) => {
        const isIncome = record.type === 'income';
        const amountPrefix = isIncome ? '+' : '-';
        const typeClass = isIncome ? 'income' : 'expense';

        return `
            <div class="record-card" onclick="showDetail('${record.id}')" style="animation-delay: ${index * 0.05}s">
                <div class="record-header">
                    <div class="record-left">
                        <div class="record-category">
                            <span class="category-badge ${typeClass}"></span>
                            <span class="category-name">${record.category}</span>
                        </div>
                        <div class="record-date">${formatDate(record.date)}</div>
                    </div>
                    <div class="record-amount ${typeClass}">${amountPrefix}${formatCurrency(record.amount)}</div>
                </div>
                <div class="record-description">${record.description}</div>
            </div>
        `;
    }).join('');

    recordsList.innerHTML = html;
}

// ==================== 详情抽屉 ====================
function showDetail(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;

    vibrate();

    const isIncome = record.type === 'income';
    const amountPrefix = isIncome ? '+' : '-';
    const typeClass = isIncome ? 'income' : 'expense';
    const typeText = isIncome ? '收入' : '支出';
    const partnerLabel = isIncome ? '支付方' : '收款方';
    const partnerValue = isIncome ? record.payer : record.recipient;

    const drawerContent = document.getElementById('drawerContent');
    drawerContent.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">编号</div>
            <div class="detail-value">${record.id}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">类型</div>
            <div class="detail-value">${typeText}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">类别</div>
            <div class="detail-value">${record.category}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">金额</div>
            <div class="detail-value highlight ${typeClass}">${amountPrefix}${formatCurrency(record.amount)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">日期</div>
            <div class="detail-value">${formatDate(record.date)}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">描述</div>
            <div class="detail-value">${record.description}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">${partnerLabel}</div>
            <div class="detail-value">${partnerValue}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">详细说明</div>
            <div class="detail-value">${record.detail}</div>
        </div>
    `;

    openDrawer();
}

function openDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('detailDrawer');

    overlay.classList.add('show');
    drawer.classList.add('show');

    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    const overlay = document.getElementById('drawerOverlay');
    const drawer = document.getElementById('detailDrawer');

    overlay.classList.remove('show');
    drawer.classList.remove('show');

    document.body.style.overflow = '';

    vibrate();
}

// ==================== 工具函数 ====================
function formatCurrency(amount) {
    return `¥${amount.toFixed(2)}`;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
}

function showLoading(show) {
    const loading = document.getElementById('loadingOverlay');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

function vibrate(duration = 10) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}

function getCommitteeUrl() {
    const fallbackOrigin = window.location.origin;
    try {
        if (document.referrer) {
            const ref = new URL(document.referrer);
            return ref.origin + COMMITTEE_PAGE_PATH;
        }
    } catch (error) {
        console.warn('解析来源地址失败，使用当前域名返回', error);
    }
    return fallbackOrigin + COMMITTEE_PAGE_PATH;
}

function goBack() {
    vibrate();
    window.location.href = getCommitteeUrl();
}

// ==================== 全局点击触觉反馈 ====================
document.addEventListener('click', function(e) {
    if (e.target.closest('button') || e.target.closest('.record-card')) {
        vibrate();
    }
});

// ==================== 全局变量 ====================
let allRecords = [];
let filteredRecords = [];
let currentFilter = 'all';
let currentPage = 1;
let recordsPerPage = 10;
let summaryData = null;

// 报表相关
let currentPeriod = 'month';
let chartInstances = {
    pie: null,
    line: null,
    bar: null
};

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

async function initApp() {
    showLoading(true);

    try {
        await loadData();
        initTabs();
        initFilters();
        initSearch();
        initPagination();
        initReportControls();

        setTimeout(() => {
            showLoading(false);
        }, 200);
    } catch (error) {
        console.error('初始化失败:', error);
        showLoading(false);
        alert('数据加载失败,请刷新页面重试');
    }
}

// ==================== TAB切换 ====================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // 切换按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 切换内容区域
            tabContents.forEach(content => {
                if (content.id === targetTab + 'Tab') {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
}

// ==================== 数据加载 ====================
async function loadData() {
    // 使用相对于当前页面的路径
    const response = await fetch('../../../../data/benefit_data.json');
    if (!response.ok) throw new Error('数据加载失败');

    const data = await response.json();
    allRecords = data.records || [];
    summaryData = data.summary || {};

    // 按日期降序排序
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredRecords = [...allRecords];

    // 更新界面
    updateSummaryCards();
    renderTable();
}

// ==================== 更新概览卡片 ====================
function updateSummaryCards() {
    const currentMonth = summaryData.december2024 || { totalIncome: 0, totalExpense: 0, balance: 0 };
    const prevMonth = summaryData.november2024 || { totalIncome: 0, totalExpense: 0, balance: 0 };

    // 更新收入总额
    document.getElementById('totalIncome').textContent = formatCurrency(currentMonth.totalIncome);

    // 更新支出总额
    document.getElementById('totalExpense').textContent = formatCurrency(currentMonth.totalExpense);

    // 更新当月结余
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

// ==================== 筛选功能 ====================
function initFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            currentFilter = this.dataset.type;
            currentPage = 1;
            applyFilter();
        });
    });
}

function applyFilter() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();

    if (keyword) {
        performSearch(keyword);
        return;
    }

    if (currentFilter === 'all') {
        filteredRecords = [...allRecords];
    } else {
        filteredRecords = allRecords.filter(record => record.type === currentFilter);
    }

    renderTable();
    updatePagination();
}

// ==================== 搜索功能 ====================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');

    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.trim();

        if (keyword) {
            clearBtn.style.display = 'flex';
        } else {
            clearBtn.style.display = 'none';
        }

        performSearch(keyword);
    });

    clearBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        applyFilter();
    });
}

function performSearch(keyword) {
    if (!keyword) {
        applyFilter();
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
               record.id.toLowerCase().includes(lowerKeyword) ||
               (record.payer && record.payer.toLowerCase().includes(lowerKeyword)) ||
               (record.recipient && record.recipient.toLowerCase().includes(lowerKeyword)) ||
               (record.detail && record.detail.toLowerCase().includes(lowerKeyword));
    });

    currentPage = 1;
    renderTable();
    updatePagination();
}

// ==================== 渲染表格 ====================
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');

    if (filteredRecords.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
    }

    emptyState.style.display = 'none';

    // 分页
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);

    const html = pageRecords.map(record => {
        const isIncome = record.type === 'income';
        const typeClass = isIncome ? 'income' : 'expense';
        const typeText = isIncome ? '收入' : '支出';
        const amountPrefix = isIncome ? '+' : '-';
        const typeIcon = isIncome
            ? '<path d="M12 19V5m0 0l-7 7m7-7l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
            : '<path d="M12 5v14m0 0l7-7m-7 7l-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';

        return `
            <tr onclick="showDetail('${record.id}')">
                <td class="col-id">${record.id}</td>
                <td class="col-type">
                    <span class="type-badge ${typeClass}">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            ${typeIcon}
                        </svg>
                        ${typeText}
                    </span>
                </td>
                <td class="col-category">${record.category}</td>
                <td class="col-amount">
                    <span class="amount-value ${typeClass}">${amountPrefix}${formatCurrency(record.amount)}</span>
                </td>
                <td class="col-date">${formatDate(record.date)}</td>
                <td class="col-description">${truncateText(record.description, 40)}</td>
            </tr>
        `;
    }).join('');

    tableBody.innerHTML = html;
}

// ==================== 分页功能 ====================
function initPagination() {
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            updatePagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            updatePagination();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');

    // 更新按钮状态
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // 生成页码
    let pagesHtml = '';
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pagesHtml += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">
                ${i}
            </button>
        `;
    }

    pageNumbers.innerHTML = pagesHtml;
}

function goToPage(page) {
    currentPage = page;
    renderTable();
    updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== 详情模态框 ====================
function showDetail(recordId) {
    const record = allRecords.find(r => r.id === recordId);
    if (!record) return;

    const isIncome = record.type === 'income';
    const typeClass = isIncome ? 'income' : 'expense';
    const typeText = isIncome ? '收入' : '支出';
    const amountPrefix = isIncome ? '+' : '-';
    const partnerLabel = isIncome ? '支付方' : '收款方';
    const partnerValue = isIncome ? record.payer : record.recipient;

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
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

    openModal();
}

function openModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
}

// 初始化模态框关闭
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ==================== 报表功能 ====================
function initReportControls() {
    // 周期按钮
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPeriod = this.dataset.period;
            populateTimeSelect();
        });
    });

    // 初始化时间选择
    populateTimeSelect();

    // 生成报表按钮
    document.getElementById('generateBtn').addEventListener('click', generateReport);
}

function populateTimeSelect() {
    const timeSelect = document.getElementById('timeSelect');
    let options = [];

    const currentYear = 2024;
    const currentMonth = 12;

    if (currentPeriod === 'month') {
        // 生成月度选项(最近12个月)
        for (let i = 0; i < 12; i++) {
            let month = currentMonth - i;
            let year = currentYear;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            options.push(`<option value="${year}-${String(month).padStart(2, '0')}">${year}年${month}月</option>`);
        }
    } else if (currentPeriod === 'quarter') {
        // 生成季度选项(最近8个季度)
        for (let i = 0; i < 8; i++) {
            const quarterNum = Math.ceil(currentMonth / 3) - Math.floor(i % 4);
            const year = currentYear - Math.floor(i / 4);
            const actualQuarter = quarterNum <= 0 ? quarterNum + 4 : quarterNum;
            const actualYear = quarterNum <= 0 ? year - 1 : year;
            options.push(`<option value="${actualYear}-Q${actualQuarter}">${actualYear}年第${actualQuarter}季度</option>`);
        }
    } else if (currentPeriod === 'year') {
        // 生成年度选项(最近5年)
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            options.push(`<option value="${year}">${year}年</option>`);
        }
    }

    timeSelect.innerHTML = options.join('');
}

function generateReport() {
    const timeSelect = document.getElementById('timeSelect');
    const selectedTime = timeSelect.value;

    showLoading(true);

    setTimeout(() => {
        const reportData = generateMockReportData(currentPeriod, selectedTime);

        // 更新报表标题
        const periodText = {
            'month': '月度',
            'quarter': '季度',
            'year': '年度'
        };
        document.getElementById('reportTitle').textContent = `${periodText[currentPeriod]}收支报表 - ${timeSelect.options[timeSelect.selectedIndex].text}`;

        // 渲染图表
        renderCharts(reportData);

        // 渲染数据摘要
        renderSummary(reportData);

        // 显示报表区域
        document.getElementById('reportDisplay').style.display = 'block';

        showLoading(false);

        // 平滑滚动到报表区域
        setTimeout(() => {
            document.getElementById('reportDisplay').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, 800);
}

function generateMockReportData(period, time) {
    let data = {
        period: period,
        time: time,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        incomeByCategory: {},
        expenseByCategory: {},
        trend: []
    };

    if (period === 'month') {
        // 月度数据
        data.totalIncome = 45000 + Math.random() * 10000;
        data.totalExpense = 32000 + Math.random() * 8000;
        data.balance = data.totalIncome - data.totalExpense;

        // 分类数据
        data.incomeByCategory = {
            '停车费收入': 15000 + Math.random() * 3000,
            '物业费收入': 20000 + Math.random() * 5000,
            '广告位租金': 8000 + Math.random() * 2000,
            '其他收入': 2000 + Math.random() * 1000
        };

        data.expenseByCategory = {
            '物业维护': 12000 + Math.random() * 3000,
            '人员工资': 15000 + Math.random() * 2000,
            '水电费': 3000 + Math.random() * 1000,
            '设备维修': 2000 + Math.random() * 1000
        };

        // 趋势数据(按天)
        for (let i = 1; i <= 30; i++) {
            data.trend.push({
                label: `${i}日`,
                income: 1000 + Math.random() * 2000,
                expense: 800 + Math.random() * 1500
            });
        }
    } else if (period === 'quarter') {
        // 季度数据
        data.totalIncome = 135000 + Math.random() * 30000;
        data.totalExpense = 96000 + Math.random() * 24000;
        data.balance = data.totalIncome - data.totalExpense;

        data.incomeByCategory = {
            '停车费收入': 45000 + Math.random() * 9000,
            '物业费收入': 60000 + Math.random() * 15000,
            '广告位租金': 24000 + Math.random() * 6000,
            '其他收入': 6000 + Math.random() * 3000
        };

        data.expenseByCategory = {
            '物业维护': 36000 + Math.random() * 9000,
            '人员工资': 45000 + Math.random() * 6000,
            '水电费': 9000 + Math.random() * 3000,
            '设备维修': 6000 + Math.random() * 3000
        };

        // 趋势数据(按月)
        const months = ['第一个月', '第二个月', '第三个月'];
        months.forEach(month => {
            data.trend.push({
                label: month,
                income: 40000 + Math.random() * 15000,
                expense: 28000 + Math.random() * 10000
            });
        });
    } else if (period === 'year') {
        // 年度数据
        data.totalIncome = 540000 + Math.random() * 120000;
        data.totalExpense = 384000 + Math.random() * 96000;
        data.balance = data.totalIncome - data.totalExpense;

        data.incomeByCategory = {
            '停车费收入': 180000 + Math.random() * 36000,
            '物业费收入': 240000 + Math.random() * 60000,
            '广告位租金': 96000 + Math.random() * 24000,
            '其他收入': 24000 + Math.random() * 12000
        };

        data.expenseByCategory = {
            '物业维护': 144000 + Math.random() * 36000,
            '人员工资': 180000 + Math.random() * 24000,
            '水电费': 36000 + Math.random() * 12000,
            '设备维修': 24000 + Math.random() * 12000
        };

        // 趋势数据(按月)
        for (let i = 1; i <= 12; i++) {
            data.trend.push({
                label: `${i}月`,
                income: 40000 + Math.random() * 15000,
                expense: 28000 + Math.random() * 10000
            });
        }
    }

    return data;
}

function renderCharts(data) {
    // 销毁旧图表
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });

    // 饼图 - 收支分类详细占比
    const pieCtx = document.getElementById('pieChart').getContext('2d');

    // 合并收入和支出分类数据
    const allCategories = [];
    const allValues = [];
    const allColors = [];

    // 收入分类数据 - 使用绿色系
    const incomeColors = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];
    let incomeIndex = 0;
    for (const [category, value] of Object.entries(data.incomeByCategory)) {
        allCategories.push(category + '(收)');
        allValues.push(value);
        allColors.push(incomeColors[incomeIndex % incomeColors.length]);
        incomeIndex++;
    }

    // 支出分类数据 - 使用红色系
    const expenseColors = ['#ef4444', '#dc2626', '#f87171', '#fca5a5', '#fecaca'];
    let expenseIndex = 0;
    for (const [category, value] of Object.entries(data.expenseByCategory)) {
        allCategories.push(category + '(支)');
        allValues.push(value);
        allColors.push(expenseColors[expenseIndex % expenseColors.length]);
        expenseIndex++;
    }

    chartInstances.pie = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: allCategories,
            datasets: [{
                data: allValues,
                backgroundColor: allColors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 12,
                        font: {
                            size: 12
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ¥${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // 折线图 - 收支趋势
    const lineCtx = document.getElementById('lineChart').getContext('2d');
    chartInstances.line = new Chart(lineCtx, {
        type: 'line',
        data: {
            labels: data.trend.map(t => t.label),
            datasets: [
                {
                    label: '收入',
                    data: data.trend.map(t => t.income),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '支出',
                    data: data.trend.map(t => t.expense),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ¥${value.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // 柱状图 - 分类统计
    const barCtx = document.getElementById('barChart').getContext('2d');
    const barCategories = [...new Set([
        ...Object.keys(data.incomeByCategory),
        ...Object.keys(data.expenseByCategory)
    ])];

    chartInstances.bar = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: barCategories,
            datasets: [
                {
                    label: '收入',
                    data: barCategories.map(cat => data.incomeByCategory[cat] || 0),
                    backgroundColor: '#10b981'
                },
                {
                    label: '支出',
                    data: barCategories.map(cat => data.expenseByCategory[cat] || 0),
                    backgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 13
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ¥${value.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '¥' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function renderSummary(data) {
    const summaryGrid = document.getElementById('summaryGrid');

    const summaryItems = [
        {
            label: '总收入',
            value: formatCurrency(data.totalIncome)
        },
        {
            label: '总支出',
            value: formatCurrency(data.totalExpense)
        },
        {
            label: '结余',
            value: formatCurrency(data.balance)
        },
        {
            label: '收支比',
            value: data.totalExpense > 0 ? (data.totalIncome / data.totalExpense).toFixed(2) : 'N/A'
        },
        {
            label: '结余率',
            value: data.totalIncome > 0 ? ((data.balance / data.totalIncome) * 100).toFixed(1) + '%' : '0%'
        }
    ];

    const html = summaryItems.map(item => `
        <div class="summary-item">
            <div class="summary-label">${item.label}</div>
            <div class="summary-value">${item.value}</div>
        </div>
    `).join('');

    summaryGrid.innerHTML = html;
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
    return `${year}-${month}-${day}`;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function showLoading(show) {
    const loading = document.getElementById('loadingOverlay');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

// ==================== 导出功能 ====================
document.querySelectorAll('.btn-export').forEach(btn => {
    btn.addEventListener('click', function() {
        alert('导出功能开发中');
    });
});

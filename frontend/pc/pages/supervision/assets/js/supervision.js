const data = {
    cycle: '2025年12月',
    dimensions: ['保洁', '安保', '维修响应', '绿化', '设施维护'],
    notice: [
        { title: '汇总完成', detail: '评价结束，自动生成《问题汇总表》', time: '12/06 09:00' },
        { title: '下达整改', detail: '向物业 PC/手机端推送整改通知', time: '12/06 09:05' },
        { title: '设定期限', detail: '默认 10 天整改周期，可人工调整', time: '12/06 09:06' }
    ],
    aiRules: [
        { title: '逾期提醒', meta: '推送到属地住建部门 PC 端' },
        { title: '信用关联', meta: '逾期记录同步企业信用档案' },
        { title: '自动催办', meta: '每日 09:00 未完成自动催办' }
    ],
    publish: [
        { title: '整改结果', meta: '核验通过后全平台公示' },
        { title: '公示渠道', meta: 'PC / 手机端 / 公告栏统一呈现' }
    ],
    uploads: [
        { title: '整改方案', meta: 'PDF / DOC' },
        { title: '过程照片', meta: 'JPG / PNG，多张上传' },
        { title: '结果证明', meta: '报告、回执等' }
    ],
    progress: [
        { title: '整改期限', meta: '显示截止时间与剩余天数' },
        { title: '核验状态', meta: '待核验 / 通过 / 退回' },
        { title: '结果反馈', meta: '业主代表核验结果实时推送' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    renderCycle();
    renderDimensions();
    renderNotice();
    renderAiRules();
    renderPublish();
    renderUploads();
    renderProgress();
});

function renderCycle() {
    const tag = document.getElementById('cycleTag');
    if (tag) tag.textContent = data.cycle;
}

function renderDimensions() {
    const list = document.getElementById('dimensionList');
    if (!list) return;
    list.innerHTML = '';
    data.dimensions.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="title">${item}</div>
            <div class="meta"><span>问卷分级：满意 / 基本满意 / 不满意</span></div>
        `;
        list.appendChild(div);
    });
}

function renderNotice() {
    const list = document.getElementById('noticeTimeline');
    if (!list) return;
    list.innerHTML = data.notice.map((n) => `
        <li>
            <strong>${n.title}</strong>
            <span class="desc">${n.detail}</span>
            <span class="desc">${n.time}</span>
        </li>
    `).join('');
}

function renderAiRules() {
    const list = document.getElementById('aiRules');
    if (!list) return;
    list.innerHTML = '';
    data.aiRules.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<div class="title">${item.title}</div><div class="meta"><span>${item.meta}</span></div>`;
        list.appendChild(div);
    });
}

function renderPublish() {
    const list = document.getElementById('publishList');
    if (!list) return;
    list.innerHTML = '';
    data.publish.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<div class="title">${item.title}</div><div class="meta"><span>${item.meta}</span></div>`;
        list.appendChild(div);
    });
}

function renderUploads() {
    const list = document.getElementById('uploadList');
    if (!list) return;
    list.innerHTML = '';
    data.uploads.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<div class="title">${item.title}</div><div class="meta"><span>${item.meta}</span></div>`;
        list.appendChild(div);
    });
}

function renderProgress() {
    const list = document.getElementById('progressList');
    if (!list) return;
    list.innerHTML = '';
    data.progress.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `<div class="title">${item.title}</div><div class="meta"><span>${item.meta}</span></div>`;
        list.appendChild(div);
    });
}

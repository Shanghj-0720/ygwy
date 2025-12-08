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
    regulation: [
        { community: '阳光城', company: '恒信物业', issue: '车库保洁除味逾期 3 天', action: '已下达监管函，限 48 小时整改', contact: '住建监管人：刘工 / 138****3210' },
        { community: '金桂园', company: '佳园物业', issue: '门禁维修逾期未复核', action: '约谈物业经理，纳入信用观察', contact: '住建监管人：王工 / 139****7823' },
        { community: '翠苑花园', company: '锦绣物业', issue: '绿化补种进度缓慢', action: '派出现场核查，责令限期完成', contact: '住建监管人：赵工 / 137****5566' }
    ],
    publish: [
        { title: '车库照明整改完成', community: '阳光城', status: '已公示', tone: 'success', result: '满意 98%', time: '12/19 10:00', channel: 'PC / 手机端 / 公告栏' },
        { title: '门禁系统维修中', community: '金桂园', status: '待公示', tone: 'warning', result: '核验进行中', time: '待核验', channel: '通过后自动同步' },
        { title: '绿化补种计划', community: '翠苑花园', status: '公示中', tone: 'info', result: '整改照片 3 张', time: '12/20 09:00', channel: '全平台' }
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
    renderRegulation();
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

function renderRegulation() {
    const list = document.getElementById('regList');
    if (!list) return;
    list.innerHTML = '';
    data.regulation.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="title">${item.community} · ${item.company}</div>
            <div class="meta">
                <span>逾期事项：${item.issue}</span>
                <span>处置动作：${item.action}</span>
                <span>${item.contact}</span>
            </div>
        `;
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
        div.innerHTML = `
            <div class="title">
                ${item.title}
                <span class="pill ${item.tone || ''}">${item.status}</span>
            </div>
            <div class="meta">
                <span>小区：${item.community}</span>
                <span>结果：${item.result}</span>
                <span>时间：${item.time}</span>
                <span>渠道：${item.channel}</span>
            </div>
        `;
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

/**
 * 线上监督 - 流程模拟（前端静态数据）
 * 覆盖问卷推送、问题汇总、整改追踪、抽验与公示
 */

const ROLE_MAP = {
    '1': { key: 'owner', label: '业主' },
    '2': { key: 'property', label: '物业' }
};

const state = {
    role: 'owner',
    month: '2025年12月',
    steps: [
        {
            title: '问卷推送',
            status: 'done',
            time: '12/01 09:00',
            desc: '自动向实名认证业主推送满意度问卷（保洁、安保、维修响应、绿化、设施维护）'
        },
        {
            title: '评价收集',
            status: 'done',
            time: '12/05 18:00 结束',
            desc: '满意 / 基本满意 / 不满意三级评价，系统实时汇总'
        },
        {
            title: '问题汇总',
            status: 'done',
            time: '12/06 09:00',
            desc: '自动生成《问题汇总表》，向物业下达整改通知并设定期限'
        },
        {
            title: '整改执行',
            status: 'active',
            time: '整改截止 12/15',
            desc: '物业上传整改方案、过程照片、结果证明，进度透明可追溯',
            highlight: '当前阶段'
        },
        {
            title: '抽验与公示',
            status: 'pending',
            time: '抽验 12/16-12/18',
            desc: '随机抽取业主代表线上核验，通过后自动公示；逾期推送监管提醒',
            highlight: '待开始'
        }
    ],
    questionnaire: {
        deadline: '12/05 18:00',
        responseRate: 82,
        satisfaction: 76,
        negative: 8,
        dimensions: [
            { name: '保洁', level: '基本满意', score: 74, issues: ['楼道垃圾清运不及时', '电梯玻璃有水渍'] },
            { name: '安保', level: '满意', score: 85, issues: ['夜间巡逻打卡记录完整'] },
            { name: '维修响应', level: '基本满意', score: 72, issues: ['报修响应慢', '临时修补不到位'] },
            { name: '绿化', level: '满意', score: 81, issues: ['草坪修剪完成', '补种缺失植被'] },
            { name: '设施维护', level: '不满意', score: 64, issues: ['地下车库照明偏暗', '健身器材螺丝松动'] }
        ]
    },
    rectification: {
        deadline: '12/15',
        items: [
            {
                id: 'r1',
                title: '楼道保洁及时性',
                status: '整改中',
                due: '12/12',
                owner: '张敏 · 物业经理',
                progress: 65,
                requirements: ['每日3次清运并上传巡检照片', '电梯轿厢玻璃保持无污渍'],
                uploads: ['整改方案.pdf', '作业照片3张']
            },
            {
                id: 'r2',
                title: '消防通道堆放',
                status: '待核验',
                due: '12/10',
                owner: '王俊 · 安全主管',
                progress: 100,
                requirements: ['清理杂物并张贴警示', '每晚巡查留痕'],
                uploads: ['清理前后对比.png', '巡查记录.xlsx']
            },
            {
                id: 'r3',
                title: '维修响应时效',
                status: '整改中',
                due: '12/15',
                owner: '刘倩 · 维修主管',
                progress: 45,
                requirements: ['报修派单30分钟内响应', '增加晚班值守'],
                uploads: ['派单SLA表.xlsx']
            }
        ]
    },
    verification: {
        drawDate: '12/16',
        tasks: [
            {
                id: 'v1',
                owner: '王**',
                building: '3栋 / 5栋',
                scope: '保洁 + 设施维护',
                status: '待核验',
                due: '12/18 18:00',
                focus: '楼道保洁、车库照明恢复情况',
                materials: ['整改照片', '照明恢复视频']
            },
            {
                id: 'v2',
                owner: '李**',
                building: '8栋',
                scope: '安保巡逻',
                status: '通过',
                result: '夜间巡逻打卡完整，岗亭值守正常',
                due: '12/18 18:00',
                focus: '巡逻频次 + 打卡轨迹',
                materials: ['巡逻记录', '岗亭签到']
            },
            {
                id: 'v3',
                owner: '陈**',
                building: '2栋',
                scope: '维修响应',
                status: '待核验',
                due: '12/18 18:00',
                focus: '抽查随机报修回访满意度',
                materials: ['派单记录', '回访录音']
            }
        ]
    },
    publish: {
        target: '12/19 10:00',
        regulator: '未触发',
        risk: '逾期未整改将自动推送监管提醒并关联企业信用'
    }
};

function getRoleFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const account = params.get('account') || '1';
    return { ...ROLE_MAP[account] || ROLE_MAP['1'], account };
}

function setRoleBadge(label, nextLabel, account) {
    const badge = document.getElementById('roleBadge');
    if (badge) {
        badge.textContent = `${label}视图`;
        const hint = nextLabel ? `切换到${nextLabel}视图` : '切换视图';
        badge.title = hint;
        badge.setAttribute('aria-label', hint);
        badge.dataset.account = account;
    }
}

function applyRoleVisibility(roleKey) {
    document.querySelectorAll('[data-roles]').forEach((section) => {
        const roles = (section.dataset.roles || '').split(/\s+/);
        section.style.display = roles.includes(roleKey) ? '' : 'none';
    });
}

function updateQuestionnaireLink(account) {
    const qLink = document.getElementById('questionnaireLink');
    if (qLink) {
        qLink.href = `questionnaire.html?account=${account}`;
    }
}

function updateUrlAccount(account) {
    const url = new URL(window.location.href);
    url.searchParams.set('account', account);
    window.history.replaceState({}, '', url.toString());
}

function applyRole(roleInfo) {
    const nextAccount = roleInfo.account === '1' ? '2' : '1';
    const nextRoleLabel = (ROLE_MAP[nextAccount] || ROLE_MAP['1']).label;
    state.role = roleInfo.key;
    setRoleBadge(roleInfo.label, nextRoleLabel, roleInfo.account);
    applyRoleVisibility(roleInfo.key);
    updateQuestionnaireLink(roleInfo.account);
    updateUrlAccount(roleInfo.account);
}

function toggleRole() {
    const badge = document.getElementById('roleBadge');
    const currentAccount = badge?.dataset.account || '1';
    const account = currentAccount === '1' ? '2' : '1';
    const roleInfo = { ...ROLE_MAP[account] || ROLE_MAP['1'], account };
    applyRole(roleInfo);
}

function bindRoleSwitch(initialAccount) {
    const badge = document.getElementById('roleBadge');
    if (!badge) return;

    badge.dataset.account = initialAccount;
    badge.addEventListener('click', toggleRole);
    badge.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleRole();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const roleInfo = getRoleFromUrl();
    applyRole(roleInfo);
    bindRoleSwitch(roleInfo.account);

    document.getElementById('currentMonth').textContent = state.month;
    renderOverview();
    renderQuestionnaire();
    renderRectification();
    renderVerification();
    renderPublish();
    applyEntranceAnimations();
});

function renderOverview() {
    const container = document.getElementById('stepList');
    container.innerHTML = '';

    state.steps.forEach((step, index) => {
        const item = document.createElement('div');
        item.className = `step-item ${step.status}`;
        item.innerHTML = `
            <div class="step-index">${index + 1}</div>
            <div class="step-body">
                <div class="step-title">${step.title}</div>
                <p class="step-desc">${step.desc}</p>
                <div class="step-meta">
                    <span class="meta-badge">${step.time}</span>
                    ${step.highlight ? `<span class="meta-badge emphasis">${step.highlight}</span>` : ''}
                </div>
            </div>
        `;
        container.appendChild(item);
    });

    const activeStep = state.steps.find((s) => s.status === 'active');
    const summary = activeStep ? `当前阶段：${activeStep.title} · ${activeStep.time}` : '流程正常';
    document.getElementById('stepSummary').textContent = summary;
}

function renderQuestionnaire() {
    document.getElementById('questionnaireDeadline').textContent = `响应截止 ${state.questionnaire.deadline}`;

    const statsContainer = document.getElementById('questionnaireStats');
    statsContainer.innerHTML = '';

    const stats = [
        { label: '响应率', value: `${state.questionnaire.responseRate}%` },
        { label: '满意/基本满意', value: `${state.questionnaire.satisfaction}%` },
        { label: '不满意', value: `${state.questionnaire.negative}%` }
    ];

    stats.forEach((stat) => {
        const block = document.createElement('div');
        block.className = 'stat';
        block.innerHTML = `
            <div class="label">${stat.label}</div>
            <div class="value">${stat.value}</div>
        `;
        statsContainer.appendChild(block);
    });

    const dimensionList = document.getElementById('dimensionList');
    dimensionList.innerHTML = '';
    state.questionnaire.dimensions.forEach((dim) => {
        const item = document.createElement('div');
        item.className = 'dimension-item';
        item.innerHTML = `
            <div class="dimension-head">
                <div class="title">${dim.name}</div>
                <span class="level">${dim.level}</span>
            </div>
            <div class="bar"><span style="width: ${dim.score}%"></span></div>
            <div class="issues">关注点：${dim.issues.join('、')}</div>
        `;
        dimensionList.appendChild(item);
    });
}

function applyEntranceAnimations() {
    const targets = document.querySelectorAll('.banner, .card');
    targets.forEach((el, idx) => {
        el.style.animationDelay = `${idx * 80}ms`;
        el.classList.add('fade-in-up');
    });
}

function renderRectification() {
    document.getElementById('rectificationDeadline').textContent = `整改截止 ${state.rectification.deadline}`;
    const list = document.getElementById('rectificationList');
    list.innerHTML = '';

    state.rectification.items.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'rect-card';
        card.innerHTML = `
            <div class="row">
                <div class="title">${item.title}</div>
                <div class="status ${statusClass(item.status)}">${item.status}</div>
            </div>
            <div class="row muted">
                <span>${item.owner}</span>
                <span>截止 ${item.due}</span>
            </div>
            <div class="progress"><span style="width:${item.progress}%"></span></div>
            <div class="tags">${item.requirements.map((req) => `<span class="tag">${req}</span>`).join('')}</div>
            <div class="tags">${item.uploads.map((file) => `<span class="tag">${file}</span>`).join('')}</div>
        `;
        list.appendChild(card);
    });
}

function renderVerification() {
    const list = document.getElementById('verificationList');
    list.innerHTML = '';

    state.verification.tasks.forEach((task) => {
        const card = document.createElement('div');
        card.className = 'verify-card';

        const actions = task.status === '待核验'
            ? `
                <div class="actions">
                    <button class="btn primary" onclick="updateVerification('${task.id}', 'pass')">通过</button>
                    <button class="btn outline" onclick="updateVerification('${task.id}', 'fail')">不通过</button>
                </div>
            `
            : `<div class="muted">反馈：${task.result || '已记录'}</div>`;

        card.innerHTML = `
            <div class="row">
                <div class="title">${task.scope}</div>
                <div class="status ${statusClass(task.status)}">${task.status}</div>
            </div>
            <div class="muted">抽取业主：${task.owner} · ${task.building}</div>
            <div class="muted">关注点：${task.focus}</div>
            <div class="muted">核验截止：${task.due}</div>
            <div class="tags">${task.materials.map((m) => `<span class="tag">${m}</span>`).join('')}</div>
            ${actions}
        `;

        list.appendChild(card);
    });
}

function renderPublish() {
    const box = document.getElementById('publishBox');
    const tasks = state.verification.tasks;
    const allPass = tasks.every((t) => /通过/.test(t.status));
    const anyFail = tasks.some((t) => t.status === '不通过');
    const anyPending = tasks.some((t) => t.status === '待核验');

    let statusText = '核验中';
    let desc = '等待业主代表反馈后自动公示';
    if (anyFail) {
        statusText = '需复核';
        desc = '存在不通过项，物业需补充整改并重新抽验';
    } else if (!anyPending && allPass) {
        statusText = '可公示';
        desc = `预计 ${state.publish.target} 自动公示`;
    }

    box.innerHTML = `
        <div class="publish-line">
            <span>当前状态</span>
            <span class="highlight">${statusText}</span>
        </div>
        <div class="publish-line">
            <span>公示时间</span>
            <span>${state.publish.target}</span>
        </div>
        <div class="publish-line">
            <span>监管提醒</span>
            <span>${state.publish.regulator}</span>
        </div>
        <div class="issues">${desc}。${state.publish.risk}</div>
    `;
}

function updateVerification(id, result) {
    const task = state.verification.tasks.find((t) => t.id === id);
    if (!task) return;

    if (result === 'pass') {
        task.status = '通过';
        task.result = '核验通过，进入公示';
    } else {
        task.status = '不通过';
        task.result = '未通过，退回物业补充整改';
    }

    renderVerification();
    renderPublish();
}

function statusClass(status) {
    if (/通过/.test(status)) return 'success';
    if (/不通过|退回/.test(status)) return 'danger';
    return 'warning';
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/frontend/mobile/index.html';
    }
}

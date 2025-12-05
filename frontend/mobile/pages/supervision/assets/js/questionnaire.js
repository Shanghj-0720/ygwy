const QUESTIONS = [
    {
        id: 'clean',
        title: '保洁',
        desc: '公共区域清洁、楼道垃圾清运、电梯卫生',
        options: ['满意', '基本满意', '不满意']
    },
    {
        id: 'security',
        title: '安保',
        desc: '门禁管理、夜间巡逻、访客登记与应急响应',
        options: ['满意', '基本满意', '不满意']
    },
    {
        id: 'repair',
        title: '维修响应',
        desc: '报修派单速度、维修完成质量、回访体验',
        options: ['满意', '基本满意', '不满意']
    },
    {
        id: 'greening',
        title: '绿化',
        desc: '绿植养护、修剪补种、公共景观维护',
        options: ['满意', '基本满意', '不满意']
    },
    {
        id: 'facility',
        title: '设施维护',
        desc: '车库照明、电梯、健身器材、消防设施日常维护',
        options: ['满意', '基本满意', '不满意']
    }
];

const state = {
    account: '1',
    answers: {}
};

document.addEventListener('DOMContentLoaded', () => {
    const { account, roleLabel } = parseParams();
    state.account = account;
    setRole(roleLabel);
    setBackLink();
    setMonth();
    renderQuestions();
    bindSubmit();
    applyEntranceAnimations();
});

function setMonth() {
    const title = document.getElementById('monthTitle');
    if (title) title.textContent = '2025年15月';
}

function parseParams() {
    const params = new URLSearchParams(window.location.search);
    const account = params.get('account') || '1';
    const roleLabel = account === '2' ? '物业' : '业主';
    return { account, roleLabel };
}

function setRole(roleLabel) {
    const pill = document.getElementById('rolePill');
    if (pill) pill.textContent = `${roleLabel}视图`;
}

function setBackLink() {
    const backBtn = document.getElementById('backBtn');
    if (!backBtn) return;
    backBtn.addEventListener('click', () => {
        window.location.href = `index.html?account=${state.account}`;
    });
}

function renderQuestions() {
    const list = document.getElementById('questionList');
    list.innerHTML = '';

    QUESTIONS.forEach((q) => {
        const card = document.createElement('section');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <h3>${q.title}</h3>
                <span class="pill">满意度</span>
            </div>
            <p class="question-desc">${q.desc}</p>
            <div class="options" data-question="${q.id}">
                ${q.options.map((opt) => `<button class="option" data-value="${opt}">${opt}</button>`).join('')}
            </div>
        `;
        list.appendChild(card);
    });

    list.querySelectorAll('.option').forEach((btn) => {
        btn.addEventListener('click', () => {
            const group = btn.closest('.options');
            const qid = group.dataset.question;
            group.querySelectorAll('.option').forEach((o) => o.classList.remove('active'));
            btn.classList.add('active');
            state.answers[qid] = btn.dataset.value;
        });
    });

    applyEntranceAnimations('#questionList .card');
}

function bindSubmit() {
    const submitBtn = document.getElementById('submitBtn');
    if (!submitBtn) return;
    submitBtn.addEventListener('click', () => {
        if (Object.keys(state.answers).length < QUESTIONS.length) {
            alert('请先选择所有维度的满意度');
            return;
        }
        alert('已记录您的选择，感谢反馈！');
        window.location.href = `index.html?account=${state.account}`;
    });
}

function applyEntranceAnimations(selector = '.banner, .card, .submit') {
    const targets = document.querySelectorAll(selector);
    targets.forEach((el, idx) => {
        el.style.animationDelay = `${idx * 80}ms`;
        el.classList.add('fade-in-up');
    });
}

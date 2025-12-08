const rectificationItems = [
    {
        id: 'r1',
        title: '楼道保洁及时性',
        status: '整改中',
        due: '12/12',
        owner: '张敏 · 物业经理',
        progress: 65,
        requirements: ['每日3次清运并上传巡检照片', '电梯轿厢玻璃保持无污渍'],
        uploads: ['整改方案.pdf', '作业照片3张'],
        hint: '请持续补充作业照片，确保楼道无积尘、水渍。'
    },
    {
        id: 'r2',
        title: '消防通道堆放',
        status: '待核验',
        due: '12/10',
        owner: '王俊 · 安全主管',
        progress: 100,
        requirements: ['清理杂物并张贴警示', '每晚巡查留痕'],
        uploads: ['清理前后对比.png', '巡查记录.xlsx'],
        hint: '等待业主代表随机抽验，建议保留巡查影像。'
    },
    {
        id: 'r3',
        title: '维修响应时效',
        status: '整改中',
        due: '12/15',
        owner: '刘倩 · 维修主管',
        progress: 45,
        requirements: ['报修派单30分钟内响应', '增加晚班值守'],
        uploads: ['派单SLA表.xlsx'],
        hint: '关注晚班值守记录，补充派单响应截图。'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'r1';
    const task = rectificationItems.find((i) => i.id === id) || rectificationItems[0];
    renderTask(task);
});

function renderTask(task) {
    document.getElementById('taskTitle').textContent = task.title;
    document.getElementById('taskSubtitle').textContent = task.owner;
    document.getElementById('statusPill').textContent = task.status;
    document.getElementById('taskOwner').textContent = task.owner;
    document.getElementById('taskDue').textContent = task.due;
    document.getElementById('taskProgress').textContent = `${task.progress}%`;
    document.getElementById('taskRequirements').innerHTML = task.requirements.map((r) => `<span class="tag">${r}</span>`).join('');
    document.getElementById('taskUploads').innerHTML = task.uploads.map((u) => `<span class="tag">${u}</span>`).join('');
    document.getElementById('taskHint').textContent = task.hint || '';
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

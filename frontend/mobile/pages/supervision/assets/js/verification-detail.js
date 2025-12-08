const verificationTasks = [
    {
        id: 'v1',
        owner: '王**',
        building: '3栋 / 5栋',
        scope: '保洁 + 设施维护',
        status: '待核验',
        due: '12/18 18:00',
        focus: '楼道保洁、车库照明恢复情况',
        materials: ['整改照片', '照明恢复视频'],
        detail: '查看车库照明亮度对比，确认楼道地面清洁无积尘。'
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
        materials: ['巡逻记录', '岗亭签到'],
        detail: '核验打卡轨迹、岗亭值守照片与夜间巡逻频次。'
    },
    {
        id: 'v3',
        owner: '陈**',
        building: '2栋',
        scope: '维修响应',
        status: '待核验',
        due: '12/18 18:00',
        focus: '抽查随机报修回访满意度',
        materials: ['派单记录', '回访录音'],
        detail: '抽查随机报修闭环，核查派单时效与回访满意度。'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 'v1';
    const task = verificationTasks.find((t) => t.id === id) || verificationTasks[0];
    renderTask(task);
    bindActions(task);
});

function renderTask(task) {
    const scope = `${task.scope}`;
    document.getElementById('taskTitle').textContent = scope;
    document.getElementById('taskSubtitle').textContent = `${task.owner} · ${task.building}`;
    document.getElementById('statusPill').textContent = task.status;
    document.getElementById('taskOwner').textContent = `${task.owner} · ${task.building}`;
    document.getElementById('taskFocus').textContent = task.focus;
    document.getElementById('taskDue').textContent = task.due;
    document.getElementById('taskDetail').textContent = task.detail || '暂无说明';
    document.getElementById('taskMaterials').innerHTML = task.materials.map((m) => `<span class="tag">${m}</span>`).join('');
    document.getElementById('resultHint').textContent = task.result ? `反馈：${task.result}` : '';
}

function bindActions(task) {
    const approveBtn = document.getElementById('approveBtn');
    const rejectBtn = document.getElementById('rejectBtn');
    if (approveBtn) {
        approveBtn.addEventListener('click', () => setResult(task, '通过', '核验通过，进入公示'));
    }
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => setResult(task, '不通过', '未通过，退回物业补充整改'));
    }
}

function setResult(task, status, result) {
    task.status = status;
    task.result = result;
    document.getElementById('statusPill').textContent = status;
    document.getElementById('resultHint').textContent = `反馈：${result}`;
    alert(`已记录：${status}`);
}

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

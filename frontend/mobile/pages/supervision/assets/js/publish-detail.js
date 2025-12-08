const publishData = {
    title: '整改结果公示',
    status: '可公示',
    time: '12/19 10:00',
    result: '车库照明整改完成，满意度 98%；门禁维修核验中；绿化补种计划公示中。',
    channels: ['PC 端', '手机端', '公告栏'],
    regulation: [
        '逾期整改将自动推送监管提醒并关联企业信用',
        '物业需按时补充核验材料，超时将标记红色预警'
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('publishTitle').textContent = publishData.title;
    document.getElementById('publishStatus').textContent = publishData.status;
    document.getElementById('publishTime').textContent = publishData.time;
    document.getElementById('publishResult').textContent = publishData.result;

    const channelList = document.getElementById('publishChannels');
    channelList.innerHTML = publishData.channels.map((c) => `
        <div class="channel-item">
            <div class="title">${c}</div>
            <div class="meta">同步发布</div>
        </div>
    `).join('');

    const regList = document.getElementById('publishReg');
    regList.innerHTML = publishData.regulation.map((r) => `<div class="list-item"><div class="title">监管提醒</div><div class="meta"><span>${r}</span></div></div>`).join('');
});

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}

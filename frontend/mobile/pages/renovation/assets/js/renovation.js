/**
 * 线上装修模块 - JavaScript
 */

// 全局状态
const state = {
    identity: 'owner', // owner | tenant
    files: {
        // 产权人材料
        notice: null,
        plan: [],
        idcard: null,
        property: null,
        // 房屋使用人/租赁人材料
        lease: [],
        ownerConsent: null,
        // 通用条件材料
        design: [],
        company: null,
        shared: null
    },
    conditions: {
        design: false,
        company: false,
        shared: false
    },
    applicationStatus: 'none' // none, pending, reviewing, success, rejected
};

// 页面加载
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    loadDraft();
    loadHistory();
});

// 初始化页面
function initPage() {
    // 设置拖拽上传
    document.querySelectorAll('.upload-zone').forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

// 返回上一页
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = '/frontend/mobile/index.html';
    }
}

// 选择身份
function selectIdentity(identity) {
    if (identity === 'owner') {
        // 产权人 - 跳转到产权人上传页面
        window.location.href = 'upload.html';
    } else if (identity === 'tenant') {
        // 房屋使用人 - 跳转到租赁人上传页面
        window.location.href = 'upload-tenant.html';
    } else if (identity === 'property') {
        // 物业端 - 跳转到物业端上传页面
        window.location.href = 'upload-property.html';
    }
}

// 手机号查询
function queryByPhone() {
    const phone = prompt('请输入登记时使用的手机号：');
    if (phone) {
        if (!/^1\d{10}$/.test(phone)) {
            alert('请输入正确的手机号码');
            return;
        }
        // 模拟查询
        alert(`正在查询手机号 ${phone} 的装修登记信息...`);
    }
}

// 房屋编号查询
function queryByHouse() {
    const houseId = prompt('请输入房屋公安编号：');
    if (houseId) {
        // 模拟查询
        alert(`正在查询房屋编号 ${houseId} 的装修登记信息...`);
    }
}

// 开始申请（兼容旧版本）
function startApplication() {
    window.location.href = 'upload.html?identity=owner';
}

// 切换身份 - 打开弹窗
function toggleIdentity() {
    const modal = document.getElementById('identityModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 关闭身份弹窗
function closeIdentityModal() {
    const modal = document.getElementById('identityModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 设置身份
function setIdentity(identity) {
    state.identity = identity;

    const identityLabel = document.getElementById('identityLabel');
    const identitySwitch = document.getElementById('identitySwitch');
    const ownerMaterials = document.getElementById('ownerMaterials');
    const tenantMaterials = document.getElementById('tenantMaterials');
    const ownerInfo = document.getElementById('ownerInfo');

    if (identity === 'owner') {
        if (identityLabel) identityLabel.textContent = '产权人';
        if (identitySwitch) identitySwitch.classList.remove('tenant');
        if (ownerMaterials) ownerMaterials.style.display = 'block';
        if (tenantMaterials) tenantMaterials.style.display = 'none';
        if (ownerInfo) ownerInfo.textContent = '产权人: 张三';
    } else {
        if (identityLabel) identityLabel.textContent = '房屋使用人';
        if (identitySwitch) identitySwitch.classList.add('tenant');
        if (ownerMaterials) ownerMaterials.style.display = 'none';
        if (tenantMaterials) tenantMaterials.style.display = 'block';
        if (ownerInfo) ownerInfo.textContent = '使用人: 李四（租赁）';
    }

    closeIdentityModal();
}

// 触发文件上传
function triggerUpload(field) {
    const input = document.getElementById(`file-${field}`);
    if (input) {
        input.click();
    }
}

// 处理单文件选择
function handleFileSelect(input, field) {
    const file = input.files[0];
    if (!file) return;

    if (!validateFile(file)) {
        alert('请上传 JPG、PNG 或 PDF 格式的文件，大小不超过 10MB');
        return;
    }

    state.files[field] = file;
    showPreview(field, file);
}

// 处理多文件选择
function handleMultiFileSelect(input, field) {
    const files = Array.from(input.files);
    if (!files.length) return;

    const validFiles = files.filter(validateFile);
    if (validFiles.length !== files.length) {
        alert('部分文件格式不支持或超过大小限制，已自动过滤');
    }

    state.files[field] = [...(state.files[field] || []), ...validFiles];
    showGallery(field);
}

// 验证文件
function validateFile(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    return validTypes.includes(file.type) && file.size <= maxSize;
}

// 显示单文件预览
function showPreview(field, file) {
    const placeholder = document.getElementById(`placeholder-${field}`);
    const preview = document.getElementById(`preview-${field}`);
    const img = document.getElementById(`img-${field}`);

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            placeholder.style.display = 'none';
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        // PDF文件显示图标
        img.src = 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#f1f5f9"/>
                <text x="50" y="55" text-anchor="middle" fill="#64748b" font-size="14">PDF</text>
            </svg>
        `);
        placeholder.style.display = 'none';
        preview.style.display = 'block';
    }

    // 更新上传区域样式
    const zone = document.querySelector(`[data-field="${field}"]`);
    if (zone) {
        zone.classList.add('has-file');
    }
}

// 显示多文件画廊
function showGallery(field) {
    const gallery = document.getElementById(`gallery-${field}`);
    const placeholder = document.getElementById(`placeholder-${field}`);
    const files = state.files[field] || [];

    if (!gallery) return;

    // 清空画廊
    gallery.innerHTML = '';

    // 添加已上传文件
    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                item.innerHTML = `
                    <img src="${e.target.result}" alt="预览">
                    <button type="button" class="remove-btn" onclick="removeGalleryItem('${field}', ${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            item.innerHTML = `
                <div style="width:100%;height:100%;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#64748b;font-size:12px;">PDF</div>
                <button type="button" class="remove-btn" onclick="removeGalleryItem('${field}', ${index})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
        }

        gallery.appendChild(item);
    });

    // 添加"添加更多"按钮
    const addBtn = document.createElement('div');
    addBtn.className = 'gallery-add';
    addBtn.onclick = function(e) {
        e.stopPropagation();
        triggerUpload(field);
    };
    addBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    `;
    gallery.appendChild(addBtn);

    // 更新显示状态
    if (files.length > 0) {
        placeholder.style.display = 'none';
        gallery.style.display = 'grid';
    }
}

// 移除单个文件
function removeFile(field) {
    state.files[field] = null;

    const placeholder = document.getElementById(`placeholder-${field}`);
    const preview = document.getElementById(`preview-${field}`);
    const input = document.getElementById(`file-${field}`);

    if (placeholder) placeholder.style.display = 'flex';
    if (preview) preview.style.display = 'none';
    if (input) input.value = '';

    const zone = document.querySelector(`[data-field="${field}"]`);
    if (zone) {
        zone.classList.remove('has-file');
    }
}

// 移除画廊中的文件
function removeGalleryItem(field, index) {
    event.stopPropagation();
    state.files[field].splice(index, 1);
    showGallery(field);

    if (state.files[field].length === 0) {
        const placeholder = document.getElementById(`placeholder-${field}`);
        const gallery = document.getElementById(`gallery-${field}`);
        if (placeholder) placeholder.style.display = 'flex';
        if (gallery) gallery.style.display = 'none';
    }
}

// 切换条件必填项
function toggleConditional(field) {
    const checkbox = document.getElementById(`check-${field}`);
    const zone = document.getElementById(`zone-${field}`);

    state.conditions[field] = checkbox.checked;

    if (zone) {
        zone.style.display = checkbox.checked ? 'block' : 'none';
    }
}

// 下载模板
function downloadTemplate(type) {
    event.preventDefault();
    // 模拟下载模板
    alert('正在下载《住宅室内装饰装修告知书》模板...');
}

// 选择房屋
function selectHouse() {
    alert('选择装修房屋');
}

// 保存草稿
function saveDraft() {
    // 模拟保存草稿
    const draft = {
        conditions: state.conditions,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('renovation_draft', JSON.stringify(draft));
    alert('草稿已保存');
}

// 加载草稿
function loadDraft() {
    const draft = localStorage.getItem('renovation_draft');
    if (draft) {
        try {
            const data = JSON.parse(draft);
            state.conditions = data.conditions || {};

            // 恢复条件选择状态
            Object.keys(state.conditions).forEach(field => {
                const checkbox = document.getElementById(`check-${field}`);
                if (checkbox && state.conditions[field]) {
                    checkbox.checked = true;
                    toggleConditional(field);
                }
            });
        } catch (e) {
            console.error('加载草稿失败', e);
        }
    }
}

// 验证表单 - 产权人
function validateForm() {
    const errors = [];

    // 产权人必填项检查
    if (!state.files.notice) {
        errors.push('请上传《住宅室内装饰装修告知书》');
    }
    if (!state.files.plan || state.files.plan.length === 0) {
        errors.push('请上传装饰装修方案');
    }

    // 条件必填项检查
    if (state.conditions.design && (!state.files.design || state.files.design.length === 0)) {
        errors.push('请上传设计方案（已勾选涉及变动主体/承重结构）');
    }

    if (state.conditions.company && !state.files.company) {
        errors.push('请上传装修企业资质（已勾选委托装修企业施工）');
    }

    if (state.conditions.shared && !state.files.shared) {
        errors.push('请上传共用人同意证明（已勾选涉及共用部位）');
    }

    return errors;
}

// 验证表单 - 租赁人
function validateFormTenant() {
    const errors = [];

    // 租赁人必填项检查（5项）
    if (!state.files.idcard) {
        errors.push('请上传使用人身份证');
    }
    if (!state.files.lease || state.files.lease.length === 0) {
        errors.push('请上传有效房屋租赁合同');
    }
    if (!state.files.ownerConsent) {
        errors.push('请上传产权人同意装修书面材料');
    }
    if (!state.files.property) {
        errors.push('请上传房屋所有权证');
    }
    if (!state.files.plan || state.files.plan.length === 0) {
        errors.push('请上传装饰装修方案');
    }

    // 条件必填项检查
    if (state.conditions.design && (!state.files.design || state.files.design.length === 0)) {
        errors.push('请上传设计方案（已勾选涉及变动主体/承重结构）');
    }

    if (state.conditions.company && !state.files.company) {
        errors.push('请上传装修企业资质（已勾选委托装修企业施工）');
    }

    if (state.conditions.shared && !state.files.shared) {
        errors.push('请上传共用人同意证明（已勾选涉及共用部位）');
    }

    return errors;
}

// 提交表单 - 产权人
function submitForm(event) {
    event.preventDefault();

    const errors = validateForm();

    if (errors.length > 0) {
        alert('请完善以下信息：\n\n' + errors.join('\n'));
        return;
    }

    // 确认提交
    if (!confirm('确认提交装修登记申请？\n\n提交后物业将在1-3个工作日内完成审核。')) {
        return;
    }

    // 模拟提交
    simulateSubmit();
}

// 提交表单 - 租赁人
function submitFormTenant(event) {
    event.preventDefault();

    const errors = validateFormTenant();

    if (errors.length > 0) {
        alert('请完善以下信息：\n\n' + errors.join('\n'));
        return;
    }

    // 确认提交
    if (!confirm('确认提交装修登记申请？\n\n提交后物业将在1-3个工作日内完成审核。')) {
        return;
    }

    // 模拟提交
    simulateSubmit();
}

// 验证表单 - 物业端
function validateFormProperty() {
    const errors = [];

    // 物业端必填项检查（6项）
    if (!state.files.notice) {
        errors.push('请上传已签字的《住宅室内装饰装修告知书》');
    }
    if (!state.files.idcard) {
        errors.push('请上传使用人身份证');
    }
    if (!state.files.lease || state.files.lease.length === 0) {
        errors.push('请上传有效房屋租赁合同');
    }
    if (!state.files.ownerConsent) {
        errors.push('请上传产权人同意装修书面材料');
    }
    if (!state.files.property) {
        errors.push('请上传房屋所有权证');
    }
    if (!state.files.plan || state.files.plan.length === 0) {
        errors.push('请上传装饰装修方案');
    }

    // 条件必填项检查
    if (state.conditions.design && (!state.files.design || state.files.design.length === 0)) {
        errors.push('请上传设计方案（已勾选涉及变动主体/承重结构）');
    }

    if (state.conditions.company && !state.files.company) {
        errors.push('请上传装修企业资质（已勾选委托装修企业施工）');
    }

    if (state.conditions.shared && !state.files.shared) {
        errors.push('请上传共用人同意证明（已勾选涉及共用部位）');
    }

    return errors;
}

// 提交表单 - 物业端
function submitFormProperty(event) {
    event.preventDefault();

    const errors = validateFormProperty();

    if (errors.length > 0) {
        alert('请完善以下信息：\n\n' + errors.join('\n'));
        return;
    }

    // 确认提交
    if (!confirm('确认完成装修登记？\n\n确认后将完成房屋使用人的装修登记。')) {
        return;
    }

    // 模拟提交
    simulateSubmit();
}

// 模拟提交
function simulateSubmit() {
    // 显示loading
    const submitBtn = document.querySelector('.submit-area .btn.primary');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '提交中...';
    submitBtn.disabled = true;

    // 模拟网络请求
    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;

        // 清除草稿
        localStorage.removeItem('renovation_draft');

        // 保存申请记录
        saveApplication();

        // 显示成功弹窗
        showSuccessModal();
    }, 1500);
}

// 保存申请记录
function saveApplication() {
    const applications = JSON.parse(localStorage.getItem('renovation_applications') || '[]');

    applications.unshift({
        id: Date.now(),
        address: '常州市天宁区某某花园12栋1单元101室',
        submitTime: new Date().toLocaleString('zh-CN'),
        status: 'pending',
        statusText: '待审核'
    });

    localStorage.setItem('renovation_applications', JSON.stringify(applications));
}

// 显示成功弹窗
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 关闭弹窗
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 返回首页
function goToIndex() {
    window.location.href = 'index.html';
}

// 加载历史记录
function loadHistory() {
    const historyCard = document.getElementById('historyCard');
    const historyList = document.getElementById('historyList');

    if (!historyCard || !historyList) return;

    const applications = JSON.parse(localStorage.getItem('renovation_applications') || '[]');

    if (applications.length === 0) {
        historyCard.style.display = 'none';
        return;
    }

    historyCard.style.display = 'block';
    historyList.innerHTML = applications.map(app => `
        <div class="history-item">
            <div class="history-info">
                <div class="history-title">${app.address}</div>
                <div class="history-date">提交时间：${app.submitTime}</div>
            </div>
            <span class="history-status ${app.status}">${app.statusText}</span>
        </div>
    `).join('');

    // 更新当前状态卡片
    updateStatusCard(applications[0]);
}

// 更新状态卡片
function updateStatusCard(latestApp) {
    if (!latestApp) return;

    const statusCard = document.getElementById('statusCard');
    const currentStatus = document.getElementById('currentStatus');
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const statusInfo = document.getElementById('statusInfo');
    const startBtn = document.getElementById('startBtn');

    if (latestApp.status === 'pending') {
        currentStatus.textContent = '审核中';
        statusBadge.className = 'status-badge reviewing';
        statusText.textContent = '待审核';
        statusInfo.innerHTML = '<p>您的装修登记材料已提交，物业正在审核中，请耐心等待。审核结果将通过短信和站内信通知您。</p>';
        startBtn.textContent = '查看详情';
        startBtn.onclick = function() { alert('查看申请详情'); };
    } else if (latestApp.status === 'success') {
        currentStatus.textContent = '登记成功';
        statusBadge.className = 'status-badge success';
        statusText.textContent = '已完成';
        statusInfo.innerHTML = '<p>恭喜！您的装修登记已完成，可以开始装修施工。请遵守相关规定，文明施工。</p>';
        startBtn.textContent = '再次申请';
        startBtn.onclick = startApplication;
    } else if (latestApp.status === 'rejected') {
        currentStatus.textContent = '已退回';
        statusBadge.className = 'status-badge rejected';
        statusText.textContent = '需修改';
        statusInfo.innerHTML = '<p>您的装修登记材料存在问题，已被退回。请根据退回原因修改后重新提交。</p>';
        startBtn.textContent = '重新提交';
        startBtn.onclick = startApplication;
    }
}

// 拖拽事件处理
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('dragover');

    const field = this.dataset.field;
    const files = Array.from(e.dataTransfer.files);

    if (this.classList.contains('multi')) {
        // 多文件
        const validFiles = files.filter(validateFile);
        state.files[field] = [...(state.files[field] || []), ...validFiles];
        showGallery(field);
    } else {
        // 单文件
        const file = files[0];
        if (file && validateFile(file)) {
            state.files[field] = file;
            showPreview(field, file);
        }
    }
}

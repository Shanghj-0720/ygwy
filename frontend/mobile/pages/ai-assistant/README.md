# AI住房助手 - 手机端

## 功能说明

这是一个带顶部导航栏的AI助手入口页面，通过iframe加载三个独立的H5应用：

1. **AI荐房** - 智能房源推荐系统
2. **AI业委会** - 智慧小区管理助手
3. **AI中介** - 一站式房产交易服务

## 页面特点

- 固定顶部导航栏
- 点击导航按钮切换不同的H5页面
- iframe容器加载独立H5应用
- 懒加载优化（点击时才加载对应页面）
- 响应式设计，适配移动端
- 平滑切换动画

## 访问方式

启动后端服务后访问：
```
http://localhost:8000/frontend/mobile/pages/ai-assistant/index.html
```

## 目录结构

```
ai-assistant/
├── index.html              # 主入口页面（带导航栏）
├── AI荐房-定.html           # AI荐房H5页面（仅AI荐房模块）
├── AI业委会-定.html         # AI业委会H5页面（仅AI业委会模块）
├── AI中介-定.html           # AI中介H5页面（仅AI中介模块）
└── README.md               # 说明文档
```

## 文件说明

### index.html（入口页面）
- 包含顶部导航栏（AI荐房、AI业委会、AI中介）
- 使用iframe加载三个独立H5
- 默认加载AI荐房，其他页面懒加载

### 三个独立H5文件
每个H5文件已清理为只包含自己的模块：
- **AI荐房-定.html**：只有AI荐房模块 + sendRecommendMessage函数
- **AI业委会-定.html**：只有AI业委会模块 + sendCommitteeMessage函数
- **AI中介-定.html**：只有AI中介模块 + sendAgentMessage函数

所有H5文件已移除：
- ❌ 顶部导航栏
- ❌ 其他模块的HTML代码
- ❌ 导航切换JavaScript代码
- ✅ 调整了内边距（py-4）

## 技术实现

### 导航切换逻辑

```javascript
// 点击导航按钮 -> 切换active类 -> 显示对应iframe -> 隐藏其他iframe
function switchPage(pageName) {
    // 1. 更新按钮样式
    // 2. 懒加载iframe内容
    // 3. 切换iframe显示状态
}
```

### 懒加载机制

- 默认只加载"AI荐房"页面
- 其他页面使用`data-src`属性存储URL
- 首次点击时才将`data-src`赋值给`src`，触发加载

### 样式设计

- 顶部导航栏固定定位（56px高度）
- iframe容器填充剩余空间
- 按钮激活状态：蓝色背景 + 白色文字
- 平滑过渡动画

## 优化内容

相比原始版本：
- ✅ 每个H5文件独立，职责清晰
- ✅ 无冗余代码，文件大小减小
- ✅ 无导航栏冲突（iframe有自己的导航）
- ✅ 维护简单，修改一个文件不影响其他

## 技术栈

- 原生HTML + CSS + JavaScript
- Font Awesome 图标库
- iframe 嵌入技术
- Tailwind CSS（H5页面内部）

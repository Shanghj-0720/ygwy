# 项目目录结构设计

```
a_ygwy/
│
├── docs/                           # 文档目录
│   └── 需求文档.md
│
├── frontend/                       # 前端代码
│   ├── mobile/                     # 移动端
│   │   ├── index.html             # 移动端首页（苹果抽屉式入口）
│   │   ├── pages/
│   │   │   ├── benefit/           # 公共收益模块
│   │   │   │   ├── index.html     # 收支公示页面
│   │   │   │   └── assets/
│   │   │   │       ├── css/
│   │   │   │       │   └── benefit.css
│   │   │   │       └── js/
│   │   │   │           └── benefit.js
│   │   │   │
│   │   │   └── service/           # 智能客服模块
│   │   │       ├── index.html     # 客服聊天页面
│   │   │       └── assets/
│   │   │           ├── css/
│   │   │           │   └── service.css
│   │   │           └── js/
│   │   │               └── service.js
│   │   │
│   │   └── common/                # 移动端公共资源
│   │       ├── css/
│   │       │   └── common.css
│   │       └── js/
│   │           ├── api.js         # API 请求封装
│   │           └── utils.js       # 工具函数
│   │
│   └── pc/                        # PC端
│       ├── pages/
│       │   ├── benefit/           # 公共收益模块
│       │   │   ├── index.html     # 公共收益主页（包含收支数据和报表生成两个TAB）
│       │   │   └── assets/
│       │   │       ├── css/
│       │   │       │   └── benefit.css
│       │   │       └── js/
│       │   │           └── benefit.js
│       │   │
│       │   └── service/           # 智能客服模块
│       │       ├── index.html     # 客服聊天页面
│       │       └── assets/
│       │           ├── css/
│       │           │   └── service.css
│       │           └── js/
│       │               └── service.js
│       │
│       └── common/                # PC端公共资源
│           ├── css/
│           │   └── common.css     # 企业风格样式
│           └── js/
│               ├── api.js         # API 请求封装
│               ├── utils.js       # 工具函数
│               └── charts.js      # 图表库（如 ECharts）
│
├── backend/                       # 后端代码（Python）
│   ├── app.py                     # Flask/FastAPI 主应用入口
│   ├── config.py                  # 配置文件
│   ├── requirements.txt           # Python 依赖
│   │
│   ├── api/                       # API 路由
│   │   ├── __init__.py
│   │   └── chatbot.py             # 智能客服 API
│   │
│   ├── services/                  # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── ai_service.py          # 阿里云 DashScope 对接
│   │   └── memory_service.py      # 对话记忆管理
│   │
│   ├── models/                    # 数据模型
│   │   ├── __init__.py
│   │   └── conversation.py        # 对话历史模型
│   │
│   ├── utils/                     # 工具函数
│   │   ├── __init__.py
│   │   └── logger.py              # 日志工具
│   │
│   └── data/                      # 数据存储
│       └── conversations/         # 对话历史存储（JSON/SQLite）
│
├── data/                          # 模拟数据
│   ├── benefit_data.json          # 公共收益收支模拟数据
│   └── README.md                  # 数据说明文档
│
├── .env.example                   # 环境变量示例
├── .env                           # 环境变量（存放 DashScope API Key，需添加到 .gitignore）
├── .gitignore                     # Git 忽略文件
├── README.md                      # 项目说明文档
└── run.sh                         # 启动脚本（可选）
```

## 目录说明

### 前端部分 (`frontend/`)

**移动端 (`mobile/`)**
- `index.html`: 苹果抽屉式首页入口（已完成）
- `pages/benefit/`: 公共收益模块
  - 收支公示列表
  - 关键词查询功能
- `pages/service/`: 智能客服模块
  - 文字/语音输入
  - 对话记录展示
  - 调用后端 API

**PC端 (`pc/`)**
- `pages/benefit/`: 公共收益模块
  - 两个TAB：公共收益、报表生成
  - 收支数据列表 + 详情查看
  - 报表筛选（月度/季度/年度）
  - 可视化图表（ECharts）
- `pages/service/`: 智能客服模块
  - 文字/语音输入
  - 对话记录展示
  - 调用后端 API

### 后端部分 (`backend/`)

**技术栈**
- 框架：FastAPI（推荐）或 Flask
- AI 对接：阿里云 DashScope SDK
- 环境管理：python-dotenv

**核心功能**
- `api/chatbot.py`: 提供智能客服 RESTful API
  - POST `/api/chat`: 发送消息并获取 AI 回复
  - GET `/api/history/{session_id}`: 获取对话历史
  - DELETE `/api/history/{session_id}`: 清除对话历史

- `services/ai_service.py`: DashScope 集成
  - 调用大模型生成回复
  - 支持上下文记忆

- `services/memory_service.py`: 对话记忆管理
  - Session 管理
  - 对话历史存储和检索

### 数据部分 (`data/`)

**模拟数据**
- `benefit_data.json`: 公共收益收支数据（模拟）
  - 月度/季度/年度数据
  - 收入/支出明细

### 配置文件

**`.env`**
```env
# 阿里云 DashScope API Key
DASHSCOPE_API_KEY=your_api_key_here

# 服务配置
HOST=0.0.0.0
PORT=8000

# CORS 允许的前端域名
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

**`.env.example`**
```env
DASHSCOPE_API_KEY=
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=
```

## 启动方式

### 前端
移动端和PC端都是静态HTML，直接用浏览器打开或使用 Web 服务器：
```bash
# 使用 Python 简易服务器
cd frontend
python -m http.server 8080
```

### 后端
```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

## 技术选型建议

**前端**
- 图表库：ECharts（免费、功能强大）
- HTTP 请求：原生 Fetch API 或 Axios
- 语音输入：Web Speech API（浏览器原生支持）

**后端**
- FastAPI：异步、高性能、自动生成 API 文档
- DashScope SDK：`pip install dashscope`
- 数据存储：SQLite（轻量级）或 JSON 文件

## 备注

1. 公共收益模块使用前端模拟数据，无需后端
2. 智能客服模块需要后端支持，PC 和移动端共用同一个后端服务
3. 所有 PC 端页面使用企业风格设计（适配若依系统）
4. 移动端通过抽屉式入口访问各功能模块
5. 后续可通过 Nginx 配置 HTTPS 和反向代理

# 智慧服务平台

一个综合性的社区智慧服务平台，提供公共收益公示、线上监督、智能客服等功能。

## 项目结构

```
a_ygwy/
├── backend/                    # Python后端服务
│   ├── app.py                 # FastAPI主应用
│   ├── requirements.txt       # Python依赖
│   ├── .env                   # 环境变量配置
│   ├── .env.example           # 环境变量示例
│   └── api/                   # API路由（预留）
├── frontend/                   # 前端代码
│   ├── mobile/                # 移动端
│   │   ├── index.html         # 移动端首页（抽屉式）
│   │   └── pages/
│   │       └── benefit/       # 公共收益模块
│   └── pc/                    # PC端（待开发）
├── data/                      # 模拟数据
│   └── benefit_data.json      # 公共收益数据
├── docs/                      # 文档目录
│   └── 需求文档.md
├── .gitignore                 # Git忽略文件
├── README.md                  # 项目说明
└── PROJECT_STRUCTURE.md       # 目录结构设计文档
```

## 功能模块

### 1. 公共收益（已完成）
- **移动端**：收支公示列表、关键词搜索、详情查看
- **PC端**：待开发

### 2. 线上监督
- 待开发

### 3. 智能客服
- 待开发（需要配置阿里云DashScope API Key）

## 快速开始

### 环境要求
- Python 3.8+
- Conda（推荐）

### 安装步骤

1. **创建Conda虚拟环境**
```bash
conda create -n ygwy python=3.10
conda activate ygwy
```

2. **安装依赖**
```bash
cd backend
pip install -r requirements.txt
```

3. **配置环境变量**
```bash
# 在backend目录下复制环境变量示例文件
cd backend
cp .env.example .env

# 编辑.env文件，配置必要的参数（智能客服需要配置DASHSCOPE_API_KEY）
```

4. **启动服务**
```bash
# 在backend目录下执行
python app.py
```

服务启动后会显示：
```
╔══════════════════════════════════════════════════════════╗
║           智慧服务平台后端服务已启动                        ║
╚══════════════════════════════════════════════════════════╝

  服务地址: http://0.0.0.0:8000
  移动端首页: http://localhost:8000/
  PC端公共收益: http://localhost:8000/frontend/pc/pages/benefit/index.html
  移动端公共收益: http://localhost:8000/frontend/mobile/pages/benefit/index.html
  健康检查: http://localhost:8000/health
  API文档: http://localhost:8000/docs

按 Ctrl+C 停止服务
```

5. **访问应用**

在浏览器中打开：
- 移动端首页：`http://localhost:8000/`
- 健康检查：`http://localhost:8000/health`
- API文档：`http://localhost:8000/docs`

## 开发说明

### 技术栈

**后端**
- FastAPI - 高性能Web框架
- Uvicorn - ASGI服务器
- DashScope - 阿里云大模型SDK（智能客服）

**前端**
- 原生HTML/CSS/JavaScript
- 移动端采用iOS风格设计
- PC端采用企业风格（若依系统兼容）

### 目录说明

- `backend/` - Python后端服务
  - `app.py` - 主应用入口，提供静态文件托管和API
  - `api/` - API路由（智能客服等）
  - `services/` - 业务逻辑层
  - `models/` - 数据模型

- `frontend/` - 前端静态文件
  - `mobile/` - 移动端页面
  - `pc/` - PC端页面

- `data/` - 模拟数据文件

### 开发模式

服务默认开启了`reload=True`，修改代码后会自动重启。

### API文档

启动服务后访问 `http://localhost:8000/docs` 查看自动生成的API文档。

### 端口配置

默认端口为8000，可以在`.env`文件中修改：
```
PORT=8000
```

## 部署说明

### 生产环境部署

1. **修改环境变量**
```bash
# .env文件
DEBUG=False
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://yourdomain.com
```

2. **使用Gunicorn运行**
```bash
pip install gunicorn
gunicorn backend.app:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

3. **配置Nginx反向代理**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

4. **配置HTTPS**（推荐使用Let's Encrypt）
```bash
certbot --nginx -d yourdomain.com
```

## 常见问题

### 1. 端口被占用
```bash
# 修改.env文件中的PORT配置
PORT=8080
```

### 2. 依赖安装失败
```bash
# 使用清华源
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 3. 跨域问题
在`.env`文件中配置CORS_ORIGINS，或在生产环境使用Nginx处理。

## 待开发功能

- [ ] PC端公共收益页面
- [ ] 智能客服功能（PC+移动端）
- [ ] 线上监督模块
- [ ] 用户认证系统
- [ ] 数据持久化

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或联系开发团队。

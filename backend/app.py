"""
智慧服务平台后端服务
提供静态文件托管和智能客服API
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import os
from dotenv import load_dotenv
from services.chat_service import chat_service

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(
    title="智慧服务平台API",
    description="提供公共收益、智能客服等功能的后端服务",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该配置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 获取项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent

# 挂载静态文件目录
app.mount("/frontend", StaticFiles(directory=str(BASE_DIR / "frontend")), name="frontend")
app.mount("/data", StaticFiles(directory=str(BASE_DIR / "data")), name="data")

# 健康检查接口
@app.get("/")
async def read_root():
    """根路径返回移动端首页"""
    index_path = BASE_DIR / "frontend" / "mobile" / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    else:
        raise HTTPException(status_code=404, detail="首页文件不存在")

@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "message": "智慧服务平台后端服务运行正常"
    }

@app.get("/api/info")
async def get_info():
    """获取系统信息"""
    return {
        "name": "智慧服务平台",
        "version": "1.0.0",
        "modules": ["公共收益", "线上监督", "智能客服"],
        "status": "running"
    }


# 定义请求模型
class ChatRequest(BaseModel):
    message: str
    session_id: str = None


# 智能客服API
@app.post("/api/chat/session")
async def create_session():
    """创建新会话"""
    try:
        session_id = chat_service.create_session()
        return {
            "success": True,
            "session_id": session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    智能客服聊天接口
    请求体: {"message": "用户消息", "session_id": "会话ID(可选)"}
    """
    try:
        # 如果没有提供session_id,创建新会话
        session_id = request.session_id
        if not session_id:
            session_id = chat_service.create_session()

        # 调用聊天服务
        result = chat_service.chat(session_id, request.message)

        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "未知错误"))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/chat/history/{session_id}")
async def get_history(session_id: str):
    """获取对话历史"""
    try:
        result = chat_service.get_history(session_id)
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=404, detail=result.get("error", "会话不存在"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/chat/history/{session_id}")
async def clear_history(session_id: str):
    """清除对话历史"""
    try:
        success = chat_service.clear_session(session_id)
        if success:
            return {
                "success": True,
                "message": "会话历史已清除"
            }
        else:
            raise HTTPException(status_code=404, detail="会话不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    # 从环境变量读取配置
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    print(f"""
╔══════════════════════════════════════════════════════════╗
║           智慧服务平台后端服务已启动                        ║
╚══════════════════════════════════════════════════════════╝

  服务地址: http://{host}:{port}
  移动端首页: http://localhost:{port}/
  PC端公共收益: http://localhost:{port}/frontend/pc/pages/benefit/index.html
  PC端线上监督: http://localhost:{port}/frontend/pc/pages/supervision/index.html
  移动端公共收益: http://localhost:{port}/frontend/mobile/pages/benefit/index.html
  健康检查: http://localhost:{port}/health
  API文档: http://localhost:{port}/docs

按 Ctrl+C 停止服务
    """)

    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=True,  # 开发模式，自动重载
        log_level="info"
    )

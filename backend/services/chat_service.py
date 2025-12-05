"""
智能客服服务
集成阿里云DashScope,提供智能问答功能
"""

import dashscope
from dashscope import Generation
import os
from typing import List, Dict, AsyncGenerator
import uuid
import json
import asyncio


class ChatService:
    """智能客服服务类"""

    def __init__(self):
        """初始化服务,配置DashScope API"""
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise ValueError("未配置DASHSCOPE_API_KEY环境变量")

        dashscope.api_key = self.api_key
        self.model = "qwen-plus"

        # 系统提示词 - 定义AI助手的角色
        self.system_prompt = """你是一个专业的社区物业智能客服助手,负责回答业主关于法规、业务、公约等相关问题。

你的职责包括:
1. 解答物业管理相关的法律法规问题
2. 说明社区业务办理流程和规定
3. 解释社区公约和管理制度
4. 提供友好、专业、准确的咨询服务

回答要求:
- 语言简洁明了,易于理解
- 态度友好、专业
- 如果不确定,请诚实告知并建议联系人工客服
- 重点关注物业服务相关内容
- **重要:请使用纯文本回答,不要使用任何Markdown标记(如**、#、-、*等),直接输出文字内容即可**"""

        # 会话存储 {session_id: [messages]}
        self.sessions = {}

    def create_session(self) -> str:
        """创建新会话,返回会话ID"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = []
        return session_id

    def get_session_messages(self, session_id: str) -> List[Dict]:
        """获取会话历史消息"""
        return self.sessions.get(session_id, [])

    def clear_session(self, session_id: str) -> bool:
        """清除会话历史"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

    def chat(self, session_id: str, user_message: str) -> Dict:
        """
        发送消息并获取AI回复

        Args:
            session_id: 会话ID
            user_message: 用户消息

        Returns:
            包含回复内容的字典
        """
        try:
            # 确保会话存在
            if session_id not in self.sessions:
                self.sessions[session_id] = []

            # 构建消息列表
            messages = [
                {"role": "system", "content": self.system_prompt}
            ]

            # 添加历史消息(实现记忆功能)
            messages.extend(self.sessions[session_id])

            # 添加当前用户消息
            messages.append({"role": "user", "content": user_message})

            # 调用DashScope API
            response = Generation.call(
                model=self.model,
                messages=messages,
                result_format='message'
            )

            # 检查响应状态
            if response.status_code == 200:
                assistant_message = response.output.choices[0].message.content

                # 保存到会话历史
                self.sessions[session_id].append({"role": "user", "content": user_message})
                self.sessions[session_id].append({"role": "assistant", "content": assistant_message})

                return {
                    "success": True,
                    "message": assistant_message,
                    "session_id": session_id
                }
            else:
                return {
                    "success": False,
                    "error": f"API调用失败: {response.code} - {response.message}"
                }

        except Exception as e:
            return {
                "success": False,
                "error": f"服务异常: {str(e)}"
            }

    def get_history(self, session_id: str) -> Dict:
        """
        获取会话历史

        Args:
            session_id: 会话ID

        Returns:
            包含历史消息的字典
        """
        if session_id not in self.sessions:
            return {
                "success": False,
                "error": "会话不存在"
            }

        return {
            "success": True,
            "history": self.sessions[session_id],
            "message_count": len(self.sessions[session_id])
        }

    async def chat_stream(self, session_id: str, user_message: str) -> AsyncGenerator[str, None]:
        """
        流式发送消息并获取AI回复 (使用SSE)

        Args:
            session_id: 会话ID
            user_message: 用户消息

        Yields:
            SSE格式的消息流
        """
        try:
            # 确保会话存在
            if session_id not in self.sessions:
                self.sessions[session_id] = []

            # 构建消息列表
            messages = [
                {"role": "system", "content": self.system_prompt}
            ]

            # 添加历史消息(实现记忆功能)
            messages.extend(self.sessions[session_id])

            # 添加当前用户消息
            messages.append({"role": "user", "content": user_message})

            # 在线程池中调用DashScope流式API,避免阻塞事件循环
            def call_api():
                return Generation.call(
                    model=self.model,
                    messages=messages,
                    result_format='message',
                    stream=True,
                    incremental_output=True
                )

            # 异步执行API调用
            responses = await asyncio.to_thread(call_api)

            # 收集完整回复用于保存到历史
            full_response = ""

            # 流式输出 - 在线程中处理每个响应
            for response in responses:
                # 让出控制权,允许其他请求处理
                await asyncio.sleep(0)

                if response.status_code == 200:
                    # 获取增量内容
                    chunk = response.output.choices[0].message.content
                    full_response += chunk

                    # 发送SSE格式的数据
                    yield f"data: {json.dumps({'type': 'chunk', 'content': chunk}, ensure_ascii=False)}\n\n"
                else:
                    # 发送错误消息
                    error_msg = f"API调用失败: {response.code} - {response.message}"
                    yield f"data: {json.dumps({'type': 'error', 'error': error_msg}, ensure_ascii=False)}\n\n"
                    return

            # 保存到会话历史
            self.sessions[session_id].append({"role": "user", "content": user_message})
            self.sessions[session_id].append({"role": "assistant", "content": full_response})

            # 发送完成消息
            yield f"data: {json.dumps({'type': 'done', 'session_id': session_id}, ensure_ascii=False)}\n\n"

        except Exception as e:
            # 发送异常消息
            yield f"data: {json.dumps({'type': 'error', 'error': f'服务异常: {str(e)}'}, ensure_ascii=False)}\n\n"


# 创建全局服务实例
chat_service = ChatService()

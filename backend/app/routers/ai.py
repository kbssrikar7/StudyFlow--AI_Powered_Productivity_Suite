import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from ..services.ai_service import ai_service
from ..models.session import Session as SessionModel

router = APIRouter()

# Global connection pool — reused across requests instead of opening a new connection each time
_http_client = httpx.AsyncClient(timeout=30.0)

class AnalyzeRequest(BaseModel):
    limit: Optional[int] = 20

class StudyPlanRequest(BaseModel):
    goals: str
    available_hours: int

class ExplainCodeRequest(BaseModel):
    code: str
    language: str

class TaskBreakdownRequest(BaseModel):
    task: str

class MotivationRequest(BaseModel):
    context: str = "general"

@router.post("/analyze-patterns")
async def analyze_study_patterns(
    request: AnalyzeRequest,
    db: Session = Depends(get_db)
):
    """Analyze study patterns using AI"""
    try:
        # Get recent sessions
        sessions = (
            db.query(SessionModel)
            .order_by(SessionModel.created_at.desc())
            .limit(request.limit)
            .all()
        )
        
        session_dicts = [
            {
                "id": s.id,
                "title": s.title,
                "duration": s.duration,
                "completed": s.completed,
                "created_at": str(s.created_at),
            }
            for s in sessions
        ]
        
        analysis = await ai_service.analyze_study_pattern(session_dicts)
        
        return {
            "analysis": analysis,
            "sessions_analyzed": len(session_dicts)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing patterns: {str(e)}"
        )

@router.post("/generate-study-plan")
async def generate_study_plan(request: StudyPlanRequest):
    """Generate personalized study plan"""
    try:
        plan = await ai_service.generate_study_plan(
            request.goals,
            request.available_hours
        )
        
        return {
            "plan": plan,
            "goals": request.goals,
            "hours_per_week": request.available_hours
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating plan: {str(e)}"
        )

@router.post("/explain-code")
async def explain_code(request: ExplainCodeRequest):
    """Explain code snippet"""
    try:
        explanation = await ai_service.explain_code_snippet(
            request.code,
            request.language
        )
        
        return {
            "explanation": explanation,
            "language": request.language
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error explaining code: {str(e)}"
        )

@router.post("/break-down-task")
async def break_down_task(request: TaskBreakdownRequest):
    """Break down complex task into subtasks"""
    try:
        subtasks = await ai_service.suggest_task_breakdown(request.task)
        
        return {
            "original_task": request.task,
            "subtasks": subtasks
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error breaking down task: {str(e)}"
        )

@router.post("/motivation")
async def get_motivation(request: MotivationRequest):
    """Get AI-generated motivation"""
    try:
        message = await ai_service.generate_motivation(request.context)
        
        return {
            "message": message,
            "context": request.context
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating motivation: {str(e)}"
        )

@router.get("/test-groq")
async def test_groq():
    """Test Groq API connectivity"""
    import os
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"status": "error", "message": "GROQ_API_KEY not found in environment"}
    try:
        response = await _http_client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": "openai/gpt-oss-120b", "messages": [{"role": "user", "content": "Say hello"}], "max_tokens": 50}
        )
        if response.status_code == 200:
            data = response.json()
            return {"status": "success", "response": data["choices"][0]["message"]["content"], "api_key_prefix": api_key[:10] + "..."}
        else:
            return {"status": "error", "code": response.status_code, "message": response.text}
    except Exception as e:
        return {"status": "error", "exception": str(e), "type": type(e).__name__}


@router.get("/chat")
async def chat(message: str):
    """Simple chat with AI"""
    import os
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"response": "Groq API Key not configured.", "user_message": message}
    try:
        response = await _http_client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "openai/gpt-oss-120b",
                "messages": [
                    {"role": "system", "content": "You are a helpful study assistant. Keep responses concise and practical."},
                    {"role": "user", "content": message}
                ],
                "max_tokens": 300,
                "temperature": 0.7
            }
        )
        if response.status_code == 200:
            data = response.json()
            return {"response": data["choices"][0]["message"]["content"], "user_message": message}
        else:
            return {"response": f"API Error: {response.status_code}", "user_message": message}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error in chat: {str(e)}")

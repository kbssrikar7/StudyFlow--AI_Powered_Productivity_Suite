import os
from groq import Groq
from typing import List, Dict, Optional
from datetime import datetime

from ..config import settings

class AIService:
    def __init__(self):
        # Graceful handling if API key is missing
        api_key = settings.groq_api_key
        self.client = Groq(api_key=api_key) if api_key else None
        self.model = "llama-3.3-70b-versatile"  # Fast and powerful
        
    async def analyze_study_pattern(self, sessions: List[Dict]) -> str:
        """Analyze study patterns and provide insights"""
        if not self.client:
            return "Groq API Key not configured. Please add GROQ_API_KEY to your .env file."

        # Prepare session data
        session_summary = self._prepare_session_summary(sessions)
        
        prompt = f"""You are a study productivity expert. Analyze these study sessions and provide:
1. Key patterns and trends
2. Strengths in study habits
3. Areas for improvement
4. Specific actionable recommendations

Study Sessions Data:
{session_summary}

Provide a concise but insightful analysis in 4-5 bullet points."""

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful study productivity coach who provides actionable, specific advice."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.7,
                max_tokens=500,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Error analyzing patterns: {str(e)}"
    
    async def generate_study_plan(self, goals: str, available_hours: int) -> str:
        """Generate personalized study plan"""
        if not self.client:
            return "Groq API Key not configured. Please add GROQ_API_KEY to your .env file."
        
        prompt = f"""Create a realistic study plan for someone with:
- Goals: {goals}
- Available study time: {available_hours} hours per week

Provide:
1. Daily breakdown
2. Subject priorities
3. Recommended techniques
4. Break schedule

Keep it practical and achievable."""

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a study planning expert who creates realistic, achievable plans."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.8,
                max_tokens=800,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating plan: {str(e)}"
    
    async def explain_code_snippet(self, code: str, language: str) -> str:
        """Explain code snippet in simple terms"""
        if not self.client:
            return "Groq API Key not configured. Please add GROQ_API_KEY to your .env file."
        
        prompt = f"""Explain this {language} code snippet in simple terms:

```{language}
{code}
```

Provide:
1. What it does
2. How it works (step by step)
3. Key concepts used
4. Potential improvements"""

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a coding tutor who explains code clearly for beginners."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.5,
                max_tokens=600,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Error explaining code: {str(e)}"
    
    async def suggest_task_breakdown(self, task: str) -> List[str]:
        """Break down complex task into subtasks"""
        if not self.client:
            return ["Groq API Key not configured. Please add GROQ_API_KEY to your .env file."]
        
        prompt = f"""Break down this learning task into 5-7 smaller, actionable subtasks:

Task: {task}

Return ONLY a numbered list, one subtask per line."""

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a task breakdown expert. Return only numbered lists."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.6,
                max_tokens=300,
            )
            
            content = response.choices[0].message.content
            # Parse numbered list
            subtasks = [line.strip() for line in content.split('\n') if line.strip() and line[0].isdigit()]
            return subtasks
        except Exception as e:
            return [f"Error breaking down task: {str(e)}"]
    
    async def generate_motivation(self, context: str = "general") -> str:
        """Generate motivational message based on context"""
        if not self.client:
            return "Groq API Key not configured. Please add GROQ_API_KEY to your .env file."
        
        prompts = {
            "struggling": "Generate a short, powerful motivational message for someone struggling with their studies. Keep it real and encouraging.",
            "procrastinating": "Generate a tough-love motivational message for someone procrastinating. Be direct but supportive.",
            "streak": "Generate a congratulatory message for someone maintaining a study streak. Be enthusiastic!",
            "general": "Generate a motivational quote about learning and growth. Keep it inspiring but grounded."
        }
        
        prompt = prompts.get(context, prompts["general"])
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a motivational coach. Keep messages short (2-3 sentences)."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=self.model,
                temperature=0.9,
                max_tokens=150,
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return "Keep going. You're making progress, one step at a time."
    
    def _prepare_session_summary(self, sessions: List[Dict]) -> str:
        """Prepare session data for AI analysis"""
        if not sessions:
            return "No sessions data available"
        
        summary = []
        for session in sessions[-20:]:  # Last 20 sessions
            duration_min = session.get('duration', 0) / 60
            completed = "✓" if session.get('completed') else "✗"
            summary.append(
                f"{completed} {duration_min:.0f}min - {session.get('title', 'Untitled')} - {session.get('created_at', 'N/A')}"
            )
        
        return "\n".join(summary)

# Singleton instance
ai_service = AIService()

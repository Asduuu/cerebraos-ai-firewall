from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
from datetime import datetime

class PromptLog(Base):
    __tablename__ = "prompt_logs"

    id = Integer = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    original_prompt = Column(String)
    sanitized_prompt = Column(String)
    action_taken = Column(String)
    blocked = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
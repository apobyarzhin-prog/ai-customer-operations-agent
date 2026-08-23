from typing import Literal

from pydantic import BaseModel, Field

TriagePriority = Literal["low", "normal", "high", "urgent"]
TriageStatus = Literal["open", "in_progress", "resolved"]
TriageProvider = Literal["openai", "demo", "demo_fallback"]


class TicketTriageRead(BaseModel):
    """A bounded, explainable recommendation for a support ticket."""

    priority: TriagePriority
    recommended_status: TriageStatus
    summary: str = Field(min_length=1)
    suggested_reply: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)
    reasoning: list[str] = Field(min_length=1)
    provider: TriageProvider

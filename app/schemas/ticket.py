from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

TicketStatus = Literal["open", "in_progress", "resolved"]


class TicketCreate(BaseModel):
    customer_id: int
    subject: str
    description: str
    status: TicketStatus = "open"


class TicketStatusUpdate(BaseModel):
    status: TicketStatus


class TicketRead(TicketCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    created_at: datetime

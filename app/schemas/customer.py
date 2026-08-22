from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class CustomerCreate(BaseModel):
    email: EmailStr
    full_name: str


class CustomerRead(CustomerCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

OrderStatus = Literal["processing", "shipped", "delivered", "cancelled"]


class OrderCreate(BaseModel):
    customer_id: int
    status: OrderStatus = "processing"
    total_amount: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    shipping_address: str


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderRead(OrderCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    created_at: datetime

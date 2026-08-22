import re
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class WorkspaceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    created_at: datetime


class WorkspaceSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    workspace_id: int = Field(validation_alias="id")
    product_name: str
    logo_url: str | None
    brand_color: str
    brand_secondary_color: str
    locale: str
    timezone: str


class WorkspaceSettingsUpdate(BaseModel):
    product_name: str | None = Field(default=None, min_length=1, max_length=120)
    logo_url: str | None = Field(default=None, max_length=500)
    brand_color: str | None = None
    brand_secondary_color: str | None = None
    locale: str | None = Field(default=None, min_length=2, max_length=10)
    timezone: str | None = Field(default=None, min_length=1, max_length=64)

    @field_validator("brand_color", "brand_secondary_color")
    @classmethod
    def validate_hex_color(cls, value: str | None) -> str | None:
        if value is not None and re.fullmatch(r"#[0-9A-Fa-f]{6}", value) is None:
            raise ValueError("must be a six-digit hex color such as #D97706")
        return value

    @field_validator("locale")
    @classmethod
    def normalize_locale(cls, value: str | None) -> str | None:
        return value.lower() if value is not None else None

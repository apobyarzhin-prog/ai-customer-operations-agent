from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    workspace_id: int
    role: str


class TokenRead(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead


class SessionRead(BaseModel):
    """Refresh response; access token remains in JSON for legacy Bearer clients."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead

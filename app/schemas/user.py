from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from app.models.user import UserRole

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole
    phone_number: Optional[str] = None
    supervisor_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    phone_number: Optional[str]
    is_active: bool
    supervisor_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)
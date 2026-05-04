from pydantic import BaseModel, EmailStr, ConfigDict
from app.models.user import UserRole

# Data required to create a user (Signup)
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.STAFF # Default role is staff

# Data we send back to the frontend (View)
# Notice: No password field! We NEVER send passwords back.
class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool

    # This tells Pydantic to read data even if it's an SQLAlchemy object
    model_config = ConfigDict(from_attributes=True)
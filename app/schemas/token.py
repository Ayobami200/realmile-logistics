from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    # This is what we store inside the token (the user's email)
    email: Optional[str] = None
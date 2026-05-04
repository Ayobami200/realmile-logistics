from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

# 1. Setup Password Hashing
# We tell Passlib to use argon2. It handles the "salt" and "rounds" automatically.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    """Takes a plain text password and returns a secure hash."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compares a login password with the one in our database."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(subject: Union[str, Any]) -> str:
    """
    Creates a JWT (JSON Web Token).
    This token is like a 'VIP Pass' the user sends back in every request
    so they don't have to log in every single time.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
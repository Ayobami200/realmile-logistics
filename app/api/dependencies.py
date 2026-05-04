from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.services import user_svc
from app.schemas.token import TokenData

# This tells FastAPI to look for a "Bearer" token in the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_current_user(
    db: AsyncSession = Depends(get_db), 
    token: str = Depends(oauth2_scheme)
) -> User:
    """
    1. Decodes the JWT token.
    2. Validates the user email exists in our DB.
    3. Returns the User object.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token using our Secret Key
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = await user_svc.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

def check_admin(current_user: User = Depends(get_current_user)):
    """
    Checks if the logged-in user is an ADMIN.
    Usage: Depends(check_admin)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only Admins can perform this action"
        )
    return current_user
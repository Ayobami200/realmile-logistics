from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides an async database session to our routes.
    It ensures the session is closed after the request is finished.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
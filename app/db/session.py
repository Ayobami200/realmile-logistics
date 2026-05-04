from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# We add connect_args to force SSL handling correctly for asyncpg
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True, 
    future=True,
    connect_args={"ssl": True} # This tells asyncpg to use SSL
)

AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)
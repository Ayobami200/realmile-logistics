from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Create the async engine
# echo=True prints all SQL queries to the terminal (great for debugging)
engine = create_async_engine(
    settings.DATABASE_URL, 
    echo=True, 
    future=True
)

# Create a session factory
# Every time a user makes an API request, we will generate a new AsyncSession
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)
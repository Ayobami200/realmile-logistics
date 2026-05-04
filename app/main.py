from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend for Realmile Logistics Last-Mile Management System"
)

# Set up CORS (Cross-Origin Resource Sharing)
# This allows our frontend to talk to our backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, we will replace "*" with our frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Realmile Logistics API",
        "status": "Running",
        "docs": "/docs"
    }

# We will include our routers here in the next steps
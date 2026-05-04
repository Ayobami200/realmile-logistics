from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class PartnerCreate(BaseModel):
    name: str
    contact_phone: Optional[str] = None

class PartnerOut(BaseModel):
    id: int
    name: str
    contact_phone: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
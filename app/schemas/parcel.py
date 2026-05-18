from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models.parcel import ParcelStatus

# Define this first!
class ParcelScanRequest(BaseModel):
    waybill_number: str

class ParcelDispatch(BaseModel):
    waybill_number: str
    rider_id: int

class StatusUpdate(BaseModel):
    waybill_number: str
    status: ParcelStatus
    notes: Optional[str] = None

class TrackingEventOut(BaseModel):
    id: int
    status: ParcelStatus
    notes: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ParcelOut(BaseModel):
    id: int
    waybill_number: str
    partner_id: int
    rider_id: Optional[int]
    status: ParcelStatus
    recipient_name: str
    recipient_phone: str
    delivery_address: str
    created_at: datetime
    delivery_deadline: datetime
    return_deadline: Optional[datetime]
    history: List[TrackingEventOut] = []

    model_config = ConfigDict(from_attributes=True)
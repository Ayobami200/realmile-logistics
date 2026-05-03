import enum
from datetime import datetime, timedelta
from sqlalchemy import String, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class ParcelStatus(str, enum.Enum):
    PICKED_UP = "picked_up"             # Picked up from Speedaf/GIG hub
    IN_WAREHOUSE = "in_warehouse"       # Arrived at Realmile Warehouse
    DISPATCHED = "dispatched"           # Handed to Rider
    DELIVERED = "delivered"             # Successfully delivered
    DELIVERY_FAILED = "delivery_failed" # Attempted but failed
    CANCELLED = "cancelled"
    RETURN_OVERDUE = "return_overdue"   # Breached the 5-day return SLA

class Parcel(Base):
    __tablename__ = "parcels"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    waybill_number: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    
    # Relationships
    partner_id: Mapped[int] = mapped_column(ForeignKey("partners.id"), nullable=False)
    rider_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True) # Assigned rider
    
    status: Mapped[ParcelStatus] = mapped_column(Enum(ParcelStatus), default=ParcelStatus.PICKED_UP)
    
    # Recipient Info
    recipient_name: Mapped[str] = mapped_column(String(255))
    recipient_phone: Mapped[str] = mapped_column(String(20))
    delivery_address: Mapped[str] = mapped_column(Text)
    
    # SLA Tracking Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # 5 Days Delivery SLA
    delivery_deadline: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.utcnow() + timedelta(days=5)
    )
    
    # 5 Days Return SLA (Starts if delivery fails or is overdue)
    return_deadline: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relationships for easy access in Python
    partner = relationship("Partner")
    rider = relationship("User")
    history = relationship("TrackingEvent", back_populates="parcel")

class TrackingEvent(Base):
    """
    This stores every single scan/update for a parcel.
    This creates the "Timeline" view like in the Speedaf app.
    """
    __tablename__ = "tracking_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    parcel_id: Mapped[int] = mapped_column(ForeignKey("parcels.id"), nullable=False)
    status: Mapped[ParcelStatus] = mapped_column(Enum(ParcelStatus))
    notes: Mapped[str] = mapped_column(Text, nullable=True) # e.g. "Customer not picking up"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_by_id: Mapped[int] = mapped_column(ForeignKey("users.id")) # Who performed the scan?

    parcel = relationship("Parcel", back_populates="history")
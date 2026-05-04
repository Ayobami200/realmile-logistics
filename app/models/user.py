import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Enum, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"              # Your Uncle
    ACCOUNTANT = "accountant"    # Office
    MARKETING = "marketing"      # Office
    OPS_STAFF = "ops_staff"      # Operations (Scanning/Dispatching)
    RIDER = "rider"              # Delivery (Bike)
    FOOT_COURIER = "foot_courier"# Delivery (Foot)

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    
    # New Fields for Hierarchy and Logistics
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20))
    
    # For Riders/Foot Couriers: who is their supervisor?
    supervisor_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    # This allows an Ops Staff to see their team: ops_staff.subordinates
    subordinates = relationship("User", backref="supervisor", remote_side=[id])
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.parcel import Parcel, ParcelStatus
from app.schemas.parcel import ParcelCreate, ParcelOut
from app.services import parcel_svc
from datetime import datetime

router = APIRouter()

@router.post("/scan-in", response_model=ParcelOut)
async def scan_parcel_in(
    parcel_in: ParcelCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Staff scans a parcel arriving from Speedaf/GIG/etc.
    """
    # Only Admin or Staff can scan items in
    if current_user.role not in [UserRole.ADMIN, UserRole.STAFF]:
        raise HTTPException(status_code=403, detail="Not authorized to scan in parcels")

    # Check if waybill already exists
    existing = await parcel_svc.get_parcel_by_waybill(db, parcel_in.waybill_number)
    if existing:
        raise HTTPException(status_code=400, detail="Waybill already scanned in system")

    return await parcel_svc.scan_in_parcel(db, parcel_in, current_user.id)

@router.get("/", response_model=List[ParcelOut])
async def list_parcels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns all parcels with their full history.
    """
    result = await db.execute(
        select(Parcel).options(selectinload(Parcel.history))
    )
    return result.scalars().all()

@router.get("/overdue-delivery", response_model=List[ParcelOut])
async def get_overdue_delivery(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Shows parcels that have passed the 5-day delivery SLA and are NOT delivered.
    """
    now = datetime.utcnow()
    result = await db.execute(
        select(Parcel)
        .where(Parcel.delivery_deadline < now)
        .where(Parcel.status != ParcelStatus.DELIVERED)
        .options(selectinload(Parcel.history))
    )
    return result.scalars().all()
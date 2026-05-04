from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.parcel import Parcel, ParcelStatus, TrackingEvent
from app.schemas.parcel import (
    ParcelCreate, 
    ParcelOut, 
    ParcelDispatch, 
    StatusUpdate
)
from app.services import parcel_svc
from datetime import datetime, timedelta

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
   # We now use OPS_STAFF instead of the old STAFF role
    if current_user.role not in [UserRole.ADMIN, UserRole.OPS_STAFF]:
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

@router.patch("/dispatch", response_model=ParcelOut)
async def dispatch_parcel(
    dispatch_data: ParcelDispatch,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Assigns a parcel to a rider and marks it as DISPATCHED.
    """
    # 1. Find the parcel
    parcel = await parcel_svc.get_parcel_by_waybill(db, dispatch_data.waybill_number)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    # 2. Update the parcel
    parcel.rider_id = dispatch_data.rider_id
    parcel.status = ParcelStatus.DISPATCHED
    
    # 3. Create a tracking event so your uncle knows which rider took it
    event = TrackingEvent(
        parcel_id=parcel.id,
        status=ParcelStatus.DISPATCHED,
        notes=f"Parcel handed over to rider (ID: {dispatch_data.rider_id})",
        updated_by_id=current_user.id
    )
    db.add(event)
    
    await db.commit()
    
    # Re-fetch with history for the response
    return await parcel_svc.get_parcel_by_waybill(db, dispatch_data.waybill_number)



@router.patch("/update-status", response_model=ParcelOut)
async def update_parcel_status(
    data: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    parcel = await parcel_svc.get_parcel_by_waybill(db, data.waybill_number)
    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    parcel.status = data.status
    
    # SLA LOGIC: If delivery failed, set the Return Deadline to 5 days from now
    if data.status == ParcelStatus.DELIVERY_FAILED:
        parcel.return_deadline = datetime.utcnow() + timedelta(days=5)

    # Log the event
    event = TrackingEvent(
        parcel_id=parcel.id,
        status=data.status,
        notes=data.notes,
        updated_by_id=current_user.id
    )
    db.add(event)
    await db.commit()
    
    return await parcel_svc.get_parcel_by_waybill(db, data.waybill_number)
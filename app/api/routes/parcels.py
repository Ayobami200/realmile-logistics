from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.api.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.models.parcel import Parcel, ParcelStatus, TrackingEvent
from app.schemas.parcel import (
    ParcelScanRequest,
    ParcelOut, 
    ParcelDispatch, 
    StatusUpdate,
)
from app.services import parcel_svc
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/scan-in", response_model=ParcelOut)
async def scan_parcel_in(
    scan_req: ParcelScanRequest, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Staff scans a waybill. System auto-detects partner and fetches details.
    """
    # 1. Permission Check: Only Admin and Ops Staff can scan items
    if current_user.role not in [UserRole.ADMIN, UserRole.OPS_STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to scan in parcels"
        )

    # 2. Check for Duplicates
    existing = await parcel_svc.get_parcel_by_waybill(db, scan_req.waybill_number)
    if existing:
        raise HTTPException(
            status_code=400, 
            detail="Waybill already scanned in system"
        )

    # 3. Call the Magic Service
    # This will identify prefix, fetch mock data, and save everything.
    return await parcel_svc.scan_in_parcel(
        db, 
        waybill_number=scan_req.waybill_number, 
        user_id=current_user.id
    )

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



@router.patch("/update-status")
async def update_parcel_status(
    data: StatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user) # Ensures only logged in staff can do this
):
    # 2. Find the parcel by waybill
    query = await db.execute(
        select(Parcel).where(Parcel.waybill_number == data.waybill_number)
    )
    parcel = query.scalar_one_or_none()

    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    # 3. Clean the status (force lowercase to match DB Enum)
    new_status = data.status.lower()

    # 4. Update the parcel
    parcel.status = new_status
    
    # 5. SPECIAL LOGIC: If returned, clear the rider
    if new_status == "returned":
        parcel.rider_id = None

    # 6. Create a Tracking History Event automatically
    new_event = TrackingEvent(
        parcel_id=parcel.id,
        status=new_status,
        notes=data.notes or f"Status changed to {new_status}",
        created_at=datetime.utcnow(),
        updated_by_id=current_user.id
    )
    db.add(new_event)

    try:
        await db.commit()
        return {"message": f"Parcel {data.waybill_number} updated to {new_status}"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")
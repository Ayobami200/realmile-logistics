from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from app.models.parcel import Parcel, TrackingEvent, ParcelStatus
from app.schemas.parcel import ParcelCreate

async def scan_in_parcel(db: AsyncSession, parcel_in: ParcelCreate, user_id: int):
    # 1. Create the Parcel
    new_parcel = Parcel(
        waybill_number=parcel_in.waybill_number,
        partner_id=parcel_in.partner_id,
        recipient_name=parcel_in.recipient_name,
        recipient_phone=parcel_in.recipient_phone,
        delivery_address=parcel_in.delivery_address,
        status=ParcelStatus.IN_WAREHOUSE
    )
    db.add(new_parcel)
    await db.flush() 

    # 2. Create the first Tracking Event
    event = TrackingEvent(
        parcel_id=new_parcel.id,
        status=ParcelStatus.IN_WAREHOUSE,
        notes="Parcel received and scanned into Realmile Warehouse",
        updated_by_id=user_id
    )
    db.add(event)
    
    await db.commit()
    
    # --- THIS IS THE FIX ---
    # Instead of just refreshing, we re-query the parcel with the history loaded
    result = await db.execute(
        select(Parcel)
        .where(Parcel.id == new_parcel.id)
        .options(selectinload(Parcel.history)) # Explicitly load the timeline
    )
    return result.scalars().first()

async def get_parcel_by_waybill(db: AsyncSession, waybill: str):
    """Fetch a parcel and all its history in one go."""
    result = await db.execute(
        select(Parcel)
        .where(Parcel.waybill_number == waybill)
        .options(selectinload(Parcel.history)) # Load history events too
    )
    return result.scalars().first()
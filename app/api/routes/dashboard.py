from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime

from app.api.dependencies import get_db, get_current_user
from app.models.parcel import Parcel, ParcelStatus
from app.models.user import User

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Get Total Parcel Count (for efficiency math)
    total_query = await db.execute(select(func.count(Parcel.id)))
    total_parcels = total_query.scalar() or 0

    # 2. Total Parcels by Status
    status_query = await db.execute(
        select(Parcel.status, func.count(Parcel.id)).group_by(Parcel.status)
    )
    results = status_query.all()
    
    # Extract counts into a temporary dictionary
    db_counts = {}
    for status, count in results:
        key = status.value if hasattr(status, 'value') else str(status).lower()
        db_counts[key] = count

    # Map to EXACT keys the frontend expects
    counts = {
        "in_warehouse": db_counts.get("in_warehouse", 0),
        "dispatched": db_counts.get("dispatched", 0),
        "delivered": db_counts.get("delivered", 0),
        "delivery_failed": db_counts.get("delivery_failed", 0),
        "returned": db_counts.get("returned", 0),
    }

    # 3. Calculate Real Efficiency (Integrity)
    # Success = (Delivered + Returned) / Total
    finished_parcels = counts["delivered"] + counts["returned"]
    efficiency = (finished_parcels / total_parcels * 100) if total_parcels > 0 else 100.0

    # 4. SLA Breach Count
    # Use naive datetime to match DB columns
    now_naive = datetime.utcnow()
    overdue_query = await db.execute(
        select(func.count(Parcel.id))
        .where(Parcel.delivery_deadline < now_naive)
        .where(Parcel.status != ParcelStatus.DELIVERED)
        .where(Parcel.status != ParcelStatus.RETURNED) # Completed parcels don't count as breaches
    )
    overdue_count = overdue_query.scalar() or 0

    # 5. Rider Workload (Active Dispatches only)
    rider_query = await db.execute(
        select(User.full_name, func.count(Parcel.id))
        .join(Parcel, Parcel.rider_id == User.id)
        .where(Parcel.status == ParcelStatus.DISPATCHED)
        .group_by(User.full_name)
    )
    rider_stats = {name: count for name, count in rider_query.all()}

    return {
        "total_by_status": counts,
        "delivery_sla_breaches": overdue_count,
        "rider_workload": rider_stats,
        "efficiency_score": round(efficiency, 1)
    }
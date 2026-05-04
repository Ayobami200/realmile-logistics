from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import datetime

from app.api.dependencies import get_db, get_current_user
from app.models.parcel import Parcel, ParcelStatus
from app.models.user import User, UserRole

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Total Parcels by Status
    # This runs a "GROUP BY status" query
    status_query = await db.execute(
        select(Parcel.status, func.count(Parcel.id)).group_by(Parcel.status)
    )
    status_counts = {status.value: count for status, count in status_query.all()}

    # 2. SLA Breach Count (Delivery)
    overdue_query = await db.execute(
        select(func.count(Parcel.id))
        .where(Parcel.delivery_deadline < datetime.utcnow())
        .where(Parcel.status != ParcelStatus.DELIVERED)
    )
    overdue_delivery = overdue_query.scalar()

    # 3. Rider Performance (Count parcels assigned to each)
    rider_query = await db.execute(
        select(User.full_name, func.count(Parcel.id))
        .join(Parcel, Parcel.rider_id == User.id)
        .group_by(User.full_name)
    )
    rider_stats = {name: count for name, count in rider_query.all()}

    return {
        "total_by_status": status_counts,
        "delivery_sla_breaches": overdue_delivery,
        "rider_workload": rider_stats,
        "timestamp": datetime.utcnow()
    }
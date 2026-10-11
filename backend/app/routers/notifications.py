from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sq_delete
from app.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationReadUpdate, NotificationUpdate
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/", response_model=NotificationResponse)
async def create_notification(
    payload: NotificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    notification = Notification(
        title=payload.title,
        message=payload.message,
        created_by=current_user.id,
    )
    db.add(notification)
    await db.flush()
    await db.refresh(notification)
    return NotificationResponse.model_validate(notification)


@router.get("/", response_model=list[NotificationResponse])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Notification)
        .where(
            (Notification.participant_id == None) | (Notification.participant_id == current_user.id)
        )
        .order_by(Notification.created_at.desc())
    )
    notifications = result.scalars().all()
    return [NotificationResponse.model_validate(n) for n in notifications]


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: str,
    payload: NotificationReadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.participant_id is not None and notification.participant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    notification.is_read = payload.is_read
    await db.flush()
    await db.refresh(notification)
    return NotificationResponse.model_validate(notification)


@router.put("/{notification_id}", response_model=NotificationResponse)
async def update_notification(
    notification_id: str,
    payload: NotificationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "title" in update_data:
        notification.title = update_data["title"]
    if "message" in update_data:
        notification.message = update_data["message"]

    await db.flush()
    await db.refresh(notification)
    return NotificationResponse.model_validate(notification)


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    await db.execute(sq_delete(Notification).where(Notification.id == notification_id))
    return {"message": "Notification deleted", "id": notification_id}

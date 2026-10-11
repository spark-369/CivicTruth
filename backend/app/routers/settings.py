from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field
from app.database import get_db
from app.models.settings import Setting
from app.schemas.settings import SettingResponse, SettingUpdate
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=list[SettingResponse])
async def list_settings(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    result = await db.execute(select(Setting).limit(limit).offset(offset))
    settings = result.scalars().all()
    return [SettingResponse.model_validate(s) for s in settings]


@router.get("/{setting_id}", response_model=SettingResponse)
async def get_setting(
    setting_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = await db.execute(select(Setting).where(Setting.id == setting_id))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return SettingResponse.model_validate(setting)


@router.put("/{setting_id}", response_model=SettingResponse)
async def update_setting(
    setting_id: str,
    payload: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    result = await db.execute(select(Setting).where(Setting.id == setting_id))
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "value" in update_data:
        for field, value in update_data.items():
            setattr(setting, field, value)

    await db.flush()
    await db.refresh(setting)
    return SettingResponse.model_validate(setting)


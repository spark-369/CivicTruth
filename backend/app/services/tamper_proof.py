import asyncio
import hashlib
from datetime import datetime
from app.database import async_session_maker
from app.models.block import Block
from app.utils.time import utcnow_naive
from sqlalchemy import select

GENESIS_HASH = "0" * 64
chain_lock = asyncio.Lock()


def compute_block_hash(data_hash: str, parent_hash: str, timestamp: datetime) -> str:
    raw = f"{data_hash}:{parent_hash}:{timestamp.isoformat()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def compute_data_hash(transaction_data: str, image_url: str | None = None) -> str:
    raw = transaction_data or ""
    if image_url:
        raw = f"{raw}\n[image:{image_url}]"
    return hashlib.sha256(raw.encode()).hexdigest()


async def get_latest_hash(session=None) -> str:
    if session is not None:
        result = await session.execute(
            select(Block).order_by(Block.created_at.desc(), Block.id.desc()).limit(1)
        )
        row = result.scalar_one_or_none()
        return row.block_hash if row else GENESIS_HASH
    async with async_session_maker() as s:
        async with s.begin():
            result = await s.execute(
                select(Block).order_by(Block.created_at.desc(), Block.id.desc()).limit(1)
            )
            row = result.scalar_one_or_none()
            return row.block_hash if row else GENESIS_HASH


async def append_to_chain(block: Block, db=None) -> Block:
    async with chain_lock:
        timestamp = block.created_at or utcnow_naive()
        block.created_at = timestamp
        data_hash = compute_data_hash(block.transaction_data, block.image_url)

        if db is not None:
            latest_hash = await get_latest_hash(session=db)
            block.parent_hash = latest_hash
            block.data_hash = data_hash
            block.block_hash = compute_block_hash(data_hash, latest_hash, timestamp)
            db.add(block)
            await db.flush()
            return block

        async with async_session_maker() as session:
            async with session.begin():
                latest_hash = await get_latest_hash(session=session)
                block.parent_hash = latest_hash
                block.data_hash = data_hash
                block.block_hash = compute_block_hash(data_hash, latest_hash, timestamp)
                session.add(block)
                await session.flush()
                return block


async def verify_chain() -> dict:
    async with async_session_maker() as session:
        result = await session.execute(
            select(Block).order_by(Block.created_at.asc(), Block.id.asc())
        )
        blocks = result.scalars().all()
    if not blocks:
        return {"valid": True, "blocks_checked": 0, "broken_at": None, "details": []}
    details = []
    expected_prev = GENESIS_HASH
    for idx, block in enumerate(blocks):
        computed_data = compute_data_hash(block.transaction_data, block.image_url)
        data_ok = computed_data == block.data_hash
        block_ok = block.parent_hash == expected_prev
        details.append({
            "id": str(block.id),
            "index": idx + 1,
            "data_hash": block.data_hash,
            "block_hash": block.block_hash,
            "parent_hash": block.parent_hash,
            "data_ok": data_ok,
            "block_ok": block_ok,
            "valid": data_ok and block_ok,
        })
        if not data_ok or not block_ok:
            return {"valid": False, "blocks_checked": idx, "broken_at": str(block.id), "details": details}
        expected_prev = block.block_hash
    return {"valid": True, "blocks_checked": len(blocks), "broken_at": None, "details": details}

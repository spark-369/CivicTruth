import asyncio
import logging
from io import BytesIO
from typing import Optional, List
import httpx
import torch
from transformers import AutoImageProcessor, AutoModel
from app.config import settings

logger = logging.getLogger("civictruth")

# Cap the size of remote images we will download to bound memory and mitigate
# decompression-bomb / SSRF abuse of the model inference endpoint.
_MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB

_image_lock = asyncio.Lock()
_image_processor = None
_image_model = None


async def _get_image_model():
    global _image_processor, _image_model
    if _image_model is None:
        async with _image_lock:
            if _image_model is None:
                def _load():
                    processor = AutoImageProcessor.from_pretrained(settings.DINOV2_MODEL_ID)
                    model = AutoModel.from_pretrained(settings.DINOV2_MODEL_ID)
                    return processor, model

                _image_processor, _image_model = await asyncio.to_thread(_load)
                _image_model = _image_model.to(settings.HF_DEVICE)
                _image_model.eval()
    return _image_processor, _image_model


def _load_image_from_url(url: str) -> "PIL.Image.Image":
    import PIL.Image
    with httpx.stream("GET", url, follow_redirects=True, timeout=30) as response:
        response.raise_for_status()
        # Stream and enforce a maximum size to avoid loading oversized payloads.
        parts = []
        total = 0
        for chunk in response.iter_bytes():
            total += len(chunk)
            if total > _MAX_IMAGE_BYTES:
                raise ValueError("image exceeds maximum allowed size")
            parts.append(chunk)
    return PIL.Image.open(BytesIO(b"".join(parts))).convert("RGB")


async def extract_image_features(image_url: str) -> Optional[List[float]]:
    try:
        processor, model = await _get_image_model()
        image = await asyncio.to_thread(_load_image_from_url, image_url)

        def _infer():
            inputs = processor(images=image, return_tensors="pt")
            with torch.no_grad():
                outputs = model(**inputs)
            embedding = outputs.last_hidden_state.mean(dim=1)
            embedding = torch.nn.functional.normalize(embedding, p=2, dim=1)
            return embedding.squeeze().cpu().tolist()

        features = await asyncio.to_thread(_infer)
        return features
    except Exception as exc:
        logger.warning("Failed to extract image features from %s: %s", image_url, exc)
        return None

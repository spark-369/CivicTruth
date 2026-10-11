import asyncio
from typing import Optional, Tuple
import torch
from transformers import AutoTokenizer, AutoModel
from app.config import settings

_model_lock = asyncio.Lock()
_tokenizer = None
_model = None

VERIFICATION_LABELS = [
    "Exact Match",
    "Mismatch",
    "Partial Match",
    "Unrelated",
    "Fabricated",
]

ARCHIVE_LABELS = [
    "Factual",
    "Opinion",
    "Misleading",
    "Plausible",
    "Irrelevant",
]


async def _get_model():
    global _tokenizer, _model
    if _model is None:
        async with _model_lock:
            if _model is None:
                def _load():
                    tokenizer = AutoTokenizer.from_pretrained(settings.HF_MODEL_ID)
                    model = AutoModel.from_pretrained(settings.HF_MODEL_ID)
                    return tokenizer, model
                _tokenizer, _model = await asyncio.to_thread(_load)
                _model.eval()
    return _tokenizer, _model


def _mean_pooling(model_output, attention_mask):
    token_embeddings = model_output.last_hidden_state
    input_mask = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
    return torch.sum(token_embeddings * input_mask, 1) / torch.clamp(input_mask.sum(1), min=1e-9)


async def _encode(text: str) -> torch.Tensor:
    tokenizer, model = await _get_model()
    inputs = tokenizer(text, padding=True, truncation=True, return_tensors="pt", max_length=512)

    def _infer():
        with torch.no_grad():
            outputs = model(**inputs)
        embedding = _mean_pooling(outputs, inputs["attention_mask"])
        embedding = torch.nn.functional.normalize(embedding, p=2, dim=1)
        return embedding

    return await asyncio.to_thread(_infer)


async def _pick_label(text_emb: torch.Tensor, label_texts: list) -> Tuple[str, float]:
    label_embeddings = []
    for label_text in label_texts:
        emb = await _encode(label_text)
        label_embeddings.append(emb)
    label_embeddings = torch.cat(label_embeddings, dim=0)
    similarities = torch.nn.functional.cosine_similarity(text_emb, label_embeddings, dim=-1)
    best_idx = int(torch.argmax(similarities).item())
    best_score = float(similarities[best_idx].item())
    return label_texts[best_idx], best_score


async def verify_text_locally(
    text: str,
    reference_text: Optional[str] = None,
    candidate_labels: Optional[list] = None,
    threshold: float = 0.60,
) -> Tuple[str, float]:
    text_emb = await _encode(text)

    if reference_text is not None:
        ref_emb = await _encode(reference_text)
        similarity = float(torch.nn.functional.cosine_similarity(text_emb, ref_emb, dim=-1).item())

        if similarity > 0.85:
            label = "Exact Match"
        elif similarity > 0.65:
            label = "Partial Match"
        elif similarity > 0.40:
            label = "Mismatch"
        else:
            label = "Unrelated"

        score = max(0.0, min(1.0, similarity))
        if score < threshold:
            label = "Uncertain"
        return label, score

    labels = candidate_labels if candidate_labels is not None else ARCHIVE_LABELS
    label, score = await _pick_label(text_emb, labels)
    if score < threshold:
        label = "Uncertain"
    return label, score

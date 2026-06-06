from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.classifier import classifier_service, MODELOS

router = APIRouter()

_METRICAS = {
    "mrbert-es_E1": {"f1_fake": 0.8817, "f1_macro": 0.8864, "accuracy": 0.8866, "recall_fake": 0.8542},
    "mrbert-es_E0": {"f1_fake": 0.8571, "f1_macro": 0.8655, "accuracy": 0.8660, "recall_fake": 0.8125},
    "mroberta_E0":  {"f1_fake": 0.8315, "f1_macro": 0.8443, "accuracy": 0.8454, "recall_fake": 0.7708},
    "mroberta_E1":  {"f1_fake": 0.8182, "f1_macro": 0.8336, "accuracy": 0.8351, "recall_fake": 0.7500},
}

_INFO = {
    "mrbert-es_E1": {"arquitectura": "MrBERT-es", "escenario": "E1", "corpus": "FakeDeS + augmentación sintética E1"},
    "mrbert-es_E0": {"arquitectura": "MrBERT-es", "escenario": "E0", "corpus": "FakeDeS E0"},
    "mroberta_E0":  {"arquitectura": "mRoBERTa",  "escenario": "E0", "corpus": "FakeDeS E0"},
    "mroberta_E1":  {"arquitectura": "mRoBERTa",  "escenario": "E1", "corpus": "FakeDeS + augmentación sintética E1"},
}


class ModelInfoResponse(BaseModel):
    model_id: str
    hf_repo: str
    escenario: str
    arquitectura: str
    f1_fake: float
    f1_macro: float
    accuracy: float
    recall_fake: float
    corpus: str
    is_active: bool


@router.get("/model-info", response_model=ModelInfoResponse)
async def model_info(model_id: str = "mrbert-es_E1"):
    if model_id not in MODELOS:
        raise HTTPException(status_code=400, detail=f"model_id inválido: {model_id}")
    m = _METRICAS[model_id]
    info = _INFO[model_id]
    return {
        "model_id": model_id,
        "hf_repo": MODELOS[model_id],
        "escenario": info["escenario"],
        "arquitectura": info["arquitectura"],
        "f1_fake": m["f1_fake"],
        "f1_macro": m["f1_macro"],
        "accuracy": m["accuracy"],
        "recall_fake": m["recall_fake"],
        "corpus": info["corpus"],
        "is_active": classifier_service.active_model_id == model_id,
    }

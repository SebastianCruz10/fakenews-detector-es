import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.classifier import classifier_service, MODELOS

logger = logging.getLogger(__name__)
router = APIRouter()

# Cargado una sola vez al importar el módulo; falla en startup si el archivo no existe
_JSON_PATH = Path(__file__).parent.parent / "data" / "resultados_finetune.json"

try:
    _MODELO_DATA: dict = json.loads(_JSON_PATH.read_text(encoding="utf-8"))
except Exception as exc:
    logger.error("No se pudo cargar %s: %s", _JSON_PATH, exc)
    _MODELO_DATA = {}


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
    if model_id not in _MODELO_DATA:
        raise HTTPException(status_code=500, detail=f"Métricas no disponibles para {model_id}")
    data = _MODELO_DATA[model_id]
    return {
        "model_id": model_id,
        "hf_repo": MODELOS[model_id],
        "escenario": data["escenario"],
        "arquitectura": data["arquitectura"],
        "f1_fake": data["f1_fake"],
        "f1_macro": data["f1_macro"],
        "accuracy": data["accuracy"],
        "recall_fake": data["recall_fake"],
        "corpus": data["corpus"],
        "is_active": classifier_service.active_model_id == model_id,
    }

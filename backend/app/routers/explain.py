from typing import List
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from app.services.classifier import classifier_service, MODELOS
from app.services.explainer import explainer_service
from app.limiter import limiter

router = APIRouter()


class ExplainRequest(BaseModel):
    text: str = Field(min_length=50)
    model_id: str = "mrbert-es_E1"


class TokenShap(BaseModel):
    token: str
    shap_value: float
    position: int


class ExplainResponse(BaseModel):
    tokens: List[TokenShap]


@router.post("/explain", response_model=ExplainResponse)
@limiter.limit("10/minute")
async def explain(http_request: Request, request: ExplainRequest):
    if request.model_id not in MODELOS:
        raise HTTPException(status_code=400, detail=f"model_id inválido: {request.model_id}")
    if classifier_service.active_model_id != request.model_id:
        classifier_service.load_model(request.model_id)
    palabras = request.text.split()
    texto_shap = " ".join(palabras[:100]) if len(palabras) > 100 else request.text
    tokens = explainer_service.explain(texto_shap, classifier_service)
    return {"tokens": tokens}

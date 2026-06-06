from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.classifier import classifier_service, MODELOS

router = APIRouter()


class PredictRequest(BaseModel):
    text: str
    model_id: str = "mrbert-es_E1"


class PredictResponse(BaseModel):
    label: str
    confidence: float
    probabilities: dict
    model_id: str


@router.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    if request.model_id not in MODELOS:
        raise HTTPException(status_code=400, detail=f"model_id inválido: {request.model_id}")
    if classifier_service.active_model_id != request.model_id:
        classifier_service.load_model(request.model_id)
    return classifier_service.predict(request.text)

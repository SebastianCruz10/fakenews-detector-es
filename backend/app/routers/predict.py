"""
routers/predict.py — Endpoint de clasificación de noticias.

Responsabilidades:
- Recibir texto plano o URL de noticia
- Delegar en ClassifierService para obtener etiqueta y probabilidades
- Devolver: label (REAL/FAKE), confidence score, y probabilidades por clase
"""

from fastapi import APIRouter

# from app.services.classifier import ClassifierService
# from app.models.schemas import PredictRequest, PredictResponse

router = APIRouter()


# @router.post("/", response_model=PredictResponse)
# async def predict(request: PredictRequest):
#     """
#     Clasifica una noticia como REAL o FAKE.
#
#     Body:
#         text (str): texto de la noticia (mínimo 20 caracteres)
#         url  (str, opcional): URL para extracción automática del contenido
#
#     Returns:
#         PredictResponse con label, confidence y probabilidades
#     """
#     result = await ClassifierService.predict(request.text)
#     return result

"""
routers/model_info.py — Endpoint de metadatos del modelo en producción.

Responsabilidades:
- Exponer nombre, versión y arquitectura base del modelo cargado
- Reportar métricas de evaluación (accuracy, F1, etc.) del experimento activo
- Indicar si el modelo está listo (warm) o todavía cargando
"""

from fastapi import APIRouter

# from app.services.classifier import ClassifierService
# from app.models.schemas import ModelInfoResponse

router = APIRouter()


# @router.get("/", response_model=ModelInfoResponse)
# async def model_info():
#     """
#     Devuelve metadatos del modelo activo.
#
#     Returns:
#         ModelInfoResponse con model_name, base_architecture,
#         experiment, metrics y status
#     """
#     return ClassifierService.get_info()

"""
routers/explain.py — Endpoint de explicabilidad (SHAP / atención).

Responsabilidades:
- Recibir texto ya clasificado
- Delegar en ExplainerService para calcular valores SHAP o pesos de atención
- Devolver lista de tokens con su contribución (positiva/negativa) a la predicción
- Opcionalmente devolver HTML con highlighting listo para el frontend
"""

from fastapi import APIRouter

# from app.services.explainer import ExplainerService
# from app.models.schemas import ExplainRequest, ExplainResponse

router = APIRouter()


# @router.post("/", response_model=ExplainResponse)
# async def explain(request: ExplainRequest):
#     """
#     Genera explicación token-level para una predicción.
#
#     Body:
#         text  (str): mismo texto enviado a /predict
#         label (str): label devuelto por /predict (para anclar la clase explicada)
#
#     Returns:
#         ExplainResponse con lista de {token, shap_value} y html_highlight
#     """
#     result = await ExplainerService.explain(request.text, request.label)
#     return result
